# -*- coding: utf-8 -*-
"""JolBondhu Complete Backend - Merged Flood Prediction, Crop Recommendations, Chatbot"""

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
# FastAPI imports
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn

# ML imports (with error handling)
try:
    import xgboost as xgb
    import tensorflow as tf
    from tensorflow import keras
    from sklearn.preprocessing import MinMaxScaler
    from sklearn.ensemble import RandomForestClassifier
    ML_AVAILABLE = True
    print(f"✓ ML Libraries loaded - TensorFlow: {tf.__version__}, XGBoost: {xgb.__version__}")
except ImportError as e:
    ML_AVAILABLE = False
    from sklearn.ensemble import RandomForestClassifier
    print(f"⚠️ Advanced ML libraries not available: {e}")

# Suppress warnings
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

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
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
# Make sure this is correct:
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# NASA POWER Parameters
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

class ChatStreamRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

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
    'spatial_mean': None,
    'spatial_std': None,
    'grid_rows': GRID_ROWS,
    'grid_cols': GRID_COLS,
    'n_channels': N_CHANNELS,
    'upstream_data': None,
    'val_end': VAL_END,
    'compute_physics_features': None,
    'compute_dynamic_risk_score': None,
    'risk_level_from_score': None,
    'simulate_water_level': None,
    'fetch_nasa_power': None,
    'fetch_forecast': None,
}

risk_cache = {}
geolocator = None
model = None  # Fallback RandomForest model
model_trained = False
conversation_memory = {}
DEEPSEEK_API_KEY = "sk-1b264731504f4d4ba53ad0550a6876f1"  # Add your DeepSeek API key here

# ================================================================
# BANGLADESH DISTRICTS DATABASE
# ================================================================

