# -*- coding: utf-8 -*-
"""JolBondhu Complete Backend - With OpenRouter Free Tier"""

import os
import time
import json
import warnings
import pickle
import numpy as np
import pandas as pd
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
from fastapi.responses import StreamingResponse
import asyncio
from openai import OpenAI

# FastAPI imports
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Suppress warnings
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# ================================================================
# OPENROUTER CONFIGURATION (FREE TIER)
# ================================================================

OPENROUTER_API_KEY = "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"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_MODEL = "deepseek/deepseek-r1:free"

openrouter_client = None
OPENROUTER_AVAILABLE = False

try:
    if OPENROUTER_API_KEY and len(OPENROUTER_API_KEY) > 20:
        openrouter_client = OpenAI(
            api_key=OPENROUTER_API_KEY,
            base_url=OPENROUTER_BASE_URL,
        )
        OPENROUTER_AVAILABLE = True
        print("=" * 60)
        print("✅ OpenRouter Free Tier configured successfully!")
        print(f"   Model: {OPENROUTER_MODEL}")
        print("=" * 60)
    else:
        print("⚠️ OpenRouter API key not found")
except Exception as e:
    print(f"⚠️ OpenRouter init error: {e}")
    OPENROUTER_AVAILABLE = False

# ================================================================
# CONFIGURATION
# ================================================================

SEQUENCE_LENGTH = 30
GRID_ROWS = 24
GRID_COLS = 24
N_CHANNELS = 7
VAL_END = "2023-12-31"

# API Endpoints
NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
TOPO_URL = "https://api.opentopodata.org/v1/srtm30m"
METEO_FORECAST = "https://api.open-meteo.com/v1/forecast"

NASA_PARAMS = "PRECTOTCORR,T2M_MAX,T2M_MIN,WS2M,RH2M,GWETROOT,EVPTRNS"

# ================================================================
# PYDANTIC MODELS
# ================================================================

class PredictionRequest(BaseModel):
    lat: float
    lon: float
    rainfall: Optional[float] = None
    river_level: Optional[float] = None
    district: Optional[str] = None

class LocationRequest(BaseModel):
    lat: float
    lon: float
    timestamp: Optional[str] = None

class FloodPredictionRequest(BaseModel):
    lat: float
    lon: float
    rainfall_24h: Optional[float] = None
    river_level: Optional[float] = None
    soil_moisture: Optional[float] = None

class FarmerQuery(BaseModel):
    question: str
    location: Optional[LocationRequest] = None
    crop_type: Optional[str] = None

class EmergencyAnalysisRequest(BaseModel):
    location: LocationRequest
    situation: str
    urgency_level: str

class ChatRequest(BaseModel):
    question: str
    location: Optional[Dict] = None
    stream: bool = False

# ================================================================
# GLOBAL VARIABLES
# ================================================================

trained_models = {
    'xgb_model': None,
    'lstm_model': None,
    'unet_model': None,
    'scaler_lstm': None,
    'feature_cols': None,
    'sequence_length': SEQUENCE_LENGTH,
}

risk_cache = {}
geolocator = None
model = None
model_trained = False

# ================================================================
# BANGLADESH DISTRICTS DATABASE
# ================================================================

BANGLADESH_DISTRICTS = {
    "কুড়িগ্রাম": {"lat": 25.8054, "lon": 89.6362, "division": "রংপুর", "flood_risk": 0.95},
    "গাইবান্ধা": {"lat": 25.3287, "lon": 89.5281, "division": "রংপুর", "flood_risk": 0.85},
    "সুনামগঞ্জ": {"lat": 25.0659, "lon": 91.3950, "division": "সিলেট", "flood_risk": 0.98},
    "সিলেট": {"lat": 24.8918, "lon": 91.8830, "division": "সিলেট", "flood_risk": 0.85},
    "সিরাজগঞ্জ": {"lat": 24.4539, "lon": 89.7083, "division": "রাজশাহী", "flood_risk": 0.90},
    "জামালপুর": {"lat": 24.9375, "lon": 89.9373, "division": "ময়মনসিংহ", "flood_risk": 0.85},
    "ঢাকা": {"lat": 23.8103, "lon": 90.4125, "division": "ঢাকা", "flood_risk": 0.35},
    "চট্টগ্রাম": {"lat": 22.3569, "lon": 91.7832, "division": "চট্টগ্রাম", "flood_risk": 0.45},
    "খুলনা": {"lat": 22.8456, "lon": 89.5403, "division": "খুলনা", "flood_risk": 0.55},
    "বরিশাল": {"lat": 22.7010, "lon": 90.3535, "division": "বরিশাল", "flood_risk": 0.65},
    "রাজশাহী": {"lat": 24.3745, "lon": 88.6042, "division": "রাজশাহী", "flood_risk": 0.40},
    "রংপুর": {"lat": 25.7439, "lon": 89.2752, "division": "রংপুর", "flood_risk": 0.55},
}

# ================================================================
# HELPER FUNCTIONS
# ================================================================

def get_current_season():
    month = datetime.now().month
    if 3 <= month <= 6:
        return "খরিফ-১ (আউশ)"
    elif 7 <= month <= 10:
        return "খরিফ-২ (আমন)"
    else:
        return "রবি (বোরো)"

def get_recommended_crops(month):
    if 3 <= month <= 6:
        return "আউশ ধান, পাট, ভুট্টা, তিল"
    elif 7 <= month <= 10:
        return "আমন ধান, পাট, ভুট্টা, মুগ ডাল"
    else:
        return "বোরো ধান, গম, আলু, মসুর ডাল"

def generate_follow_up(question: str) -> List[str]:
    question_lower = question.lower()
    if any(word in question_lower for word in ['ধান', 'rice']):
        return ["ধান চাষের খরচ কত?", "বোরো ধানের সেরা জাত কোনটি?", "ধান ক্ষেতে রোগ দমন কিভাবে করব?"]
    elif any(word in question_lower for word in ['সার', 'fertilizer']):
        return ["ইউরিয়া সারের দাম কত?", "জৈব সার কিভাবে তৈরি করব?", "সার প্রয়োগের সঠিক সময় কখন?"]
    elif any(word in question_lower for word in ['বন্যা', 'flood']):
        return ["বন্যার আগে কী প্রস্তুতি নেব?", "বন্যার পর ফসল পুনরুদ্ধার কিভাবে করব?", "বন্যা সহনশীল ফসল কোনগুলো?"]
    return ["ধান চাষের খরচ কত?", "গম চাষের সেরা সময় কখন?", "কৃষি ঋণ কিভাবে পাবো?"]