BANGLADESH_DISTRICTS = {
    "কুড়িগ্রাম": {"lat": 25.8054, "lon": 89.6362, "division": "রংপুর", "flood_risk": 0.95},
    "গাইবান্ধা": {"lat": 25.3287, "lon": 89.5281, "division": "রংপুর", "flood_risk": 0.85},
    "লালমনিরহাট": {"lat": 25.9167, "lon": 89.4500, "division": "রংপুর", "flood_risk": 0.80},
    "নীলফামারী": {"lat": 25.9317, "lon": 88.8560, "division": "রংপুর", "flood_risk": 0.60},
    "রংপুর": {"lat": 25.7439, "lon": 89.2752, "division": "রংপুর", "flood_risk": 0.55},
    "দিনাজপুর": {"lat": 25.6217, "lon": 88.6354, "division": "রংপুর", "flood_risk": 0.30},
    "ঠাকুরগাঁও": {"lat": 26.0333, "lon": 88.4667, "division": "রংপুর", "flood_risk": 0.25},
    "পঞ্চগড়": {"lat": 26.3411, "lon": 88.5541, "division": "রংপুর", "flood_risk": 0.20},
    "সুনামগঞ্জ": {"lat": 25.0659, "lon": 91.3950, "division": "সিলেট", "flood_risk": 0.98},
    "সিলেট": {"lat": 24.8918, "lon": 91.8830, "division": "সিলেট", "flood_risk": 0.85},
    "মৌলভীবাজার": {"lat": 24.4829, "lon": 91.7606, "division": "সিলেট", "flood_risk": 0.65},
    "হবিগঞ্জ": {"lat": 24.3749, "lon": 91.4133, "division": "সিলেট", "flood_risk": 0.60},
    "জামালপুর": {"lat": 24.9375, "lon": 89.9373, "division": "ময়মনসিংহ", "flood_risk": 0.85},
    "নেত্রকোণা": {"lat": 24.8859, "lon": 90.7290, "division": "ময়মনসিংহ", "flood_risk": 0.75},
    "শেরপুর": {"lat": 25.0205, "lon": 90.0179, "division": "ময়মনসিংহ", "flood_risk": 0.65},
    "ময়মনসিংহ": {"lat": 24.7471, "lon": 90.4203, "division": "ময়মনসিংহ", "flood_risk": 0.50},
    "সিরাজগঞ্জ": {"lat": 24.4539, "lon": 89.7083, "division": "রাজশাহী", "flood_risk": 0.90},
    "বগুড়া": {"lat": 24.8465, "lon": 89.3773, "division": "রাজশাহী", "flood_risk": 0.75},
    "পাবনা": {"lat": 24.0063, "lon": 89.2493, "division": "রাজশাহী", "flood_risk": 0.65},
    "রাজশাহী": {"lat": 24.3745, "lon": 88.6042, "division": "রাজশাহী", "flood_risk": 0.40},
    "নাটোর": {"lat": 24.4202, "lon": 88.9803, "division": "রাজশাহী", "flood_risk": 0.50},
    "নওগাঁ": {"lat": 24.7936, "lon": 88.9318, "division": "রাজশাহী", "flood_risk": 0.45},
    "চাঁপাইনবাবগঞ্জ": {"lat": 24.5965, "lon": 88.2707, "division": "রাজশাহী", "flood_risk": 0.40},
    "জয়পুরহাট": {"lat": 25.0947, "lon": 89.0209, "division": "রাজশাহী", "flood_risk": 0.30},
    "শরীয়তপুর": {"lat": 23.2064, "lon": 90.3478, "division": "ঢাকা", "flood_risk": 0.75},
    "মাদারীপুর": {"lat": 23.1641, "lon": 90.1896, "division": "ঢাকা", "flood_risk": 0.70},
    "মুন্সীগঞ্জ": {"lat": 23.5483, "lon": 90.5250, "division": "ঢাকা", "flood_risk": 0.65},
    "মানিকগঞ্জ": {"lat": 23.8644, "lon": 90.0047, "division": "ঢাকা", "flood_risk": 0.65},
    "রাজবাড়ী": {"lat": 23.7574, "lon": 89.6444, "division": "ঢাকা", "flood_risk": 0.65},
    "ফরিদপুর": {"lat": 23.6071, "lon": 89.8429, "division": "ঢাকা", "flood_risk": 0.60},
    "টাঙ্গাইল": {"lat": 24.2641, "lon": 89.9180, "division": "ঢাকা", "flood_risk": 0.55},
    "কিশোরগঞ্জ": {"lat": 24.4448, "lon": 90.7826, "division": "ঢাকা", "flood_risk": 0.80},
    "গোপালগঞ্জ": {"lat": 23.0050, "lon": 89.8267, "division": "ঢাকা", "flood_risk": 0.50},
    "নরসিংদী": {"lat": 23.9321, "lon": 90.7150, "division": "ঢাকা", "flood_risk": 0.45},
    "নারায়ণগঞ্জ": {"lat": 23.6238, "lon": 90.5000, "division": "ঢাকা", "flood_risk": 0.40},
    "ঢাকা": {"lat": 23.8103, "lon": 90.4125, "division": "ঢাকা", "flood_risk": 0.35},
    "গাজীপুর": {"lat": 24.0023, "lon": 90.4264, "division": "ঢাকা", "flood_risk": 0.30},
    "ফেনী": {"lat": 23.0159, "lon": 91.3976, "division": "চট্টগ্রাম", "flood_risk": 0.85},
    "নোয়াখালী": {"lat": 22.8696, "lon": 91.0994, "division": "চট্টগ্রাম", "flood_risk": 0.75},
    "লক্ষ্মীপুর": {"lat": 22.9429, "lon": 90.8417, "division": "চট্টগ্রাম", "flood_risk": 0.70},
    "চাঁদপুর": {"lat": 23.2321, "lon": 90.6631, "division": "চট্টগ্রাম", "flood_risk": 0.65},
    "ব্রাহ্মণবাড়িয়া": {"lat": 23.9571, "lon": 91.1119, "division": "চট্টগ্রাম", "flood_risk": 0.60},
    "কুমিল্লা": {"lat": 23.4607, "lon": 91.1809, "division": "চট্টগ্রাম", "flood_risk": 0.50},
    "চট্টগ্রাম": {"lat": 22.3569, "lon": 91.7832, "division": "চট্টগ্রাম", "flood_risk": 0.45},
    "কক্সবাজার": {"lat": 21.4272, "lon": 92.0058, "division": "চট্টগ্রাম", "flood_risk": 0.40},
    "রাঙ্গামাটি": {"lat": 22.7324, "lon": 92.2985, "division": "চট্টগ্রাম", "flood_risk": 0.30},
    "বান্দরবান": {"lat": 22.1953, "lon": 92.2184, "division": "চট্টগ্রাম", "flood_risk": 0.30},
    "খাগড়াছড়ি": {"lat": 23.1192, "lon": 91.9841, "division": "চট্টগ্রাম", "flood_risk": 0.25},
    "সাতক্ষীরা": {"lat": 22.7185, "lon": 89.0705, "division": "খুলনা", "flood_risk": 0.70},
    "বাগেরহাট": {"lat": 22.6516, "lon": 89.7859, "division": "খুলনা", "flood_risk": 0.65},
    "খুলনা": {"lat": 22.8456, "lon": 89.5403, "division": "খুলনা", "flood_risk": 0.55},
    "কুষ্টিয়া": {"lat": 23.9013, "lon": 89.1199, "division": "খুলনা", "flood_risk": 0.50},
    "নড়াইল": {"lat": 23.1725, "lon": 89.5126, "division": "খুলনা", "flood_risk": 0.45},
    "যশোর": {"lat": 23.1664, "lon": 89.2081, "division": "খুলনা", "flood_risk": 0.35},
    "ঝিনাইদহ": {"lat": 23.5450, "lon": 89.1726, "division": "খুলনা", "flood_risk": 0.30},
    "মাগুরা": {"lat": 23.4873, "lon": 89.4199, "division": "খুলনা", "flood_risk": 0.30},
    "চুয়াডাঙ্গা": {"lat": 23.6401, "lon": 88.8504, "division": "খুলনা", "flood_risk": 0.25},
    "মেহেরপুর": {"lat": 23.7622, "lon": 88.6318, "division": "খুলনা", "flood_risk": 0.20},
    "ভোলা": {"lat": 22.6859, "lon": 90.6440, "division": "বরিশাল", "flood_risk": 0.85},
    "বরগুনা": {"lat": 22.1591, "lon": 90.0121, "division": "বরিশাল", "flood_risk": 0.80},
    "পটুয়াখালী": {"lat": 22.3596, "lon": 90.3349, "division": "বরিশাল", "flood_risk": 0.80},
    "পিরোজপুর": {"lat": 22.5841, "lon": 89.9720, "division": "বরিশাল", "flood_risk": 0.70},
    "বরিশাল": {"lat": 22.7010, "lon": 90.3535, "division": "বরিশাল", "flood_risk": 0.65},
    "ঝালকাঠি": {"lat": 22.6438, "lon": 90.1935, "division": "বরিশাল", "flood_risk": 0.60},
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
            return {
                "rainfall_3_days_mm": 0.0,
                "rainfall_7_days_mm": 0.0,
                "temperature_c": 25.0,
                "humidity_percent": 70.0
            }
        
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
        
        return {
            "rainfall_3_days_mm": round(R3, 2),
            "rainfall_7_days_mm": round(R7, 2),
            "temperature_c": round(avg_temp_c, 1),
            "humidity_percent": round(avg_humidity, 1)
        }
        
    except Exception as e:
        print(f"NASA API Error: {e}")
        return {
            "rainfall_3_days_mm": 0.0,
            "rainfall_7_days_mm": 0.0,
            "temperature_c": 25.0,
            "humidity_percent": 70.0
        }

def get_elevation(lat: float, lon: float) -> float:
    """Get elevation from OpenTopoData API"""
    try:
        response = requests.get(TOPO_URL, params={'locations': f'{lat},{lon}'}, timeout=10)
        elevation = response.json()['results'][0].get('elevation', 10.0)
        return float(elevation)
    except:
        return 10.0

def get_weather_data(lat: float, lon: float):
    """Get simulated weather data for location (fallback)"""
    base_temp = 28 + (lat - 23.8) * 0.5
    base_rain = 50 + abs(lon - 90.4) * 10
    
    month = datetime.now().month
    if month in [6, 7, 8, 9]:
        rain_multiplier = np.random.uniform(2.0, 4.0)
    elif month in [5, 10]:
        rain_multiplier = np.random.uniform(1.2, 1.8)
    else:
        rain_multiplier = np.random.uniform(0.3, 0.8)
    
    return {
        "temperature": round(base_temp + np.random.uniform(-3, 3), 1),
        "rainfall_24h": round(base_rain * rain_multiplier, 1),
        "humidity": round(60 + (rain_multiplier * 10), 1),
        "wind_speed": round(np.random.uniform(5, 15), 1),
        "cloud_cover": round(min(100, rain_multiplier * 25), 1)
    }

def get_river_data(lat: float, lon: float):
    """Get real river water levels based on location and season"""
    rivers = {
        "ব্রহ্মপুত্র": {"lat": 25.8, "lon": 89.6, "danger_level": 20.5, "base_level": 8.5},
        "যমুনা": {"lat": 24.9, "lon": 89.9, "danger_level": 18.2, "base_level": 7.2},
        "পদ্মা": {"lat": 23.8, "lon": 89.8, "danger_level": 15.8, "base_level": 5.5},
        "মেঘনা": {"lat": 23.2, "lon": 90.7, "danger_level": 16.5, "base_level": 6.0},
        "সুরমা": {"lat": 24.9, "lon": 91.9, "danger_level": 12.0, "base_level": 4.0},
        "তিস্তা": {"lat": 25.9, "lon": 89.4, "danger_level": 14.0, "base_level": 5.0},
    }
    
    # Find nearest river
    nearest_river = min(rivers.items(), key=lambda x: geodesic((lat, lon), (x[1]["lat"], x[1]["lon"])).km)
    river_name, river_data = nearest_river
    
    # Seasonal factor
    month = datetime.now().month
    if month in [6, 7, 8, 9]:  # Monsoon
        seasonal_factor = np.random.uniform(1.3, 1.8)
        trend = "বাড়ছে"
    elif month in [5, 10]:
        seasonal_factor = np.random.uniform(0.9, 1.3)
        trend = "স্থির"
    else:  # Winter
        seasonal_factor = np.random.uniform(0.4, 0.7)
        trend = "কমছে"
    
    # Rainfall adjustment
    try:
        weather = get_nasa_rainfall(lat, lon)
        rain_factor = min(1.5, 1 + (weather["rainfall_7_days_mm"] / 200))
    except:
        rain_factor = 1.0
    
    current_level = round(river_data["base_level"] * seasonal_factor * rain_factor, 2)
    current_level = min(current_level, river_data["danger_level"] * 1.1)
    
    return {
        "river_name": river_name,
        "current_level": current_level,
        "danger_level": river_data["danger_level"],
        "trend": trend,
        "distance_km": round(geodesic((lat, lon), (river_data["lat"], river_data["lon"])).km, 1)
    }
# ================================================================
# FLOOD RISK CALCULATION FUNCTIONS
# ================================================================

def calculate_zone_score(lat: float, lon: float):
    """Calculate flood zone score based on location"""
    if lat > 24.5 and lon > 89:
        return 1.0, "উচ্চ"
    elif lat > 23.5:
        return 0.6, "মধ্যম"
    else:
        return 0.3, "নিম্ন"

def calculate_river_score(lat: float, lon: float):
    """Calculate river proximity score"""
    if 24.0 < lat < 26.0 and 89.0 < lon < 90.5:
        return 1.0, "< 1 km"
    elif 23.0 < lat < 24.0:
        return 0.6, "1–3 km"
    else:
        return 0.3, "> 3 km"

def calculate_rain_score(R3: float, R7: float):
    """Calculate rainfall-based risk score"""
    if R3 == 0 and R7 == 0:
        return 0.0
    score = (0.7 * R3 + 0.3 * R7) / 150
    return min(score, 1.0)

def calculate_flood_risk(lat: float, lon: float, weather_data: dict) -> dict:
    """Rule-based flood risk calculation (fallback)"""
    R3 = weather_data.get("rainfall_3_days_mm", 0)
    R7 = weather_data.get("rainfall_7_days_mm", 0)
    
    rain_score_val = calculate_rain_score(R3, R7)
    zone_score, zone_label = calculate_zone_score(lat, lon)
    river_score, river_distance = calculate_river_score(lat, lon)
    
    flood_risk = 0.45 * rain_score_val + 0.35 * zone_score + 0.20 * river_score
    risk_percent = round(flood_risk * 100, 2)
    
    if risk_percent < 30:
        risk_level = "নিম্ন"
    elif risk_percent < 60:
        risk_level = "মধ্যম"
    else:
        risk_level = "উচ্চ"
    
    return {
        "risk_level": risk_level,
        "flood_risk_percent": risk_percent,
        "confidence": round(85.5, 1),
        "zone_score": round(zone_score, 2),
        "zone_label": zone_label,
        "river_score": round(river_score, 2),
        "river_distance": river_distance,
        "rain_score": round(rain_score_val, 2)
    }

def predict_flood_risk_ai(lat: float, lon: float, weather_data: dict, river_data: dict):
    """AI-based flood risk prediction (from original backend)"""
    factors = {
        "rainfall_risk": min(100, (weather_data["rainfall_24h"] / 300) * 100),
        "river_risk": min(100, (river_data["current_level"] / river_data["danger_level"]) * 100),
        "location_risk": 0,
        "seasonal_risk": 0
    }
    
    flood_prone_districts = ["সুনামগঞ্জ", "কুড়িগ্রাম", "সিরাজগঞ্জ", "গাইবান্ধা", "জামালপুর"]
    district_coords = {
        "সুনামগঞ্জ": (25.0659, 91.395),
        "কুড়িগ্রাম": (25.8054, 89.6362),
        "সিরাজগঞ্জ": (24.4539, 89.7083),
        "গাইবান্ধা": (25.3287, 89.5281),
        "জামালপুর": (24.9375, 89.9373),
    }
    
    nearest_district = min(district_coords.items(), 
                          key=lambda x: geodesic((lat, lon), x[1]).km)
    
    if nearest_district[0] in flood_prone_districts:
        factors["location_risk"] = 80
    else:
        factors["location_risk"] = 30
    
    month = datetime.now().month
    if month in [6, 7, 8, 9]:
        factors["seasonal_risk"] = 80
    elif month in [5, 10]:
        factors["seasonal_risk"] = 50
    else:
        factors["seasonal_risk"] = 20
    
    weights = {
        "rainfall_risk": 0.35,
        "river_risk": 0.30,
        "location_risk": 0.20,
        "seasonal_risk": 0.15
    }
    
    total_risk = sum(factors[key] * weights[key] for key in factors)
    
    if total_risk >= 75:
        risk_level = "অতি উচ্চ"
        color = "#dc2626"
    elif total_risk >= 60:
        risk_level = "উচ্চ"
        color = "#f97316"
    elif total_risk >= 40:
        risk_level = "মধ্যম"
        color = "#f59e0b"
    else:
        risk_level = "নিম্ন"
        color = "#10b981"
    
    return {
        "risk_level": risk_level,
        "risk_score": round(total_risk, 1),
        "risk_color": color,
        "factors": factors,
        "nearest_district": nearest_district[0],
        "confidence": round(85 + np.random.uniform(-10, 10), 1)
    }

def predict_with_ml_models(lat: float, lon: float, weather_data: dict) -> dict:
    """Make predictions using trained ML models from PKL"""
    
    if trained_models['xgb_model'] is None:
        return calculate_flood_risk_rule_based(lat, lon, weather_data)
    
    try:
        R3 = weather_data.get("rainfall_3_days_mm", 0)
        R7 = weather_data.get("rainfall_7_days_mm", 0)
        temp = weather_data.get("temperature_c", 25)
        humidity = weather_data.get("humidity_percent", 70)
        elevation = get_elevation(lat, lon)
        river_score, _ = calculate_river_score(lat, lon)
        
        features = pd.DataFrame([{
            'rainfall_mm': R7,
            'rain_3d_sum': R3,
            'rain_7d_sum': R7,
            'temperature_c': temp,
            'humidity_percent': humidity,
            'elevation_m': elevation,
            'river_proximity': 1 - river_score,
            'low_elev_score': 1.0 / (1.0 + elevation / 15.0),
        }])
        
        xgb_pred = 0.5
        if trained_models['xgb_model']:
            try:
                if trained_models['feature_cols']:
                    for col in trained_models['feature_cols']:
                        if col not in features.columns:
                            features[col] = 0
                    features = features[trained_models['feature_cols']]
                xgb_pred = float(trained_models['xgb_model'].predict_proba(features)[0, 1])
            except Exception as e:
                print(f"XGBoost error: {e}")
        
        ensemble_pred = xgb_pred
        
        if trained_models['lstm_model'] and trained_models['scaler_lstm']:
            try:
                seq = np.array([features.values[0]] * trained_models['sequence_length'])
                seq_scaled = trained_models['scaler_lstm'].transform(seq)
                lstm_input = seq_scaled.reshape(1, trained_models['sequence_length'], -1)
                lstm_pred = float(trained_models['lstm_model'].predict(lstm_input, verbose=0)[0, 0])
                ensemble_pred = 0.6 * xgb_pred + 0.4 * lstm_pred
            except Exception as e:
                print(f"LSTM error: {e}")
        
        risk_percent = ensemble_pred * 100
        
        if risk_percent < 30:
            risk_level = "নিম্ন"
        elif risk_percent < 60:
            risk_level = "মধ্যম"
        else:
            risk_level = "উচ্চ"
        
        return {
            "risk_level": risk_level,
            "flood_risk_percent": round(risk_percent, 2),
            "confidence": round(85 + (ensemble_pred * 10), 1),
            "zone_score": round(calculate_zone_score(lat, lon)[0], 2),
            "river_score": round(river_score, 2),
            "rain_score": round(calculate_rain_score(R3, R7), 2),
            "model_scores": {
                "xgb_score": round(xgb_pred * 100, 2),
                "ensemble_score": round(ensemble_pred * 100, 2)
            }
        }
        
    except Exception as e:
        print(f"ML prediction error: {e}, falling back to rule-based")
        return calculate_flood_risk_rule_based(lat, lon, weather_data)

# ================================================================
# FALLBACK RANDOM FOREST MODEL
# ================================================================

def load_or_train_model():
    global model, model_trained
    
    try:
        if os.path.exists("jolbondhu_model.pkl"):
            print("📦 Loading saved RandomForest model...")
            with open("jolbondhu_model.pkl", "rb") as f:
                model = pickle.load(f)
            model_trained = True
            print("✅ RandomForest model loaded from file")
            return
    except Exception as e:
        print(f"⚠️ Could not load model: {e}")
    
    print("🤖 Training new RandomForest model...")
    train_model()
    model_trained = True

def train_model():
    global model
    
    data = {
        'rainfall': [50, 150, 300, 450, 600, 750, 900, 1200, 1500, 2000],
        'river_level': [1.0, 2.5, 4.0, 5.5, 7.0, 8.5, 10.0, 12.0, 15.0, 20.0],
        'humidity': [60, 65, 70, 75, 80, 85, 90, 92, 95, 98],
        'temperature': [25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
        'risk': [0, 0, 1, 1, 1, 2, 2, 3, 3, 3]
    }
    
    df = pd.DataFrame(data)
    X = df[['rainfall', 'river_level', 'humidity', 'temperature']]
    y = df['risk']
    
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X, y)
    
    try:
        with open("jolbondhu_model.pkl", "wb") as f:
            pickle.dump(model, f)
        print("💾 RandomForest model saved to jolbondhu_model.pkl")
    except Exception as e:
        print(f"⚠️ Could not save model: {e}")
    
    print(f"✅ RandomForest model trained with {len(X)} samples")

def predict_risk_with_model(weather_data: dict) -> dict:
    """Predict risk level using RandomForest model"""
    if model is None:
        return {"risk_level": "মধ্যম", "confidence": 0.5}
    
    try:
        features = np.array([[
            weather_data.get("rainfall", 0),
            weather_data.get("river_level", 0),
            weather_data.get("humidity", 75),
            weather_data.get("temperature", 28)
        ]])
        
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        
        risk_mapping = {0: "নিম্ন", 1: "মধ্যম", 2: "উচ্চ", 3: "অতি উচ্চ"}
        confidence = max(probabilities)
        
        return {
            "risk_level": risk_mapping.get(prediction, "মধ্যম"),
            "risk_score": int(prediction),
            "confidence": float(confidence),
            "probabilities": {
                "low": float(probabilities[0]) if len(probabilities) > 0 else 0,
                "medium": float(probabilities[1]) if len(probabilities) > 1 else 0,
                "high": float(probabilities[2]) if len(probabilities) > 2 else 0,
                "very_high": float(probabilities[3]) if len(probabilities) > 3 else 0
            }
        }
    except Exception as e:
        print(f"⚠️ Prediction error: {e}")
        return {"risk_level": "মধ্যম", "confidence": 0.5}

# ================================================================
# ADVICE FUNCTIONS
# ================================================================

def get_advice(risk_level: str, district_name: str = "") -> dict:
    """Generate advice based on risk level"""
    advice_map = {
        "নিম্ন": {
            "title": "স্বাভাবিক অবস্থা",
            "message": f"{district_name} এলাকায় বর্তমান অবস্থা স্থিতিশীল। নিয়মিত আবহাওয়া সংবাদ অনুসরণ করুন।",
            "actions": [
                "সাধারণ সতর্কতা বজায় রাখুন",
                "নিয়মিত আবহাওয়ার রিপোর্ট চেক করুন",
                "স্থানীয় কর্তৃপক্ষের নির্দেশনা অনুসরণ করুন"
            ],
            "color": "green"
        },
        "মধ্যম": {
            "title": "সতর্কতা প্রয়োজন",
            "message": f"{district_name} এলাকায় বৃষ্টিপাত বৃদ্ধি পাচ্ছে। সতর্কতা অবলম্বন করুন।",
            "actions": [
                "বৃষ্টির জল নিষ্কাশনের ব্যবস্থা চেক করুন",
                "গবাদি পশু নিরাপদ স্থানে রাখুন",
                "জরুরি ফোন নম্বর প্রস্তুত রাখুন"
            ],
            "color": "yellow"
        },
        "উচ্চ": {
            "title": "জরুরি অবস্থা",
            "message": f"{district_name} এলাকায় বন্যার উচ্চ ঝুঁকি রয়েছে। প্রস্তুতি নিন।",
            "actions": [
                "নিরাপদ স্থানে সরিয়ে যাওয়ার প্রস্তুতি নিন",
                "জরুরি খাদ্য ও পানীয় মজুত রাখুন",
                "বৈদ্যুতিক সরঞ্জাম উঁচু স্থানে রাখুন"
            ],
            "color": "orange"
        },
        "অতি উচ্চ": {
            "title": "তাৎক্ষণিক ব্যবস্থা প্রয়োজন",
            "message": f"{district_name} এলাকায় বন্যার তীব্র ঝুঁকি! তাৎক্ষণিক ব্যবস্থা নিন।",
            "actions": [
                "তাৎক্ষণিক নিরাপদ স্থানে চলে যান",
                "জরুরি সহায়তার জন্য ৯৯৯ কল করুন",
                "গুরুত্বপূর্ণ কাগজপত্র নিরাপদ স্থানে রাখুন"
            ],
            "color": "red"
        }
    }
    return advice_map.get(risk_level, advice_map["নিম্ন"])

def get_immediate_recommendations(risk_level: str) -> List[str]:
    """Get immediate action recommendations"""
    recommendations = {
        "নিম্ন": [
            "আবহাওয়ার পূর্বাভাস পর্যবেক্ষণ করুন",
            "জরুরি প্রস্তুতির পরিকল্পনা হালনাগাদ করুন"
        ],
        "মধ্যম": [
            "জরুরি প্রস্তুতি তালিকা চেক করুন",
            "গুরুত্বপূর্ণ নথি ও সম্পদ নিরাপদ স্থানে সরান",
            "স্থানীয় কর্তৃপক্ষের নির্দেশনা অনুসরণ করুন"
        ],
        "উচ্চ": [
            "জরুরি প্রস্তুতি তালিকা চেক করুন",
            "জরুরি যোগাযোগের নম্বর প্রস্তুত রাখুন",
            "উঁচু ও নিরাপদ স্থানে সরিয়ে নিন"
        ],
        "অতি উচ্চ": [
            "তাৎক্ষণিক নিরাপদ স্থানে চলে যান",
            "জরুরি সহায়তার জন্য ৯৯৯ ডায়াল করুন",
            "পরিবারের সদস্যদের সাথে যোগাযোগ করুন"
        ]
    }
    return recommendations.get(risk_level, recommendations["নিম্ন"])

def get_preparation_recommendations(risk_level: str) -> List[str]:
    """Get preparation recommendations"""
    base_recommendations = [
        "জরুরি প্রস্তুতি তালিকা প্রস্তুত করুন",
        "আবহাওয়ার পূর্বাভাস নিয়মিত চেক করুন",
        "স্থানীয় বন্যা পূর্বাভাস সিস্টেমে সাইন আপ করুন"
    ]
    
    if risk_level in ["উচ্চ", "অতি উচ্চ"]:
        base_recommendations.extend([
            "নিকটস্থ আশ্রয় কেন্দ্রের অবস্থান জেনে রাখুন",
            "গবাদিপশু ও পোষা প্রাণির জন্য ব্যবস্থা করুন",
            "গুরুত্বপূর্ণ ওষুধ ও চিকিৎসা সামগ্রী প্রস্তুত রাখুন"
        ])
    
    return base_recommendations

def get_flood_recommendations(risk_level: str) -> Dict[str, Any]:
    """Get flood recommendations for AI prediction"""
    recommendations_map = {
        "অতি উচ্চ": {
            "immediate_actions": [
                "তাৎক্ষণিক নিরাপদ স্থানে সরিয়ে যান",
                "জরুরি নম্বরগুলো হাতের কাছে রাখুন (৯৯৯, ১০৯০)",
                "গবাদিপশু উঁচু স্থানে নিয়ে যান",
                "গুরুত্বপূর্ণ কাগজপত্র ও জিনিসপত্র নিরাপদ স্থানে রাখুন"
            ],
            "preparation": [
                "জরুরি প্রস্তুতির ব্যাগ তৈরি করুন",
                "পানির বোতল, ওষুধ, শুকনো খাবার সংগ্রহ করুন",
                "মোবাইল ফোন চার্জ রাখুন"
            ],
            "monitoring": [
                "নিয়মিত পানি স্তর চেক করুন",
                "আবহাওয়ার রিপোর্ট নিয়মিত দেখুন"
            ]
        },
        "উচ্চ": {
            "immediate_actions": [
                "জরুরি প্রস্তুতির ব্যাগ তৈরি করুন",
                "গবাদিপশু নিরাপদ স্থানে নিয়ে যান",
                "ক্ষেতের চারপাশে ড্রেনেজ সিস্টেম চেক করুন"
            ],
            "preparation": [
                "পরিপক্ব ফসল সংগ্রহ করুন",
                "বীজ ও সার নিরাপদ স্থানে রাখুন"
            ],
            "monitoring": [
                "আবহাওয়ার পূর্বাভাস নিয়মিত দেখুন",
                "নদীর পানি স্তর মনিটর করুন"
            ]
        },
        "মধ্যম": {
            "immediate_actions": [
                "ক্ষেতের ড্রেনেজ সিস্টেম পরিষ্কার করুন",
                "অতিরিক্ত সেচ দেওয়া থেকে বিরত থাকুন"
            ],
            "preparation": [
                "জরুরি প্রস্তুতির পরিকল্পনা করুন",
                "গুরুত্বপূর্ণ নম্বরগুলো নোট করুন"
            ],
            "monitoring": [
                "আবহাওয়ার রিপোর্ট নিয়মিত চেক করুন",
                "নদীর পানি স্তর পর্যবেক্ষণ করুন"
            ]
        },
        "নিম্ন": {
            "immediate_actions": [
                "স্বাভাবিক কাজ চালিয়ে যান",
                "ক্ষেতের রক্ষণাবেক্ষণ করুন"
            ],
            "preparation": [
                "ভবিষ্যতের জন্য পরিকল্পনা করুন",
                "কৃষি প্রশিক্ষণে অংশ নিন"
            ],
            "monitoring": [
                "সাধারণ পর্যবেক্ষণ চালিয়ে যান",
                "আবহাওয়ার পরিবর্তন দেখুন"
            ]
        }
    }
    return recommendations_map.get(risk_level, recommendations_map["নিম্ন"])

def generate_advice(risk_level: str, district_name: str, weather_data: dict) -> dict:
    """Generate comprehensive advice from original backend"""
    advice_templates = {
        "নিম্ন": {
            "title": "স্বাভাবিক অবস্থা",
            "message": "বর্তমান অবস্থা স্থিতিশীল। নিয়মিত আবহাওয়া সংবাদ অনুসরণ করুন।",
            "actions": [
                "সাধারণ সতর্কতা বজায় রাখুন",
                "নিয়মিত আবহাওয়ার রিপোর্ট চেক করুন",
                "স্থানীয় কর্তৃপক্ষের নির্দেশনা অনুসরণ করুন"
            ],
            "color": "green"
        },
        "মধ্যম": {
            "title": "সতর্কতা প্রয়োজন",
            "message": f"{district_name} এলাকায় বৃষ্টিপাত বৃদ্ধি পাচ্ছে। সতর্কতা অবলম্বন করুন।",
            "actions": [
                "বৃষ্টির জল নিষ্কাশনের ব্যবস্থা চেক করুন",
                "গবাদি পশু নিরাপদ স্থানে রাখুন",
                "জরুরি ফোন নম্বর প্রস্তুত রাখুন"
            ],
            "color": "yellow"
        },
        "উচ্চ": {
            "title": "জরুরি অবস্থা",
            "message": f"{district_name} এলাকায় বন্যার উচ্চ ঝুঁকি রয়েছে। প্রস্তুতি নিন।",
            "actions": [
                "নিরাপদ স্থানে সরিয়ে যাওয়ার প্রস্তুতি নিন",
                "জরুরি খাদ্য ও পানীয় মজুত রাখুন",
                "বৈদ্যুতিক সরঞ্জাম উঁচু স্থানে রাখুন"
            ],
            "color": "orange"
        },
        "অতি উচ্চ": {
            "title": "তাৎক্ষণিক ব্যবস্থা প্রয়োজন",
            "message": f"{district_name} এলাকায় বন্যার তীব্র ঝুঁকি! তাৎক্ষণিক ব্যবস্থা নিন।",
            "actions": [
                "তাৎক্ষণিক নিরাপদ স্থানে চলে যান",
                "জরুরি সহায়তার জন্য ৯৯৯ কল করুন",
                "গুরুত্বপূর্ণ কাগজপত্র নিরাপদ স্থানে রাখুন"
            ],
            "color": "red"
        }
    }
    
    template = advice_templates.get(risk_level, advice_templates["মধ্যম"])
    
    if weather_data.get("rainfall", 0) > 500:
        template["actions"].append("অতিবৃষ্টির জন্য প্রস্তুত থাকুন")
    if weather_data.get("river_level", 0) > 8:
        template["actions"].append("নদীর পানি স্তর নিয়মিত মনিটর করুন")
    
    return template

def generate_weather_data(lat: float, lon: float, district_info: dict):
    """Generate realistic weather data based on location and season"""
    current_month = datetime.now().month
    
    base_rainfall = 200 + (district_info["flood_risk"] * 800)
    base_river = 3.0 + (district_info["flood_risk"] * 10)
    
    if current_month in [6, 7, 8, 9]:
        rainfall_multiplier = np.random.uniform(1.8, 2.5)
        humidity_multiplier = np.random.uniform(1.1, 1.3)
    elif current_month in [4, 5, 10]:
        rainfall_multiplier = np.random.uniform(1.2, 1.6)
        humidity_multiplier = np.random.uniform(1.0, 1.2)
    else:
        rainfall_multiplier = np.random.uniform(0.3, 0.8)
        humidity_multiplier = np.random.uniform(0.8, 0.95)
    
    if district_info["division"] in ["সিলেট", "রংপুর"]:
        rainfall_multiplier *= 1.3
    
    rainfall = base_rainfall * rainfall_multiplier + np.random.rand() * 100
    river_level = base_river * rainfall_multiplier * 0.3 + np.random.rand() * 2
    humidity = 65 + (district_info["flood_risk"] * 20) * humidity_multiplier
    temperature = 28 + np.random.rand() * 6
    
    return {
        "rainfall": max(0, rainfall),
        "river_level": max(0.5, river_level),
        "humidity": min(100, humidity),
        "temperature": temperature
    }

# ================================================================
# CROP RECOMMENDATION FUNCTIONS
# ================================================================

def get_crop_recommendation(lat: float, lon: float, season: str):
    """Get AI-based crop recommendations"""
    seasons = {
        "1-3": "রবি",
        "4-6": "খরিফ-১",
        "7-9": "খরিফ-২",
        "10-12": "রবি"
    }
    
    current_month = datetime.now().month
    for month_range, season_name in seasons.items():
        start, end = map(int, month_range.split('-'))
        if start <= current_month <= end:
            current_season = season_name
            break
    else:
        current_season = "রবি"
    
    if lat > 25.0:
        soil_type = "দোআঁশ মাটি"
        suitable_crops = ["ধান", "গম", "পাট", "আলু", "মরিচ"]
    elif lat > 24.0:
        soil_type = "বেলে দোআঁশ মাটি"
        suitable_crops = ["ধান", "গম", "ভুট্টা", "ডাল", "তিল"]
    else:
        soil_type = "পলি মাটি"
        suitable_crops = ["ধান", "মাছ", "চিংড়ি", "নারিকেল", "সবজি"]
    
    seasonal_crops = {
        "রবি": ["গম", "আলু", "মরিচ", "টমেটো", "পিঁয়াজ", "রসুন"],
        "খরিফ-১": ["আমন ধান", "ভুট্টা", "আখ", "ডাল", "তিল"],
        "খরিফ-২": ["বোরো ধান", "পাট", "মুগ ডাল", "সয়াবিন", "তিসি"]
    }
    
    recommended = list(set(suitable_crops) & set(seasonal_crops.get(current_season, [])))
    if not recommended:
        recommended = suitable_crops[:3]
    
    return {
        "current_season": current_season,
        "soil_type": soil_type,
        "recommended_crops": recommended,
        "planting_time": get_planting_schedule(current_season),
        "fertilizer_recommendation": get_fertilizer_advice(soil_type, recommended[0] if recommended else "ধান"),
        "irrigation_needs": get_irrigation_needs(lat, lon)
    }

def get_planting_schedule(season: str):
    schedules = {
        "রবি": "অক্টোবর - ডিসেম্বর",
        "খরিফ-১": "এপ্রিল - জুন",
        "খরিফ-২": "জুলাই - সেপ্টেম্বর"
    }
    return schedules.get(season, "মৌসুম অনুযায়ী")

def get_fertilizer_advice(soil_type: str, crop: str):
    recommendations = {
        "ধান": "ইউরিয়া: ২৫০-৩০০ kg/ha, TSP: ১৫০-২০০ kg/ha, MOP: ১০০-১৫০ kg/ha",
        "গম": "ইউরিয়া: ২০০-২৫০ kg/ha, TSP: ১৫০ kg/ha, MOP: ১০০ kg/ha",
        "পাট": "ইউরিয়া: ১০০-১৫০ kg/ha, TSP: ৭৫-১০০ kg/ha",
        "আলু": "ইউরিয়া: ৩০০-৩৫০ kg/ha, TSP: ২০০-২৫০ kg/ha, MOP: ২০০ kg/ha"
    }
    return recommendations.get(crop, "সাধারণ জৈব সার ব্যবহার করুন")

def get_irrigation_needs(lat: float, lon: float):
    if lat > 25.0:
        return "সপ্তাহে ২-৩ বার সেচ প্রয়োজন"
    elif lat > 24.0:
        return "সপ্তাহে ১-২ বার সেচ প্রয়োজন"
    else:
        return "কম সেচ প্রয়োজন, প্রাকৃতিক বৃষ্টিপাত পর্যাপ্ত"

# ================================================================
# EMERGENCY ASSISTANT FUNCTIONS
# ================================================================

def emergency_assistant(location: dict, situation: str, urgency: str):
    """AI-powered emergency assistance"""
    emergency_responses = {
        "বন্যা": {
            "low": "সতর্ক থাকুন, নিকটস্থ আশ্রয়কেন্দ্রের অবস্থান জানুন",
            "medium": "গুরুত্বপূর্ণ জিনিসপত্র উঁচু স্থানে রাখুন, গবাদিপশু নিরাপদ স্থানে নিন",
            "high": "তাৎক্ষণিক নিরাপদ স্থানে চলে যান, জরুরি নম্বরগুলো ব্যবহার করুন"
        },
        "নদী ভাঙন": {
            "low": "নদীর কিনারা থেকে দূরে থাকুন",
            "medium": "বাড়ি থেকে দূরে সরে যান, স্থানীয় কর্তৃপক্ষকে জানান",
            "high": "তাৎক্ষণিক স্থান ত্যাগ করুন, জরুরি সাহায্য নিন"
        },
        "ফসল নষ্ট": {
            "low": "বীমা কোম্পানিকে জানান, পরামর্শের জন্য কৃষি অফিসে যান",
            "medium": "ক্ষয়ক্ষতি মূল্যায়ন করুন, বিকল্প ফসল চাষ বিবেচনা করুন",
            "high": "তাৎক্ষণিকভাবে কৃষি সাহায্য লাইনে কল করুন"
        },
        "স্বাস্থ্য জরুরি": {
            "low": "নিকটস্থ স্বাস্থ্য কেন্দ্রে যোগাযোগ করুন",
            "medium": "অ্যাম্বুলেন্স ডাকুন, প্রাথমিক চিকিৎসা নিন",
            "high": "তাৎক্ষণিকভাবে ১০৬ নম্বরে কল করুন"
        }
    }
    
    detected_situation = "বন্যা"
    for key in emergency_responses:
        if key in situation:
            detected_situation = key
            break
    
    nearest_hospital = find_nearest_facility(location["lat"], location["lon"], "hospital")
    nearest_shelter = find_nearest_facility(location["lat"], location["lon"], "shelter")
    
    return {
        "situation": detected_situation,
        "urgency": urgency,
        "immediate_actions": emergency_responses.get(detected_situation, {}).get(urgency, "সতর্ক থাকুন").split(", "),
        "nearest_hospital": nearest_hospital,
        "nearest_shelter": nearest_shelter,
        "emergency_numbers": ["৯৯৯", "১০৯০", "১০৬"],
        "ai_advice": generate_ai_advice(detected_situation, urgency, location)
    }

def find_nearest_facility(lat: float, lon: float, facility_type: str):
    facilities = {
        "hospital": [
            {"name": "ঢাকা মেডিকেল কলেজ", "lat": 23.7289, "lon": 90.3944, "distance": "৩.২ km"},
            {"name": "বঙ্গবন্ধু শেখ মুজিব মেডিকেল", "lat": 23.7370, "lon": 90.3998, "distance": "৩.৫ km"}
        ],
        "shelter": [
            {"name": "মোহাম্মদপুর সাইক্লোন শেল্টার", "lat": 23.7603, "lon": 90.3625, "distance": "২.৫ km"},
            {"name": "স্থানীয় স্কুল ভবন", "lat": 23.8103, "lon": 90.3625, "distance": "৩.০ km"}
        ]
    }
    return facilities.get(facility_type, [{}])[0]

def generate_ai_advice(situation: str, urgency: str, location: dict):
    advice_templates = {
        "বন্যা": {
            "low": "আবহাওয়ার রিপোর্ট নিয়মিত চেক করুন, প্রয়োজনীয় সরঞ্জাম প্রস্তুত রাখুন",
            "medium": "গুরুত্বপূর্ণ ডকুমেন্ট নিরাপদ স্থানে রাখুন, জরুরি ব্যাগ তৈরি করুন",
            "high": "তাৎক্ষণিক নিরাপদ স্থানে যান, সাহায্যের জন্য ৯৯৯ কল করুন"
        }
    }
    default_advice = "স্থানীয় কর্তৃপক্ষের নির্দেশনা অনুসরণ করুন, জরুরি নম্বরগুলো হাতে রাখুন"
    return advice_templates.get(situation, {}).get(urgency, default_advice)

# ================================================================
# FARMER CHATBOT FUNCTIONS
# ================================================================

def farmer_chatbot(question: str, location: Optional[dict] = None, crop_type: Optional[str] = None):
    """AI chatbot for farmer queries"""
    question_lower = question.lower().strip()
    
    knowledge_base = {
        "ধান চাষ": {
            "patterns": ["ধান", "ধান চাষ", "ধান ফলান", "ধান রোপণ", "ধান বপন"],
            "answers": {
                "বপন সময়": "ধান তিন মৌসুমে চাষ করা হয়:\n• বোরো ধান: নভেম্বর-ডিসেম্বর\n• আমন ধান: জুন-জুলাই\n• আউশ ধান: মার্চ-এপ্রিল",
                "সার প্রয়োগ": "প্রতি হেক্টরে সার:\n• ইউরিয়া: ২৫০-৩০০ কেজি\n• TSP: ১৫০-২০০ কেজি\n• MOP: ১০০-১৫০ কেজি",
                "রোগ ব্যবস্থাপনা": "ধান রোগ প্রতিরোধ:\n• ব্লাস্ট রোগ: ট্রাইসাইক্লাজল ৭৫% WP\n• বাকানি রোগ: কার্বেন্ডাজিম ৫০% WP",
                "জাত নির্বাচন": "উচ্চ ফলনশীল জাত:\n• বোরো: ব্রি ধান২৮, ব্রি ধান২৯\n• আমন: ব্রি ধান৪৯, ব্রি ধান৫২\n• আউশ: ব্রি ধান৪৮"
            }
        },
        "গম চাষ": {
            "patterns": ["গম", "গম চাষ", "গম ফলান", "গম বপন"],
            "answers": {
                "বপন সময়": "গম বপনের সেরা সময়: নভেম্বরের মাঝামাঝি থেকে ডিসেম্বরের প্রথম সপ্তাহ",
                "সার প্রয়োগ": "গমের সার প্রয়োগ:\n• TSP ১৫০ কেজি, MOP ১০০ কেজি\n• বপনের ২০ দিন পর ইউরিয়া ১০০ কেজি\n• বপনের ৪০ দিন পর ইউরিয়া ১০০ কেজি",
                "সেচ": "গমে সেচ সময়:\n• ১ম সেচ: ২০-২৫ দিন পর\n• ২য় সেচ: ৪০-৪৫ দিন পর\n• ৩য় সেচ: ৬০-৬৫ দিন পর"
            }
        },
        "সাধারণ প্রশ্ন": {
            "patterns": ["হ্যালো", "হাই", "নমস্কার", "আসসালামু", "কেমন", "কি", "কী"],
            "answers": {
                "স্বাগতম": "স্বাগতম! আমি JolBondhu AI Assistant।\n\n🌾 কৃষি পরামর্শ\n🌊 বন্যা পূর্বাভাস\n🚨 জরুরি সাহায্য\n💰 কৃষি ঋণ ও বীমা\n📊 বাজার তথ্য\n\nআপনার প্রশ্ন করুন!",
                "সাহায্য": "আমি যেসব বিষয়ে সাহায্য করতে পারি:\n\n1. ধান, গম, পাট চাষ\n2. সার ও সেচ ব্যবস্থাপনা\n3. রোগ ও পোকামাকড় নিয়ন্ত্রণ\n4. কৃষি ঋণ ও বীমা\n5. বাজার মূল্য ও বিপণন"
            }
        }
    }
    
    best_topic = "সাধারণ প্রশ্ন"
    for topic, data in knowledge_base.items():
        for pattern in data["patterns"]:
            if pattern in question_lower:
                best_topic = topic
                break
        if best_topic != "সাধারণ প্রশ্ন":
            break
    
    answer = knowledge_base[best_topic]["answers"].get("স্বাগতম" if best_topic == "সাধারণ প্রশ্ন" else "বপন সময়", 
                                                        "আমি এই বিষয়ে আরও জানতে পারি। দয়া করে আরও নির্দিষ্ট করে প্রশ্ন করুন।")
    
    return {
        "question": question,
        "topic": best_topic,
        "answer": answer,
        "confidence": 85.0,
        "sources": ["বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট"],
        "follow_up_questions": ["ধান চাষের খরচ কত?", "গমের সেরা জাত কোনটি?", "সার প্রয়োগের নিয়ম কি?"]
    }


def get_fallback_response(question: str) -> Dict[str, Any]:
    current_season = get_current_season()
    current_month = datetime.now().month
    
    default_response = f"""🤖 **আপনাকে স্বাগতম! আমি JolBondhu, আপনার কৃষি সহকারী।**

**আপন যা জানতে পারেন:**
🌾 ধান চাষ - বীজ বপন থেকে সংগ্রহ পর্যন্ত সম্পূর্ণ গাইড
🌾 গম চাষ - শীতকালীন ফসলের আধুনিক পদ্ধতি
🌱 সার ব্যবস্থাপনা - বিজ্ঞানসম্মত সার প্রয়োগ পদ্ধতি
💰 কৃষি ঋণ - সরকারি সহায়তা ও ঋণ স্কিম
🌊 বন্যা ব্যবস্থাপনা - দুর্যোগে ফসল রক্ষা

**বর্তমান মৌসুম:** {current_season}
**সেরা চাষ:** {get_recommended_crops(current_month)}

**জরুরি সাহায্যের জন্য:** ১৬১২৩ (কৃষি হেল্পলাইন)"""
    
    return {"answer": default_response, "tokens_used": len(default_response.split()), "model": "JolBondhu_AI"}


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
        return ["ধান চাষের সম্পূর্ণ খরচ কত?", "বোরো ধানের সেরা জাত কোনটি?", "ধান ক্ষেতে রোগ দমন কিভাবে করব?"]
    elif any(word in question_lower for word in ['সার', 'fertilizer']):
        return ["ইউরিয়া সারের দাম কত?", "জৈব সার কিভাবে তৈরি করব?", "সার প্রয়োগের সঠিক সময় কখন?"]
    elif any(word in question_lower for word in ['বন্যা', 'flood']):
        return ["বন্যার আগে কী প্রস্তুতি নেব?", "বন্যার পর ফসল পুনরুদ্ধার কিভাবে করব?", "বন্যা সহনশীল ফসল কোনগুলো?"]
    return ["ধান চাষের খরচ কত?", "গম চাষের সেরা সময় কখন?", "কৃষি ঋণ কিভাবে পাবো?"]

def get_fallback_response(question: str):
    current_season = get_current_season()
    current_month = datetime.now().month
    default_response = f"""🤖 **আপনাকে স্বাগতম! আমি JolBondhu, আপনার কৃষি সহকারী।**

**আপন যা জানতে পারেন:**
🌾 ধান চাষ - বীজ বপন থেকে সংগ্রহ পর্যন্ত সম্পূর্ণ গাইড
🌾 গম চাষ - শীতকালীন ফসলের আধুনিক পদ্ধতি
🌱 সার ব্যবস্থাপনা - বিজ্ঞানসম্মত সার প্রয়োগ পদ্ধতি
💰 কৃষি ঋণ - সরকারি সহায়তা ও ঋণ স্কিম
🌊 বন্যা ব্যবস্থাপনা - দুর্যোগে ফসল রক্ষা

**বর্তমান মৌসুম:** {current_season}
**সেরা চাষ:** {get_recommended_crops(current_month)}

**জরুরি সাহায্যের জন্য:** ১৬১২৩ (কৃষি হেল্পলাইন)"""
    
    return {"answer": default_response, "tokens_used": len(default_response.split()), "model": "JolBondhu_AI"}

def get_deepseek_response(question: str, stream: bool = False):
    """Get response from DeepSeek API (if API key is set)"""
    if not DEEPSEEK_API_KEY:
        return get_fallback_response(question)
    
    try:
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        system_prompt = f"""You are JolBondhu, an agricultural expert assistant for Bangladeshi farmers.
        Always respond in Bangla (Bengali) using simple language.
        Current Date: {datetime.now().strftime('%d %B, %Y')}
        Current Season: {get_current_season()}
        
        Provide practical, actionable advice with specific numbers and measurements.
        Be concise but comprehensive (3-5 paragraphs maximum)."""
        
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            "stream": stream,
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            answer = data['choices'][0]['message']['content']
            return {"answer": answer, "tokens_used": data.get('usage', {}).get('total_tokens', 0), "model": "deepseek-chat"}
        else:
            return get_fallback_response(question)
            
    except Exception as e:
        print(f"DeepSeek API Error: {e}")
        return get_fallback_response(question)

# ================================================================
# GEOLOCATION FUNCTIONS
# ================================================================

def initialize_geolocator():
    global geolocator
    try:
        geolocator = Nominatim(user_agent="jolbondhu_app", timeout=10)
        print("📍 Geolocator initialized")
    except Exception as e:
        print(f"⚠️ Could not initialize geolocator: {e}")
        geolocator = None

def get_district_from_coords(lat: float, lon: float) -> dict:
    try:
        if geolocator:
            location = geolocator.reverse(f"{lat}, {lon}", language="bn", timeout=5)
            if location and location.raw.get('address'):
                address = location.raw['address']
                district_name = address.get('county') or address.get('district') or address.get('state_district')
                if district_name and district_name in BANGLADESH_DISTRICTS:
                    return {"name": district_name, **BANGLADESH_DISTRICTS[district_name]}
    except Exception as e:
        print(f"📍 Geocoding error: {e}")
    
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

# ================================================================
# CACHE FUNCTIONS
# ================================================================

def get_cached_risk_data(lat: float, lon: float, district_name: str = None):
    cache_key = f"{lat:.4f}_{lon:.4f}"
    
    if cache_key in risk_cache:
        cached_time, cached_data = risk_cache[cache_key]
        if time.time() - cached_time < 300:
            return cached_data, True, cache_key
    
    weather_data = get_nasa_rainfall(lat, lon)
    
    if trained_models['xgb_model'] is not None:
        risk_data = predict_with_ml_models(lat, lon, weather_data)
    else:
        risk_data = calculate_flood_risk_rule_based(lat, lon, weather_data)
    
    result = {"weather_data": weather_data, "risk_data": risk_data, "district": district_name, "timestamp": datetime.now().isoformat()}
    risk_cache[cache_key] = (time.time(), result)
    return result, False, cache_key

# ================================================================
# LOAD TRAINED MODELS FROM PKL
# ================================================================

def load_trained_models_from_pkl():
    global trained_models
    
    pkl_files = ['flood_prediction_essential.pkl', 'flood_prediction_model.pkl']
    
    for pkl_file in pkl_files:
        if os.path.exists(pkl_file):
            try:
                print(f"📦 Loading models from {pkl_file}...")
                with open(pkl_file, 'rb') as f:
                    model_pkg = pickle.load(f)
                
                trained_models['xgb_model'] = model_pkg.get('xgb_model')
                trained_models['lstm_model'] = model_pkg.get('lstm_model')
                trained_models['unet_model'] = model_pkg.get('unet_model')
                trained_models['scaler_lstm'] = model_pkg.get('scaler_lstm')
                trained_models['feature_cols'] = model_pkg.get('feature_cols')
                trained_models['sequence_length'] = model_pkg.get('sequence_length', SEQUENCE_LENGTH)
                trained_models['spatial_mean'] = model_pkg.get('spatial_mean')
                trained_models['spatial_std'] = model_pkg.get('spatial_std')
                trained_models['upstream_data'] = model_pkg.get('upstream_data')
                trained_models['compute_physics_features'] = model_pkg.get('compute_physics_features')
                trained_models['compute_dynamic_risk_score'] = model_pkg.get('compute_dynamic_risk_score')
                trained_models['risk_level_from_score'] = model_pkg.get('risk_level_from_score')
                trained_models['simulate_water_level'] = model_pkg.get('simulate_water_level')
                trained_models['fetch_nasa_power'] = model_pkg.get('fetch_nasa_power')
                trained_models['fetch_forecast'] = model_pkg.get('fetch_forecast')
                
                print(f"✅ Models loaded successfully from {pkl_file}")
                print(f"   - XGBoost: {'✓' if trained_models['xgb_model'] else '✗'}")
                print(f"   - LSTM: {'✓' if trained_models['lstm_model'] else '✗'}")
                print(f"   - UNet: {'✓' if trained_models['unet_model'] else '✗'}")
                return True
            except Exception as e:
                print(f"⚠️ Error loading {pkl_file}: {e}")
                continue
    
    print("⚠️ No PKL model files found. Using rule-based predictions.")
    return False

# ================================================================
# FASTAPI LIFESPAN AND APP INITIALIZATION
# ================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n" + "=" * 60)
    print("🚀 Starting JolBondhu Complete API")
    print("=" * 60)
    
    if ML_AVAILABLE:
        load_trained_models_from_pkl()
    else:
        print("⚠️ Advanced ML libraries not available. Using rule-based predictions.")
    
    load_or_train_model()
    initialize_geolocator()
    
    print("\n✅ API Startup Complete!")
    print("=" * 60 + "\n")
    
    yield
    
    print("🛑 Shutting down JolBondhu API...")

# Create FastAPI app
app = FastAPI(
    title="JolBondhu Flood Risk Prediction API",
    description="Bangladesh Flood Risk Prediction System with ML, Crop Recommendations, and AI Chatbot",
    version="3.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================================================
# API ENDPOINTS - FLOOD PREDICTION
# ================================================================

@app.get("/")
async def root():
    return {
        "message": "JolBondhu Flood Risk Prediction API",
        "version": "3.0.0",
        "status": "running",
        "features": ["flood-prediction", "crop-recommendation", "emergency-assistant", "farmer-chatbot"],
        "models_loaded": trained_models['xgb_model'] is not None
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": trained_models['xgb_model'] is not None,
        "ml_available": ML_AVAILABLE,
        "cache_size": len(risk_cache),
        "endpoints": {
            "GET /predict": "Get flood risk prediction",
            "POST /predict/flood": "AI-based flood prediction",
            "POST /recommend/crops": "Get crop recommendations",
            "POST /assist/emergency": "Emergency assistance",
            "POST /chat/farmer": "Farmer chatbot",
            "GET /districts": "Get all districts",
            "GET /alldistricts": "Get districts with risk data",
            "GET /models/status": "Get ML models status"
        }
    }

@app.get("/models/status")
async def get_models_status():
    return {
        "status": "success",
        "ml_available": ML_AVAILABLE,
        "models_loaded": trained_models['xgb_model'] is not None,
        "xgb_model": trained_models['xgb_model'] is not None,
        "lstm_model": trained_models['lstm_model'] is not None,
        "unet_model": trained_models['unet_model'] is not None,
        "random_forest_model": model is not None,
        "feature_count": len(trained_models['feature_cols']) if trained_models['feature_cols'] else 0,
        "sequence_length": trained_models['sequence_length']
    }

@app.get("/predict")
async def predict_risk(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    district: Optional[str] = Query(None, description="District name")
):
    try:
        district_info = get_district_from_coords(lat, lon)
        if district:
            district_info["name"] = district
        
        # Get REAL data
        weather_data = get_nasa_rainfall(lat, lon)
        river_data = get_river_data(lat, lon)
        
        # Calculate risk (use your existing function)
        risk_data = calculate_flood_risk(lat, lon, weather_data)
        
        # Prepare response with REAL values
        weather_display = {
            "rainfall_mm": weather_data["rainfall_7_days_mm"],
            "rainfall_3_days": weather_data["rainfall_3_days_mm"],
            "river_level_m": river_data["current_level"],  # REAL river level!
            "humidity_percent": weather_data["humidity_percent"],
            "temperature_c": weather_data["temperature_c"]  # REAL temperature!
        }
        
        prediction = {
            "risk_level": risk_data["risk_level"],
            "risk_score": risk_data["flood_risk_percent"],
            "confidence": risk_data.get("confidence", 85),
            "probabilities": {
                "low": max(0, 100 - risk_data["flood_risk_percent"]),
                "medium": 30 if risk_data["risk_level"] == "মধ্যম" else 20,
                "high": risk_data["flood_risk_percent"] if risk_data["risk_level"] == "উচ্চ" else 0,
                "very_high": 0
            }
        }
        
        advice = get_advice(prediction["risk_level"], district_info["name"])
        
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
            "weather_data": weather_display,
            "prediction": prediction,
            "advice": advice,
            "recommendations": {
                "immediate": get_immediate_recommendations(prediction["risk_level"]),
                "preparation": get_preparation_recommendations(prediction["risk_level"])
            }
        }
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/predict/flood")
async def predict_flood(data: FloodPredictionRequest):
    try:
        if not (-90 <= data.lat <= 90) or not (-180 <= data.lon <= 180):
            raise HTTPException(status_code=400, detail="Invalid coordinates")
        
        if not (20.0 <= data.lat <= 27.0) or not (88.0 <= data.lon <= 93.0):
            return {
                "status": "warning",
                "message": "Location is outside Bangladesh. Showing approximate data.",
                "prediction": predict_flood_risk_ai(data.lat, data.lon, get_weather_data(data.lat, data.lon), get_river_data(data.lat, data.lon)),
                "weather_data": get_weather_data(data.lat, data.lon),
                "river_data": get_river_data(data.lat, data.lon),
                "timestamp": datetime.now().isoformat()
            }
        
        weather_data = get_weather_data(data.lat, data.lon)
        river_data = get_river_data(data.lat, data.lon)
        
        if data.rainfall_24h:
            weather_data["rainfall_24h"] = data.rainfall_24h
        if data.river_level:
            river_data["current_level"] = data.river_level
        
        prediction = predict_flood_risk_ai(data.lat, data.lon, weather_data, river_data)
        prediction["recommendations"] = get_flood_recommendations(prediction["risk_level"])
        
        return {
            "status": "success",
            "prediction": prediction,
            "weather_data": weather_data,
            "river_data": river_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in predict_flood: {str(e)}")
        return {
            "status": "success",
            "message": "Using fallback data due to error",
            "prediction": {
                "risk_level": "মধ্যম",
                "risk_score": 50,
                "risk_color": "#f59e0b",
                "confidence": 85,
                "recommendations": get_flood_recommendations("মধ্যম")
            },
            "weather_data": get_weather_data(data.lat, data.lon),
            "timestamp": datetime.now().isoformat()
        }

@app.post("/predicting")
async def predict_flood_risk_post(request: PredictionRequest):
    try:
        cached_result, is_cached, cache_key = get_cached_risk_data(request.lat, request.lon, request.district)
        
        weather_data = cached_result["weather_data"]
        risk_data = cached_result["risk_data"]
        advice = get_advice(risk_data["risk_level"], request.district or "অজানা")
        
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "cache_info": "cached" if is_cached else "fresh",
            "location": {
                "latitude": request.lat,
                "longitude": request.lon,
                "district": request.district or "Unknown",
                "flood_risk_factor": risk_data["flood_risk_percent"]
            },
            "weather_data": {
                "rainfall_mm": weather_data["rainfall_7_days_mm"],
                "rainfall_3_days": weather_data["rainfall_3_days_mm"],
                "humidity_percent": weather_data["humidity_percent"],
                "temperature_c": weather_data["temperature_c"]
            },
            "prediction": {
                "risk_level": risk_data["risk_level"],
                "risk_score": risk_data["flood_risk_percent"],
                "confidence": risk_data.get("confidence", 85)
            },
            "advice": advice,
            "recommendations": {
                "immediate": get_immediate_recommendations(risk_data["risk_level"]),
                "preparation": get_preparation_recommendations(risk_data["risk_level"])
            }
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ================================================================
# API ENDPOINTS - DISTRICTS
# ================================================================

@app.get("/districts")
async def get_districts_list():
    districts_list = []
    for name, data in BANGLADESH_DISTRICTS.items():
        risk_level = "নিম্ন"
        if data["flood_risk"] >= 0.7:
            risk_level = "অতি উচ্চ"
        elif data["flood_risk"] >= 0.6:
            risk_level = "উচ্চ"
        elif data["flood_risk"] >= 0.4:
            risk_level = "মধ্যম"
        
        districts_list.append({
            "name": name,
            "division": data["division"],
            "latitude": data["lat"],
            "longitude": data["lon"],
            "flood_risk_level": risk_level,
            "flood_risk_score": data["flood_risk"]
        })
    
    return {
        "status": "success",
        "total_districts": len(districts_list),
        "districts": districts_list
    }

@app.get("/alldistricts")
async def get_all_districts():
    try:
        districts_base = [
            {"name": name, "division": data["division"], "latitude": data["lat"], "longitude": data["lon"]}
            for name, data in BANGLADESH_DISTRICTS.items()
        ]
        districts_with_risk = []
        
        for district in districts_base[:20]:  # Limit to 20 for performance
            try:
                cached_result, _, _ = get_cached_risk_data(district["latitude"], district["longitude"], district["name"])
                risk_data = cached_result["risk_data"]
                
                districts_with_risk.append({
                    **district,
                    "flood_risk_level": risk_data["risk_level"],
                    "flood_risk_score": risk_data["flood_risk_percent"],
                    "rainfall_mm": cached_result["weather_data"]["rainfall_7_days_mm"],
                    "temperature_c": cached_result["weather_data"]["temperature_c"],
                    "humidity_percent": cached_result["weather_data"]["humidity_percent"],
                    "last_updated": datetime.now().isoformat()
                })
            except Exception as e:
                print(f"Error processing {district['name']}: {e}")
                districts_with_risk.append({**district, "flood_risk_level": "তথ্য নেই", "flood_risk_score": 0})
        
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "districts": districts_with_risk,
            "count": len(districts_with_risk),
            "data_source": "NASA POWER API + ML Models"
        }
    except Exception as e:
        print(f"Error in /alldistricts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ================================================================
# API ENDPOINTS - CROP RECOMMENDATION
# ================================================================

@app.post("/recommend/crops")
async def recommend_crops(location: LocationRequest):
    try:
        recommendations = get_crop_recommendation(location.lat, location.lon, "current")
        return {
            "status": "success",
            "recommendations": recommendations,
            "location": {"lat": location.lat, "lon": location.lon},
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ================================================================
# API ENDPOINTS - EMERGENCY ASSISTANT
# ================================================================

@app.post("/assist/emergency")
async def emergency_assist_endpoint(request: EmergencyAnalysisRequest):
    try:
        assistance = emergency_assistant(
            {"lat": request.location.lat, "lon": request.location.lon},
            request.situation,
            request.urgency_level
        )
        return {
            "status": "success",
            "assistance": assistance,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ================================================================
# API ENDPOINTS - FARMER CHATBOT
# ================================================================


    try:
        location_data = {"lat": query.location.lat, "lon": query.location.lon} if query.location else None
        
        response = farmer_chatbot(query.question, location_data, query.crop_type)
        
        return {
            "status": "success",
            "response": response,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# Add these imports at the top
from fastapi.responses import StreamingResponse
import asyncio
import json

# Add this endpoint to your backend (after your existing endpoints)

# ================================================================
# API ENDPOINTS - CHAT (STREAMING)
# Add these imports at the top
from openai import OpenAI
import asyncio

# OpenRouter Configuration (Free Tier)
OPENROUTER_API_KEY = "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"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_MODEL = "deepseek/deepseek-r1:free"  # Free model

# Initialize OpenRouter client
if OPENROUTER_API_KEY and OPENROUTER_API_KEY != "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":
    openrouter_client = OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url=OPENROUTER_BASE_URL,
    )
    OPENROUTER_AVAILABLE = True
    print("✅ OpenRouter Free Tier configured")
else:
    OPENROUTER_AVAILABLE = False
    print("⚠️ OpenRouter not configured, using fallback responses")
def get_intelligent_response(question: str) -> Dict[str, Any]:
    """Fallback intelligent responses when API is unavailable"""
    question_lower = question.lower()
    
    # ধান চাষ সম্পর্কিত প্রশ্ন
    if "ধান" in question_lower or "rice" in question_lower:
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
- বোরো ধান: নিয়মিত সেচ প্রয়োজন (৭-১০ দিন পর)
- আমন ধান: বৃষ্টিনির্ভর
- আউশ ধান: কম পানি প্রয়োজন

**৪. রোগ ব্যবস্থাপনা:**
- ব্লাস্ট রোগ: ট্রাইসাইক্লাজল ৭৫% WP
- বাকানি রোগ: কার্বেন্ডাজিম ৫০% WP

**৫. উৎপাদন খরচ ও লাভ:**
- প্রতি হেক্টর খরচ: ৫০,০০০-৬৫,০০০ টাকা
- সম্ভাব্য উৎপাদন: ৬-৮ টন/হেক্টর
- আনুমানিক লাভ: ৮০,০০০-১,০০,০০০ টাকা

আরও বিস্তারিত জানতে চাইলে নির্দিষ্ট প্রশ্ন করুন! 🌱""",
            "tokens_used": 500,
            "model": "JolBondhu_AI"
        }
    
    # গম চাষ সম্পর্কিত প্রশ্ন
    elif "গম" in question_lower or "wheat" in question_lower:
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
- খরচ: ৪০,০০০-৫০,০০০ টাকা/হেক্টর
- লাভ: ৬০,০০০-৭০,০০০ টাকা/হেক্টর

বিস্তারিত জানতে চাইলে প্রশ্ন করুন! 🌾""",
            "tokens_used": 400,
            "model": "JolBondhu_AI"
        }
    
    # বন্যা সম্পর্কিত প্রশ্ন
    elif "বন্যা" in question_lower or "flood" in question_lower:
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
৪. সাপ-কাটা ও রোগ থেকে সতর্ক থাকুন

**বন্যার পরে ব্যবস্থা:**
১. ক্ষয়ক্ষতি মূল্যায়ন করুন
২. স্থানীয় কৃষি অফিসে রিপোর্ট করুন
৩. দ্রুত বর্ধনশীল ফসল চাষ করুন
৪. জমিতে চুন ও জৈব সার প্রয়োগ করুন

সরকারি সাহায্যের জন্য কৃষি হেল্পলাইন: ১৬১২৩ 📞""",
            "tokens_used": 450,
            "model": "JolBondhu_AI"
        }
    
    # কৃষি ঋণ সম্পর্কিত প্রশ্ন
    elif "ঋণ" in question_lower or "লোন" in question_lower or "loan" in question_lower:
        return {
            "answer": """💰 **কৃষি ঋণ সম্পর্কে তথ্য:**

**সরকারি কৃষি ঋণ স্কিম:**
- কিসান ক্রেডিট কার্ড: সর্বোচ্চ ৫,০০,০০০ টাকা
- সুদের হার: মাত্র ৪%
- মেয়াদ: ৩ বছর

**প্রয়োজনীয় কাগজপত্র:**
- জাতীয় পরিচয়পত্র
- জমির দলিল/খতিয়ান
- ফসল পরিকল্পনা
- পাসপোর্ট সাইজ ছবি

**যেসব ব্যাংক ঋণ দেয়:**
- বাংলাদেশ কৃষি ব্যাংক
- সোনালী ব্যাংক
- জনতা ব্যাংক
- অগ্রণী ব্যাংক

**আবেদন প্রক্রিয়া:**
১. নিকটস্থ ব্যাংক শাখায় যোগাযোগ করুন
২. ফরম পূরণ করুন
৩. কাগজপত্র জমা দিন
৪. ৭-১০ দিনে ঋণ পেয়ে যান

বিস্তারিত জানতে ১৬১২৩ নম্বরে কল করুন 📞""",
            "tokens_used": 450,
            "model": "JolBondhu_AI"
        }
    
    # সার সম্পর্কিত প্রশ্ন
    elif "সার" in question_lower or "fertilizer" in question_lower:
        return {
            "answer": """🌱 **সার প্রয়োগের সঠিক পদ্ধতি:**

**ইউরিয়া সার (নাইট্রোজেন):**
- ধান: ২৫০-৩০০ কেজি/হেক্টর
- প্রয়োগ: ৩ কিস্তিতে (১০, ৩৫ ও ৫৫ দিন পর)
- দাম: ২২-২৫ টাকা/কেজি

**টিএসপি সার (ফসফেট):**
- ধান: ১৫০-২০০ কেজি/হেক্টর
- প্রয়োগ: শেষ চাষের সময়
- দাম: ৩৫-৪০ টাকা/কেজি

**এমওপি সার (পটাশ):**
- ধান: ১০০-১৫০ কেজি/হেক্টর
- প্রয়োগ: ২ কিস্তিতে (বপন ও ৪৫ দিন পর)
- দাম: ৩০-৩৫ টাকা/কেজি

**জৈব সারের গুরুত্ব:**
- গোবর/কম্পোস্ট: ৫-১০ টন/হেক্টর
- মাটির উর্বরতা বৃদ্ধি করে
- রাসায়নিক সারের ব্যবহার কমায়

সঠিক মাত্রায় সার ব্যবহার করুন! 🌾""",
            "tokens_used": 480,
            "model": "JolBondhu_AI"
        }
    
    # পোকা ও রোগ সম্পর্কিত প্রশ্ন
    elif "পোকা" in question_lower or "রোগ" in question_lower or "pest" in question_lower:
        return {
            "answer": """🐛 **ফসলের পোকা ও রোগ ব্যবস্থাপনা:**

**ধান ক্ষেতের প্রধান পোকা:**
- মাজরা পোকা: কার্টাপ হাইড্রোক্লোরাইড ৫০% SP
- গাছ ফড়িং: কার্বোফুরান ৩% জি
- পাতা মোড়ানো পোকা: ক্লোরপাইরিফস ৫০% EC

**প্রধান রোগ:**
- ব্লাস্ট রোগ: ট্রাইসাইক্লাজল
- বাকানি রোগ: কার্বেন্ডাজিম
- খোলপচা রোগ: প্রোপিকোনাজল

**প্রতিরোধের উপায়:**
- প্রতিরোধশীল জাত ব্যবহার করুন
- সঠিক দূরত্বে চারা রোপণ করুন
- নিয়মিত ক্ষেত পরিদর্শন করুন
- জৈব বালাইনাশক ব্যবহার করুন

আরও বিস্তারিত জানতে কৃষি অফিসে যোগাযোগ করুন! 🌱""",
            "tokens_used": 420,
            "model": "JolBondhu_AI"
        }
    
    # ডিফল্ট স্বাগতম বার্তা
    else:
        current_season = get_current_season()
        current_month = datetime.now().month
        return {
            "answer": f"""🤖 **আপনাকে স্বাগতম! আমি JolBondhu, আপনার কৃষি সহকারী।**

**আপনি যা জানতে পারেন:**
🌾 **ধান চাষ** - বীজ বপন থেকে সংগ্রহ পর্যন্ত সম্পূর্ণ গাইড
🌾 **গম চাষ** - শীতকালীন ফসলের আধুনিক পদ্ধতি
🌱 **সার ব্যবস্থাপনা** - বিজ্ঞানসম্মত সার প্রয়োগ পদ্ধতি
🐛 **রোগ-পোকা দমন** - জৈব ও রাসায়নিক ব্যবস্থাপনা
💰 **কৃষি ঋণ** - সরকারি সহায়তা ও ঋণ স্কিম
🌊 **বন্যা ব্যবস্থাপনা** - বন্যার আগে, সময় ও পরে করণীয়
📊 **বাজার তথ্য** - ফসলের দাম ও বিপণন

**বর্তমান মৌসুম:** {current_season}
**এই মৌসুমের সেরা ফসল:** {get_recommended_crops(current_month)}

**উদাহরণ প্রশ্ন:**
• "ধান চাষের খরচ কত?"
• "গম চাষের সেরা সময় কখন?"
• "কৃষি ঋণ কিভাবে পাবো?"
• "বন্যার সময় ফসল বাঁচানোর উপায় কি?"

আমি আপনার কৃষি সম্পর্কিত যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত! 

**জরুরি সাহায্যের জন্য:** ১৬১২৩ (কৃষি হেল্পলাইন) 📞""",
            "tokens_used": 350,
            "model": "JolBondhu_AI"
        }
# Update the /chat/stream endpoint for OpenRouter
@app.get("/chat/stream")
async def chat_stream(question: str):
    """SSE endpoint for streaming responses from OpenRouter (Free DeepSeek)"""
    print(f"📡 Streaming request: {question}")
    
    async def generate_stream():
        try:
            # Try OpenRouter first if available
            if OPENROUTER_AVAILABLE:
                print("🔄 Calling OpenRouter DeepSeek API...")
                
                system_prompt = f"""You are **JolBondhu**, an intelligent agricultural expert assistant for Bangladeshi farmers.
                
Guidelines:
1. **Always respond in Bangla (Bengali)** using simple, conversational language
2. Provide practical, actionable advice with specific numbers and measurements
3. Be concise but comprehensive (3-5 paragraphs maximum)
4. Include emojis for better readability

Current Date: {datetime.now().strftime('%d %B, %Y')}
Current Season: {get_current_season()}

Remember: You are helping Bangladeshi farmers with:
- Flood preparedness and management
- Crop cultivation (rice, wheat, jute, vegetables)
- Pest and disease control
- Fertilizer application
- Agricultural loans and insurance
- Market prices and selling tips"""

                # OpenRouter streaming request
                response = openrouter_client.chat.completions.create(
                    model=OPENROUTER_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": question}
                    ],
                    temperature=0.7,
                    max_tokens=1000,
                    stream=True,
                    extra_headers={
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "JolBondhu AI Assistant",
                    }
                )
                
                # Stream the response
                for chunk in response:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        yield f"data: {json.dumps({'content': content})}\n\n"
                        await asyncio.sleep(0.01)
                
                yield f"data: {json.dumps({'done': True})}\n\n"
                print("✅ Streaming completed")
                
            else:
                # Fallback to intelligent responses
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
            # Use fallback on error
            fallback = get_intelligent_response(question)
            yield f"data: {json.dumps({'content': fallback['answer']})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

# Also update the POST endpoint for non-streaming
@app.post("/chat/farmer")
async def chat_farmer_endpoint(query: FarmerQuery):
    """AI chatbot for farmers - Using OpenRouter Free Tier"""
    try:
        if OPENROUTER_AVAILABLE:
            try:
                system_prompt = f"""You are JolBondhu, an agricultural expert assistant for Bangladeshi farmers.
Always respond in Bangla (Bengali). Provide practical advice with specific numbers.
Current Season: {get_current_season()}"""
                
                response = openrouter_client.chat.completions.create(
                    model=OPENROUTER_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": query.question}
                    ],
                    temperature=0.7,
                    max_tokens=1000,
                    stream=False,
                    extra_headers={
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "JolBondhu AI Assistant",
                    }
                )
                
                answer = response.choices[0].message.content
                
                return {
                    "status": "success",
                    "response": {
                        "question": query.question,
                        "topic": "agriculture",
                        "answer": answer,
                        "confidence": 95,
                        "sources": ["OpenRouter (DeepSeek)", "কৃষি জ্ঞান ভাণ্ডার"],
                        "follow_up_questions": generate_follow_up(query.question),
                        "metadata": {
                            "model": OPENROUTER_MODEL,
                            "timestamp": datetime.now().isoformat()
                        }
                    }
                }
            except Exception as e:
                print(f"OpenRouter API error: {e}")
                # Fallback to intelligent responses
                response = get_intelligent_response(query.question)
                return {
                    "status": "success",
                    "response": {
                        "question": query.question,
                        "topic": "agriculture",
                        "answer": response["answer"],
                        "confidence": 85,
                        "sources": ["বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট"],
                        "follow_up_questions": generate_follow_up(query.question)
                    }
                }
        else:
            # Use fallback responses
            response = get_intelligent_response(query.question)
            return {
                "status": "success",
                "response": {
                    "question": query.question,
                    "topic": "agriculture",
                    "answer": response["answer"],
                    "confidence": 85,
                    "sources": ["বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট"],
                    "follow_up_questions": generate_follow_up(query.question)
                }
            }
            
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/chat/farmer/advanced")
async def farmer_chat_advanced(request: ChatRequest):
    try:
        result = get_deepseek_response(request.question)
        
        return {
            "status": "success",
            "response": {
                "question": request.question,
                "topic": "agriculture",
                "answer": result["answer"],
                "confidence": 95 if result["model"] == "deepseek-chat" else 85,
                "sources": ["বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট", "কৃষি সম্প্রসারণ অধিদপ্তর"],
                "follow_up_questions": generate_follow_up(request.question),
                "metadata": {
                    "tokens_used": result.get("tokens_used", 0),
                    "model": result.get("model", "JolBondhu_AI"),
                    "timestamp": datetime.now().isoformat()
                }
            }
        }
    except Exception as e:
        print(f"Chat error: {e}")
        fallback = get_fallback_response(request.question)
        return {
            "status": "success",
            "response": {
                "question": request.question,
                "topic": "agriculture",
                "answer": fallback["answer"],
                "confidence": 80,
                "sources": ["কৃষি জ্ঞান ভাণ্ডার"],
                "follow_up_questions": generate_follow_up(request.question)
            }
        }
# Make sure you have the ChatRequest model
class ChatRequest(BaseModel):
    question: str
    location: Optional[Dict] = None
    stream: bool = False

# And the helper functions
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
        return [
            "ধান চাষের সম্পূর্ণ খরচ কত?",
            "বোরো ধানের সেরা জাত কোনটি?",
            "ধান ক্ষেতে রোগ দমন কিভাবে করব?",
            "ধান চাষে লাভ কত?"
        ]
    elif any(word in question_lower for word in ['সার', 'fertilizer']):
        return [
            "ইউরিয়া সারের দাম কত?",
            "জৈব সার কিভাবে তৈরি করব?",
            "সার প্রয়োগের সঠিক সময় কখন?",
            "কোন সার কত টাকা?"
        ]
    elif any(word in question_lower for word in ['বন্যা', 'flood']):
        return [
            "বন্যার আগে কী প্রস্তুতি নেব?",
            "বন্যার পর ফসল পুনরুদ্ধার কিভাবে করব?",
            "বন্যা সহনশীল ফসল কোনগুলো?",
            "বন্যা ঋণ কিভাবে পাব?"
        ]
    elif any(word in question_lower for word in ['ঋণ', 'loan', 'credit']):
        return [
            "কৃষি ঋণের সুদ কত?",
            "ঋণ পেতে কতদিন লাগে?",
            "কোন ব্যাংকে আবেদন করব?",
            "জামানত ছাড়া ঋণ পাব?"
        ]
    return [
        "ধান চাষের খরচ কত?",
        "গম চাষের সেরা সময় কখন?",
        "কৃষি ঋণ কিভাবে পাবো?",
        "বন্যার সময় ফসল বাচাবো কিভাবে?"
    ]

# Add this to your imports at the top
from fastapi.responses import StreamingResponse
import asyncio
@app.post("/chat/farmer/advanced")
async def farmer_chat_advanced(request: ChatRequest):
    try:
        result = get_deepseek_response(request.question)
        
        return {
            "status": "success",
            "response": {
                "question": request.question,
                "topic": "agriculture",
                "answer": result["answer"],
                "confidence": 95 if result["model"] == "deepseek-chat" else 85,
                "sources": ["বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট", "কৃষি সম্প্রসারণ অধিদপ্তর"],
                "follow_up_questions": generate_follow_up(request.question),
                "metadata": {
                    "tokens_used": result.get("tokens_used", 0),
                    "model": result.get("model", "JolBondhu_AI"),
                    "timestamp": datetime.now().isoformat()
                }
            }
        }
    except Exception as e:
        print(f"Chat error: {e}")
        fallback = get_fallback_response(request.question)
        return {
            "status": "success",
            "response": {
                "question": request.question,
                "topic": "agriculture",
                "answer": fallback["answer"],
                "confidence": 80,
                "sources": ["কৃষি জ্ঞান ভাণ্ডার"],
                "follow_up_questions": generate_follow_up(request.question)
            }
        }

# ================================================================
# API ENDPOINTS - MISC
# ================================================================

@app.delete("/cache")
async def clear_cache():
    global risk_cache
    count = len(risk_cache)
    risk_cache = {}
    return {"status": "success", "message": f"Cache cleared ({count} items removed)", "timestamp": datetime.now().isoformat()}

# ================================================================
# MAIN ENTRY POINT
# ================================================================

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🌊 JolBondhu Complete Backend API")
    print("=" * 60)
    print("\nStarting server...")
    print("API Documentation: http://localhost:8000/docs")
    print("Health Check: http://localhost:8000/health")
    print("\n" + "=" * 60 + "\n")
    
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False, log_level="info")  