def get_intelligent_response(question: str) -> Dict[str, Any]:
    """Fallback intelligent responses when API is unavailable"""
    question_lower = question.lower()
    
    if "ধান" in question_lower:
        return {
            "answer": """🌾 **ধান চাষ সম্পর্কে বিস্তারিত পরামর্শ:**

**১. বীজ বপন সময়:**
- বোরো ধান: নভেম্বর-ডিসেম্বর
- আমন ধান: জুন-জুলাই  
- আউশ ধান: মার্চ-এপ্রিল

**২. সার প্রয়োগ (প্রতি হেক্টর):**
- ইউরিয়া: ২৫০-৩০০ কেজি (৩ কিস্তিতে)
- টিএসপি: ১৫০-২০০ কেজি
- এমওপি: ১০০-১৫০ কেজি

**৩. সেচ ব্যবস্থাপনা:**
- বোরো ধান: নিয়মিত সেচ প্রয়োজন
- আমন ধান: বৃষ্টিনির্ভর

**৪. উৎপাদন খরচ ও লাভ:**
- প্রতি হেক্টর খরচ: ৫০,০০০-৬৫,০০০ টাকা
- সম্ভাব্য উৎপাদন: ৬-৮ টন/হেক্টর
- আনুমানিক লাভ: ৮০,০০০-১,০০,০০০ টাকা

আরও বিস্তারিত জানতে চাইলে নির্দিষ্ট প্রশ্ন করুন! 🌱""",
            "model": "JolBondhu_AI"
        }
    
    elif "গম" in question_lower:
        return {
            "answer": """🌾 **গম চাষ সম্পর্কে পরামর্শ:**

**বপন সময়:** 
নভেম্বরের মাঝামাঝি থেকে ডিসেম্বরের প্রথম সপ্তাহ

**সার প্রয়োগ (প্রতি হেক্টর):**
- টিএসপি: ১৫০ কেজি
- এমওপি: ১০০ কেজি  
- ইউরিয়া: ২০০ কেজি (২ কিস্তিতে)

**সেচ সময়সূচি:**
- ১ম সেচ: ২০-২৫ দিন পর
- ২য় সেচ: ৪০-৪৫ দিন পর
- ৩য় সেচ: ৬০-৬৫ দিন পর

**উৎপাদন:**
- গড় ফলন: ৩-৩.৫ টন/হেক্টর
- লাভ: ৬০,০০০-৭০,০০০ টাকা/হেক্টর

বিস্তারিত জানতে চাইলে প্রশ্ন করুন! 🌾""",
            "model": "JolBondhu_AI"
        }
    
    elif "বন্যা" in question_lower:
        return {
            "answer": """🌊 **বন্যা মোকাবেলায় করণীয়:**

**বন্যার আগে প্রস্তুতি:**
১. উঁচু স্থানে ফসলের বীজ ও সার সরিয়ে রাখুন
২. গবাদিপশুর জন্য নিরাপদ আশ্রয় তৈরি করুন
৩. ড্রেনেজ ব্যবস্থা পরিষ্কার করুন
৪. জরুরি খাদ্য, পানি ও ওষুধ মজুত রাখুন

**বন্যার সময় করণীয়:**
১. বৈদ্যুতিক সংযোগ বিচ্ছিন্ন রাখুন
২. বিশুদ্ধ পানি ব্যবহার করুন
৩. জরুরি নম্বরে যোগাযোগ করুন (৯৯৯)

**বন্যার পরে ব্যবস্থা:**
১. ক্ষয়ক্ষতি মূল্যায়ন করুন
২. স্থানীয় কৃষি অফিসে রিপোর্ট করুন
৩. দ্রুত বর্ধনশীল ফসল চাষ করুন

সরকারি সাহায্যের জন্য: ১৬১২৩ 📞""",
            "model": "JolBondhu_AI"
        }
    
    elif "ঋণ" in question_lower:
        return {
            "answer": """💰 **কৃষি ঋণ সম্পর্কে তথ্য:**

**সরকারি কৃষি ঋণ স্কিম:**
- কিসান ক্রেডিট কার্ড: সর্বোচ্চ ৫,০০,০০০ টাকা
- সুদের হার: মাত্র ৪%
- মেয়াদ: ৩ বছর

**প্রয়োজনীয় কাগজপত্র:**
- জাতীয় পরিচয়পত্র
- জমির দলিল/খতিয়ান
- পাসপোর্ট সাইজ ছবি

**যেসব ব্যাংক ঋণ দেয়:**
- বাংলাদেশ কৃষি ব্যাংক
- সোনালী ব্যাংক
- জনতা ব্যাংক

বিস্তারিত জানতে ১৬১২৩ নম্বরে কল করুন 📞""",
            "model": "JolBondhu_AI"
        }
    
    else:
        current_season = get_current_season()
        current_month = datetime.now().month
        return {
            "answer": f"""🤖 **আপনাকে স্বাগতম! আমি JolBondhu, আপনার কৃষি সহকারী।**

**আপনি যা জানতে পারেন:**
🌾 ধান চাষ - বীজ বপন থেকে সংগ্রহ পর্যন্ত সম্পূর্ণ গাইড
🌾 গম চাষ - শীতকালীন ফসলের আধুনিক পদ্ধতি
🌱 সার ব্যবস্থাপনা - বিজ্ঞানসম্মত সার প্রয়োগ পদ্ধতি
💰 কৃষি ঋণ - সরকারি সহায়তা ও ঋণ স্কিম
🌊 বন্যা ব্যবস্থাপনা - বন্যার আগে, সময় ও পরে করণীয়

**বর্তমান মৌসুম:** {current_season}
**এই মৌসুমের সেরা ফসল:** {get_recommended_crops(current_month)}

**উদাহরণ প্রশ্ন:**
• "ধান চাষের খরচ কত?"
• "গম চাষের সেরা সময় কখন?"
• "কৃষি ঋণ কিভাবে পাবো?"

**জরুরি সাহায্যের জন্য:** ১৬১২৩ (কৃষি হেল্পলাইন) 📞""",
            "model": "JolBondhu_AI"
        }

# ================================================================
# NASA POWER API FUNCTIONS
# ================================================================

def _date_to_nasa(date_str):
    return date_str.replace('-', '')

def get_nasa_rainfall(lat: float, lon: float):
    """Fetch rainfall data from NASA POWER API"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        params = {
            "parameters": NASA_PARAMS,
            "community": "AG",
            "longitude": lon,
            "latitude": lat,
            "start": _date_to_nasa(start_date.strftime('%Y-%m-%d')),
            "end": _date_to_nasa(end_date.strftime('%Y-%m-%d')),
            "format": "JSON",
        }
        
        response = requests.get(NASA_POWER_URL, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if "properties" not in data:
            return {"rainfall_3_days_mm": 0.0, "rainfall_7_days_mm": 0.0, "temperature_c": 25.0, "humidity_percent": 70.0}
        
        params_data = data['properties']['parameter']
        rain_data = params_data.get('PRECTOTCORR', {})
        
        valid_rain = [v for v in rain_data.values() if v is not None and v != -999.0]
        
        R3 = sum(valid_rain[-3:]) if len(valid_rain) >= 3 else 0
        R7 = sum(valid_rain[-7:]) if len(valid_rain) >= 7 else sum(valid_rain)
        
        temp_data = params_data.get('T2M', {})
        valid_temp = [v for v in temp_data.values() if v is not None and v != -999.0]
        avg_temp_c = 25.0
        if valid_temp:
            avg_temp_kelvin = sum(valid_temp) / len(valid_temp)
            if 200 < avg_temp_kelvin < 350:
                avg_temp_c = avg_temp_kelvin - 273.15
        
        humidity_data = params_data.get('RH2M', {})
        valid_humidity = [v for v in humidity_data.values() if v is not None and v != -999.0]
        avg_humidity = 70.0
        if valid_humidity:
            avg_humidity = sum(valid_humidity) / len(valid_humidity)
            avg_humidity = max(0, min(100, avg_humidity))
        
        return {"rainfall_3_days_mm": round(R3, 2), "rainfall_7_days_mm": round(R7, 2), 
                "temperature_c": round(avg_temp_c, 1), "humidity_percent": round(avg_humidity, 1)}
        
    except Exception as e:
        print(f"NASA API Error: {e}")
        return {"rainfall_3_days_mm": 0.0, "rainfall_7_days_mm": 0.0, "temperature_c": 25.0, "humidity_percent": 70.0}

def get_district_from_coords(lat: float, lon: float) -> dict:
    """Find nearest district from coordinates"""
    min_distance = float('inf')
    nearest_district = None
    
    for name, data in BANGLADESH_DISTRICTS.items():
        dist = np.sqrt((lat - data["lat"])**2 + (lon - data["lon"])**2)
        if dist < min_distance:
            min_distance = dist
            nearest_district = name
    
    if nearest_district:
        return {"name": nearest_district, **BANGLADESH_DISTRICTS[nearest_district]}
    
    return {"name": "ঢাকা", "lat": 23.8103, "lon": 90.4125, "division": "ঢাকা", "flood_risk": 0.35}

def get_river_data(lat: float, lon: float):
    """Get river water levels"""
    rivers = {
        "ব্রহ্মপুত্র": {"lat": 25.8, "lon": 89.6, "danger_level": 20.5, "base_level": 8.5},
        "যমুনা": {"lat": 24.9, "lon": 89.9, "danger_level": 18.2, "base_level": 7.2},
        "পদ্মা": {"lat": 23.8, "lon": 89.8, "danger_level": 15.8, "base_level": 5.5},
        "মেঘনা": {"lat": 23.2, "lon": 90.7, "danger_level": 16.5, "base_level": 6.0},
    }
    
    nearest_river = min(rivers.items(), key=lambda x: geodesic((lat, lon), (x[1]["lat"], x[1]["lon"])).km)
    river_name, river_data = nearest_river
    
    month = datetime.now().month
    if month in [6, 7, 8, 9]:
        seasonal_factor = 1.5
    elif month in [5, 10]:
        seasonal_factor = 1.1
    else:
        seasonal_factor = 0.6
    
    current_level = round(river_data["base_level"] * seasonal_factor, 2)
    
    return {
        "river_name": river_name,
        "current_level": current_level,
        "danger_level": river_data["danger_level"],
        "trend": "বাড়ছে" if seasonal_factor > 1 else "কমছে",
        "distance_km": round(geodesic((lat, lon), (river_data["lat"], river_data["lon"])).km, 1)
    }

def calculate_flood_risk(lat: float, lon: float, weather_data: dict) -> dict:
    """Calculate flood risk"""
    R7 = weather_data.get("rainfall_7_days_mm", 0)
    risk_score = min(100, (R7 / 200) * 100)
    
    if risk_score < 30:
        risk_level = "নিম্ন"
    elif risk_score < 60:
        risk_level = "মধ্যম"
    else:
        risk_level = "উচ্চ"
    
    return {
        "risk_level": risk_level,
        "flood_risk_percent": risk_score,
        "confidence": 85
    }

def get_advice(risk_level: str, district_name: str = "") -> dict:
    advice_map = {
        "নিম্ন": {"title": "স্বাভাবিক অবস্থা", "message": f"{district_name} এলাকায় বর্তমান অবস্থা স্থিতিশীল।", "color": "#10b981"},
        "মধ্যম": {"title": "সতর্কতা প্রয়োজন", "message": f"{district_name} এলাকায় বৃষ্টিপাত বৃদ্ধি পাচ্ছে।", "color": "#f59e0b"},
        "উচ্চ": {"title": "জরুরি অবস্থা", "message": f"{district_name} এলাকায় বন্যার উচ্চ ঝুঁকি রয়েছে।", "color": "#f97316"}
    }
    return advice_map.get(risk_level, advice_map["নিম্ন"])

def get_immediate_recommendations(risk_level: str) -> List[str]:
    return ["আবহাওয়ার পূর্বাভাস পর্যবেক্ষণ করুন", "জরুরি নম্বর হাতে রাখুন"]

def get_preparation_recommendations(risk_level: str) -> List[str]:
    return ["জরুরি প্রস্তুতি তালিকা প্রস্তুত করুন", "নিরাপদ আশ্রয়ের অবস্থান জেনে রাখুন"]

def get_cached_risk_data(lat: float, lon: float, district_name: str = None):
    cache_key = f"{lat:.4f}_{lon:.4f}"
    
    if cache_key in risk_cache:
        cached_time, cached_data = risk_cache[cache_key]
        if time.time() - cached_time < 300:
            return cached_data, True, cache_key
    
    weather_data = get_nasa_rainfall(lat, lon)
    risk_data = calculate_flood_risk(lat, lon, weather_data)
    
    result = {"weather_data": weather_data, "risk_data": risk_data, "district": district_name, "timestamp": datetime.now().isoformat()}
    risk_cache[cache_key] = (time.time(), result)
    return result, False, cache_key

def initialize_geolocator():
    global geolocator
    try:
        geolocator = Nominatim(user_agent="jolbondhu_app", timeout=10)
        print("📍 Geolocator initialized")
    except Exception as e:
        print(f"⚠️ Geolocator error: {e}")
        geolocator = None

# ================================================================
# FASTAPI LIFESPAN AND APP
# ================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n" + "=" * 60)
    print("🚀 Starting JolBondhu API with OpenRouter Free Tier")
    print("=" * 60)
    print(f"📡 OpenRouter Status: {'✅ ACTIVE' if OPENROUTER_AVAILABLE else '⚠️ FALLBACK MODE'}")
    print("=" * 60 + "\n")
    
    initialize_geolocator()
    
    yield
    
    print("🛑 Shutting down JolBondhu API...")

app = FastAPI(
    title="JolBondhu Flood Risk Prediction API",
    description="Bangladesh Flood Risk Prediction System with OpenRouter Free AI",
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================================================
# CHAT ENDPOINTS
# ================================================================

@app.get("/chat/stream")
async def chat_stream(question: str):
    """SSE endpoint for streaming responses from OpenRouter"""
    print(f"📡 Streaming: {question}")
    
    async def generate_stream():
        try:
            if OPENROUTER_AVAILABLE and openrouter_client:
                print("🔄 Calling OpenRouter API...")
                
                system_prompt = f"""You are JolBondhu, an agricultural expert assistant for Bangladeshi farmers.
Always respond in Bangla (Bengali) using simple language.
Current Date: {datetime.now().strftime('%d %B, %Y')}
Current Season: {get_current_season()}

Provide practical advice with specific numbers. Be concise (3-5 paragraphs)."""

                response = openrouter_client.chat.completions.create(
                    model=OPENROUTER_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": question}
                    ],
                    temperature=0.7,
                    max_tokens=1000,
                    stream=True,
                    extra_headers={"HTTP-Referer": "http://localhost:3000", "X-Title": "JolBondhu AI"}
                )
                
                for chunk in response:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        yield f"data: {json.dumps({'content': content})}\n\n"
                        await asyncio.sleep(0.01)
                
                yield f"data: {json.dumps({'done': True})}\n\n"
                print("✅ Streaming completed")
                
            else:
                print("⚠️ Using fallback responses")
                fallback = get_intelligent_response(question)
                answer = fallback["answer"]
                words = answer.split()
                for i in range(0, len(words), 5):
                    chunk = " ".join(words[i:i+5])
                    yield f"data: {json.dumps({'content': chunk + ' '})}\n\n"
                    await asyncio.sleep(0.03)
                yield f"data: {json.dumps({'done': True})}\n\n"
                
        except Exception as e:
            print(f"❌ Stream error: {e}")
            fallback = get_intelligent_response(question)
            yield f"data: {json.dumps({'content': fallback['answer']})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )


@app.post("/chat/farmer")
async def chat_farmer_endpoint(query: FarmerQuery):
    """AI chatbot for farmers"""
    try:
        if OPENROUTER_AVAILABLE and openrouter_client:
            try:
                system_prompt = f"""You are JolBondhu, an agricultural expert assistant for Bangladeshi farmers.
Always respond in Bangla (Bengali). Current Season: {get_current_season()}"""
                
                response = openrouter_client.chat.completions.create(
                    model=OPENROUTER_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": query.question}
                    ],
                    temperature=0.7,
                    max_tokens=1000,
                    stream=False,
                    extra_headers={"HTTP-Referer": "http://localhost:3000", "X-Title": "JolBondhu AI"}
                )
                
                answer = response.choices[0].message.content
                
                return {
                    "status": "success",
                    "response": {
                        "question": query.question,
                        "topic": "agriculture",
                        "answer": answer,
                        "confidence": 95,
                        "sources": ["OpenRouter (DeepSeek)"],
                        "follow_up_questions": generate_follow_up(query.question),
                        "metadata": {"model": OPENROUTER_MODEL, "timestamp": datetime.now().isoformat()}
                    }
                }
            except Exception as e:
                print(f"OpenRouter error: {e}")
        
        response = get_intelligent_response(query.question)
        return {
            "status": "success",
            "response": {
                "question": query.question,
                "topic": "agriculture",
                "answer": response["answer"],
                "confidence": 85,
                "sources": ["বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট"],
                "follow_up_questions": generate_follow_up(query.question),
                "metadata": {"model": "JolBondhu_AI", "timestamp": datetime.now().isoformat()}
            }
        }
            
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ================================================================
# OTHER ENDPOINTS
# ================================================================

@app.get("/")
async def root():
    return {
        "message": "JolBondhu API",
        "version": "3.0.0",
        "status": "running",
        "openrouter_available": OPENROUTER_AVAILABLE,
        "features": ["flood-prediction", "ai-chatbot-streaming"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "openrouter_available": OPENROUTER_AVAILABLE,
        "streaming_enabled": True
    }

@app.get("/models/status")
async def get_models_status():
    return {
        "status": "success",
        "openrouter_available": OPENROUTER_AVAILABLE,
        "model": OPENROUTER_MODEL if OPENROUTER_AVAILABLE else "Fallback"
    }

@app.get("/predict")
async def predict_risk(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    district: Optional[str] = Query(None)
):
    try:
        district_info = get_district_from_coords(lat, lon)
        if district:
            district_info["name"] = district
        
        weather_data = get_nasa_rainfall(lat, lon)
        river_data = get_river_data(lat, lon)
        risk_data = calculate_flood_risk(lat, lon, weather_data)
        
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "location": {
                "latitude": lat,
                "longitude": lon,
                "district": district_info["name"],
                "division": district_info["division"],
                "flood_risk_factor": district_info["flood_risk"]
            },
            "weather_data": {
                "rainfall_mm": weather_data["rainfall_7_days_mm"],
                "rainfall_3_days": weather_data["rainfall_3_days_mm"],
                "river_level_m": river_data["current_level"],
                "humidity_percent": weather_data["humidity_percent"],
                "temperature_c": weather_data["temperature_c"]
            },
            "prediction": {
                "risk_level": risk_data["risk_level"],
                "risk_score": risk_data["flood_risk_percent"],
                "confidence": risk_data.get("confidence", 85),
                "probabilities": {"low": 30, "medium": 40, "high": 30, "very_high": 0}
            },
            "advice": get_advice(risk_data["risk_level"], district_info["name"]),
            "recommendations": {
                "immediate": get_immediate_recommendations(risk_data["risk_level"]),
                "preparation": get_preparation_recommendations(risk_data["risk_level"])
            }
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/districts")
async def get_districts_list():
    districts_list = []
    for name, data in BANGLADESH_DISTRICTS.items():
        risk_level = "নিম্ন"
        if data["flood_risk"] >= 0.7:
            risk_level = "উচ্চ"
        elif data["flood_risk"] >= 0.6:
            risk_level = "মধ্যম"
        
        districts_list.append({
            "name": name,
            "division": data["division"],
            "latitude": data["lat"],
            "longitude": data["lon"],
            "flood_risk_level": risk_level,
            "flood_risk_score": data["flood_risk"] * 100
        })
    
    return {"status": "success", "total_districts": len(districts_list), "districts": districts_list}

@app.delete("/cache")
async def clear_cache():
    global risk_cache
    count = len(risk_cache)
    risk_cache = {}
    return {"status": "success", "message": f"Cache cleared ({count} items)"}

# ================================================================
# MAIN ENTRY POINT
# ================================================================

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🌊 JolBondhu API with OpenRouter Free Tier")
    print("=" * 60)
    print("\n📡 Endpoints:")
    print("   GET  /chat/stream - AI Chat (Streaming)")
    print("   POST /chat/farmer - AI Chat (Regular)")
    print("   GET  /predict - Flood prediction")
    print("   GET  /districts - District list")
    print("\n🚀 Server: http://localhost:8000")
    print("=" * 60 + "\n")
    
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False, log_level="info")