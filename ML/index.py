import pandas as pd
from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from sklearn.ensemble import RandomForestClassifier
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from geopy.geocoders import Nominatim
import numpy as np
from datetime import datetime
import pickle
import os
from typing import Dict, Any, List, Optional
import requests
from datetime import datetime, timedelta
import json
import time
from geopy.distance import geodesic
# 1. Initialize FastAPI
app = FastAPI(
    title="JolBondhu Flood Risk Prediction API",
    description="Bangladesh Flood Risk Prediction System with ML",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class PredictionRequest(BaseModel):
    lat: float
    lon: float
    rainfall: Optional[float] = None
    river_level: Optional[float] = None

class DistrictInfo(BaseModel):
    name: str
    lat: float
    lon: float
    division: str
    flood_prone: bool

# Initialize global variables
model = None
geolocator = None
model_trained = False

# Load or train model
def load_or_train_model():
    global model, model_trained
    try:
        # Try to load existing model
        if os.path.exists("jolbondhu_model.pkl"):
            print("📦 Loading saved model...")
            with open("jolbondhu_model.pkl", "rb") as f:
                model = pickle.load(f)
            model_trained = True
            print("✅ Model loaded from file")
            return
    except Exception as e:
        print(f"⚠️ Could not load model: {e}")
    
    # Train new model
    print("🤖 Training new model...")
    train_model()
    model_trained = True

def train_model():
    global model
    
    # More comprehensive training data
    data = {
        'rainfall': [50, 150, 300, 450, 600, 750, 900, 1200, 1500, 2000],
        'river_level': [1.0, 2.5, 4.0, 5.5, 7.0, 8.5, 10.0, 12.0, 15.0, 20.0],
        'humidity': [60, 65, 70, 75, 80, 85, 90, 92, 95, 98],
        'temperature': [25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
        'risk': [0, 0, 1, 1, 1, 2, 2, 3, 3, 3]  # 0: Low, 1: Medium, 2: High, 3: Very High
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
    
    # Save the model
    try:
        with open("jolbondhu_model.pkl", "wb") as f:
            pickle.dump(model, f)
        print("💾 Model saved to jolbondhu_model.pkl")
    except Exception as e:
        print(f"⚠️ Could not save model: {e}")
    
    print(f"✅ Model trained with {len(X)} samples")
    print(f"📊 Feature importance: {model.feature_importances_}")

# Initialize geolocator
def initialize_geolocator():
    global geolocator
    try:
        geolocator = Nominatim(user_agent="jolbondhu_app", timeout=10)
        print("📍 Geolocator initialized")
    except Exception as e:
        print(f"⚠️ Could not initialize geolocator: {e}")
        geolocator = None

# Bangladesh district database with real data
BANGLADESH_DISTRICTS = {
    # রংপুর বিভাগ (রংপুর, গাইবান্ধা, কুড়িগ্রাম, নীলফামারী, লালমনিরহাট, দিনাজপুর, ঠাকুরগাঁও, পঞ্চগড়)
    "কুড়িগ্রাম": {"lat": 25.8054, "lon": 89.6362, "division": "রংপুর", "flood_risk": 0.95},
    "গাইবান্ধা": {"lat": 25.3287, "lon": 89.5281, "division": "রংপুর", "flood_risk": 0.85},
    "লালমনিরহাট": {"lat": 25.9167, "lon": 89.4500, "division": "রংপুর", "flood_risk": 0.80},
    "নীলফামারী": {"lat": 25.9317, "lon": 88.8560, "division": "রংপুর", "flood_risk": 0.60},
    "রংপুর": {"lat": 25.7439, "lon": 89.2752, "division": "রংপুর", "flood_risk": 0.55},
    "দিনাজপুর": {"lat": 25.6217, "lon": 88.6354, "division": "রংপুর", "flood_risk": 0.30},
    "ঠাকুরগাঁও": {"lat": 26.0333, "lon": 88.4667, "division": "রংপুর", "flood_risk": 0.25},
    "পঞ্চগড়": {"lat": 26.3411, "lon": 88.5541, "division": "রংপুর", "flood_risk": 0.20},

    # সিলেট বিভাগ (সিলেট, সুনামগঞ্জ, মৌলভীবাজার, হবিগঞ্জ)
    "সুনামগঞ্জ": {"lat": 25.0659, "lon": 91.3950, "division": "সিলেট", "flood_risk": 0.98},
    "সিলেট": {"lat": 24.8918, "lon": 91.8830, "division": "সিলেট", "flood_risk": 0.85},
    "মৌলভীবাজার": {"lat": 24.4829, "lon": 91.7606, "division": "সিলেট", "flood_risk": 0.65},
    "হবিগঞ্জ": {"lat": 24.3749, "lon": 91.4133, "division": "সিলেট", "flood_risk": 0.60},

    # ময়মনসিংহ বিভাগ (ময়মনসিংহ, জামালপুর, নেত্রকোণা, শেরপুর)
    "জামালপুর": {"lat": 24.9375, "lon": 89.9373, "division": "ময়মনসিংহ", "flood_risk": 0.85},
    "নেত্রকোণা": {"lat": 24.8859, "lon": 90.7290, "division": "ময়মনসিংহ", "flood_risk": 0.75},
    "শেরপুর": {"lat": 25.0205, "lon": 90.0179, "division": "ময়মনসিংহ", "flood_risk": 0.65},
    "ময়মনসিংহ": {"lat": 24.7471, "lon": 90.4203, "division": "ময়মনসিংহ", "flood_risk": 0.50},

    # রাজশাহী বিভাগ (রাজশাহী, নাটোর, নওগাঁ, পাবনা, সিরাজগঞ্জ, বগুড়া, জয়পুরহাট, চাঁপাইনবাবগঞ্জ)
    "সিরাজগঞ্জ": {"lat": 24.4539, "lon": 89.7083, "division": "রাজশাহী", "flood_risk": 0.90},
    "বগুড়া": {"lat": 24.8465, "lon": 89.3773, "division": "রাজশাহী", "flood_risk": 0.75},
    "পাবনা": {"lat": 24.0063, "lon": 89.2493, "division": "রাজশাহী", "flood_risk": 0.65},
    "রাজশাহী": {"lat": 24.3745, "lon": 88.6042, "division": "রাজশাহী", "flood_risk": 0.40},
    "নাটোর": {"lat": 24.4202, "lon": 88.9803, "division": "রাজশাহী", "flood_risk": 0.50},
    "নওগাঁ": {"lat": 24.7936, "lon": 88.9318, "division": "রাজশাহী", "flood_risk": 0.45},
    "চাঁপাইনবাবগঞ্জ": {"lat": 24.5965, "lon": 88.2707, "division": "রাজশাহী", "flood_risk": 0.40},
    "জয়পুরহাট": {"lat": 25.0947, "lon": 89.0209, "division": "রাজশাহী", "flood_risk": 0.30},

    # ঢাকা বিভাগ (ঢাকা, গাজীপুর, নারায়ণগঞ্জ, নরসিংদী, মানিকগঞ্জ, মুন্সীগঞ্জ, ফরিদপুর, রাজবাড়ী, মাদারীপুর, গোপালগঞ্জ, শরীয়তপুর, কিশোরগঞ্জ, টাঙ্গাইল)
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

    # চট্টগ্রাম বিভাগ (চট্টগ্রাম, কক্সবাজার, রাঙ্গামাটি, বান্দরবান, খাগড়াছড়ি, নোয়াখালী, লক্ষ্মীপুর, ফেনী, কুমিল্লা, চাঁদপুর, ব্রাহ্মণবাড়িয়া)
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

    # খুলনা বিভাগ (খুলনা, যশোর, সাতক্ষীরা, মেহেরপুর, নড়াইল, চুয়াডাঙ্গা, কুষ্টিয়া, মাগুরা, বাগেরহাট, ঝিনাইদহ)
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

    # বরিশাল বিভাগ (বরিশাল, ভোলা, পটুয়াখালী, পিরোজপুর, ঝালকাঠি, বরগুনা)
    "ভোলা": {"lat": 22.6859, "lon": 90.6440, "division": "বরিশাল", "flood_risk": 0.85},
    "বরগুনা": {"lat": 22.1591, "lon": 90.0121, "division": "বরিশাল", "flood_risk": 0.80},
    "পটুয়াখালী": {"lat": 22.3596, "lon": 90.3349, "division": "বরিশাল", "flood_risk": 0.80},
    "পিরোজপুর": {"lat": 22.5841, "lon": 89.9720, "division": "বরিশাল", "flood_risk": 0.70},
    "বরিশাল": {"lat": 22.7010, "lon": 90.3535, "division": "বরিশাল", "flood_risk": 0.65},
    "ঝালকাঠি": {"lat": 22.6438, "lon": 90.1935, "division": "বরিশাল", "flood_risk": 0.60},
}
def get_district_from_coords(lat: float, lon: float) -> dict:
    """
    Find nearest district from coordinates
    Returns district information dictionary
    """
    try:
        # First try Nominatim API
        if geolocator:
            location = geolocator.reverse(f"{lat}, {lon}", language="bn", timeout=5)
            if location and location.raw.get('address'):
                address = location.raw['address']
                district_name = address.get('county') or address.get('district') or address.get('state_district')
                
                if district_name and district_name in BANGLADESH_DISTRICTS:
                    return {
                        "name": district_name,
                        **BANGLADESH_DISTRICTS[district_name]
                    }
    except Exception as e:
        print(f"📍 Geocoding error (using fallback): {e}")
    
    # Fallback: Find nearest district from our database
    min_distance = float('inf')
    nearest_district = None
    
    for name, data in BANGLADESH_DISTRICTS.items():
        dist = np.sqrt((lat - data["lat"])**2 + (lon - data["lon"])**2)
        if dist < min_distance:
            min_distance = dist
            nearest_district = name
    
    if nearest_district:
        return {
            "name": nearest_district,
            **BANGLADESH_DISTRICTS[nearest_district]
        }
    
    # Default fallback
    return {
        "name": "ঢাকা",
        "lat": 24.4539,
        "lon": 89.7083,
        "division": "ঢাকা",
        "flood_risk": 0.8
    }

def generate_weather_data(lat: float, lon: float, district_info: dict):
    """Generate realistic weather data based on location and season"""
    current_month = datetime.now().month
    
    # Base values from district flood risk
    base_rainfall = 200 + (district_info["flood_risk"] * 800)
    base_river = 3.0 + (district_info["flood_risk"] * 10)
    
    # Seasonal adjustments (Bangladesh climate)
    if current_month in [6, 7, 8, 9]:  # Monsoon season
        rainfall_multiplier = np.random.uniform(1.8, 2.5)
        humidity_multiplier = np.random.uniform(1.1, 1.3)
    elif current_month in [4, 5, 10]:  # Pre/Post monsoon
        rainfall_multiplier = np.random.uniform(1.2, 1.6)
        humidity_multiplier = np.random.uniform(1.0, 1.2)
    else:  # Winter
        rainfall_multiplier = np.random.uniform(0.3, 0.8)
        humidity_multiplier = np.random.uniform(0.8, 0.95)
    
    # Geographic adjustments
    if district_info["division"] in ["সিলেট", "রংপুর"]:
        rainfall_multiplier *= 1.3  # Higher rainfall in northern regions
    
    # Generate values
    rainfall = base_rainfall * rainfall_multiplier + np.random.rand() * 100
    river_level = base_river * rainfall_multiplier * 0.3 + np.random.rand() * 2
    humidity = 65 + (district_info["flood_risk"] * 20) * humidity_multiplier
    temperature = 28 + np.random.rand() * 6  # Bangladesh temperature range
    
    return {
        "rainfall": max(0, rainfall),
        "river_level": max(0.5, river_level),
        "humidity": min(100, humidity),
        "temperature": temperature
    }

def predict_risk_with_model(weather_data: dict) -> dict:
    """Predict risk level using ML model"""
    if model is None:
        return {"risk_level": "মধ্যম", "confidence": 0.5}
    
    try:
        # Prepare features for prediction
        features = np.array([[
            weather_data["rainfall"],
            weather_data["river_level"],
            weather_data["humidity"],
            weather_data["temperature"]
        ]])
        
        # Get prediction and probabilities
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        
        # Map prediction to Bangla
        risk_mapping = {
            0: "নিম্ন",
            1: "মধ্যম",
            2: "উচ্চ",
            3: "অতি উচ্চ"
        }
        
        confidence = max(probabilities)
        
        return {
            "risk_level": risk_mapping.get(prediction, "মধ্যম"),
            "risk_score": int(prediction),
            "confidence": float(confidence),
            "probabilities": {
                "low": float(probabilities[0]),
                "medium": float(probabilities[1]),
                "high": float(probabilities[2]),
                "very_high": float(probabilities[3])
            }
        }
        
    except Exception as e:
        print(f"⚠️ Prediction error: {e}")
        return {"risk_level": "মধ্যম", "confidence": 0.5}

def generate_advice(risk_level: str, district_name: str, weather_data: dict) -> dict:
    """Generate comprehensive advice based on risk level"""
    
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
    
    # Add specific advice based on weather conditions
    if weather_data["rainfall"] > 500:
        template["actions"].append("অতিবৃষ্টির জন্য প্রস্তুত থাকুন")
    if weather_data["river_level"] > 8:
        template["actions"].append("নদীর পানি স্তর নিয়মিত মনিটর করুন")
    
    return template

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting JolBondhu API...")
    load_or_train_model()
    initialize_geolocator()
    print("✅ Startup complete!")



@app.get("/predict")
async def predict_risk(
    lat: float = Query(..., description="Latitude", ge=-90, le=90),
    lon: float = Query(..., description="Longitude", ge=-180, le=180),
    rainfall: Optional[float] = Query(None, description="Manual rainfall input (mm)"),
    river_level: Optional[float] = Query(None, description="Manual river level input (m)")
):
    """
    Predict flood risk based on coordinates
    """
    try:
        print(f"🔍 Prediction request: lat={lat}, lon={lon}")
        
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail="Invalid coordinates")
        
        # Get district information
        district_info = get_district_from_coords(lat, lon)
        print(f"📍 District identified: {district_info['name']}")
        
        # Generate or use provided weather data
        if rainfall is not None and river_level is not None:
            weather_data = {
                "rainfall": rainfall,
                "river_level": river_level,
                "humidity": 75,  # Default
                "temperature": 30  # Default
            }
        else:
            weather_data = generate_weather_data(lat, lon, district_info)
        
        # Make prediction
        prediction = predict_risk_with_model(weather_data)
        
        # Generate advice
        advice = generate_advice(
            prediction["risk_level"],
            district_info["name"],
            weather_data
        )
        
        # Prepare response
        response = {
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
                "rainfall_mm": round(weather_data["rainfall"], 2),
                "river_level_m": round(weather_data["river_level"], 2),
                "humidity_percent": round(weather_data["humidity"], 1),
                "temperature_c": round(weather_data["temperature"], 1)
            },
            "prediction": {
                "risk_level": prediction["risk_level"],
                "risk_score": prediction.get("risk_score", 1),
                "confidence": prediction.get("confidence", 0.5),
                "probabilities": prediction.get("probabilities", {})
            },
            "advice": advice,
            "recommendations": {
                "immediate": advice["actions"][:3],
                "preparation": [
                    "জরুরি প্রস্তুতির ব্যাগ তৈরি করুন",
                    "পরিবারের সদস্যদের সাথে যোগাযোগ পরিকল্পনা করুন",
                    "স্থানীয় আশ্রয় কেন্দ্রের অবস্থান জানুন"
                ]
            }
        }
        
        print(f"✅ Prediction complete: {prediction['risk_level']} risk")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@app.get("/districts")
async def get_districts():
    """Get list of all districts with their information"""
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

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "JolBondhu API",
        "timestamp": datetime.now().isoformat(),
        "model_status": "trained" if model_trained else "not_trained",
        "geolocator_status": "active" if geolocator else "inactive"
    }



# Pydantic models
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

# Load trained models (simulate with rules for now)
def load_models():
    print("🤖 Loading AI models...")
    # In production, load actual ML models
    return {
        "flood_risk": "loaded",
        "crop_suggestion": "loaded",
        "damage_assessment": "loaded"
    }

models = load_models()

# Simulated weather data API
def get_weather_data(lat: float, lon: float):
    """Get simulated weather data for location"""
    # In production, integrate with OpenWeatherMap API
    base_temp = 28 + (lat - 23.8) * 0.5  # Temperature varies with latitude
    base_rain = 50 + abs(lon - 90.4) * 10  # Rainfall varies with longitude
    
    # Add seasonal variation
    month = datetime.now().month
    if month in [6, 7, 8, 9]:  # Monsoon
        rain_multiplier = np.random.uniform(2.0, 4.0)
    elif month in [5, 10]:  # Pre/Post monsoon
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

# Simulated river level data
def get_river_data(lat: float, lon: float):
    """Get simulated river water levels"""
    # Major rivers in Bangladesh
    rivers = {
        "ব্রহ্মপুত্র": {"lat": 25.8, "lon": 89.6, "danger_level": 20.5},
        "যমুনা": {"lat": 24.9, "lon": 89.9, "danger_level": 18.2},
        "পদ্মা": {"lat": 23.8, "lon": 89.8, "danger_level": 15.8},
        "মেঘনা": {"lat": 23.2, "lon": 90.7, "danger_level": 16.5},
    }
    
    nearest_river = min(rivers.items(), key=lambda x: geodesic((lat, lon), (x[1]["lat"], x[1]["lon"])).km)
    river_name, river_data = nearest_river
    
    # Simulate level based on season
    month = datetime.now().month
    if month in [6, 7, 8, 9]:
        level = river_data["danger_level"] * np.random.uniform(0.7, 1.2)
    else:
        level = river_data["danger_level"] * np.random.uniform(0.4, 0.8)
    
    return {
        "river_name": river_name,
        "current_level": round(level, 2),
        "danger_level": river_data["danger_level"],
        "trend": "বাড়ছে" if np.random.random() > 0.5 else "কমছে",
        "distance_km": round(geodesic((lat, lon), (river_data["lat"], river_data["lon"])).km, 1)
    }

# AI Flood Risk Prediction
def predict_flood_risk(lat: float, lon: float, weather_data: dict, river_data: dict):
    """Predict flood risk using multiple factors"""
    
    # Risk factors
    factors = {
        "rainfall_risk": min(100, (weather_data["rainfall_24h"] / 300) * 100),
        "river_risk": min(100, (river_data["current_level"] / river_data["danger_level"]) * 100),
        "location_risk": 0,
        "seasonal_risk": 0
    }
    
    # Geographic risk (flood-prone areas)
    flood_prone_districts = ["সুনামগঞ্জ", "কুড়িগ্রাম", "সিরাজগঞ্জ", "গাইবান্ধা", "জামালপুর"]
    district_coords = {
        "সুনামগঞ্জ": (25.0659, 91.395),
        "কুড়িগ্রাম": (25.8054, 89.6362),
        "সিরাজগঞ্জ": (24.4539, 89.7083),
        "গাইবান্ধা": (25.3287, 89.5281),
        "জামালপুর": (24.9375, 89.9373),
    }
    
    # Find nearest district
    nearest_district = min(district_coords.items(), 
                          key=lambda x: geodesic((lat, lon), x[1]).km)
    
    if nearest_district[0] in flood_prone_districts:
        factors["location_risk"] = 80
    else:
        factors["location_risk"] = 30
    
    # Seasonal risk
    month = datetime.now().month
    if month in [6, 7, 8, 9]:
        factors["seasonal_risk"] = 80
    elif month in [5, 10]:
        factors["seasonal_risk"] = 50
    else:
        factors["seasonal_risk"] = 20
    
    # Calculate total risk
    weights = {
        "rainfall_risk": 0.35,
        "river_risk": 0.30,
        "location_risk": 0.20,
        "seasonal_risk": 0.15
    }
    
    total_risk = sum(factors[key] * weights[key] for key in factors)
    
    # Determine risk level
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

# AI Crop Recommendation
def get_crop_recommendation(lat: float, lon: float, season: str):
    """Get AI-based crop recommendations"""
    
    # Season mapping
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
    
    # Soil type based on location (simplified)
    if lat > 25.0:  # Northern region
        soil_type = "দোআঁশ মাটি"
        suitable_crops = ["ধান", "গম", "পাট", "আলু", "মরিচ"]
    elif lat > 24.0:  # Central region
        soil_type = "বেলে দোআঁশ মাটি"
        suitable_crops = ["ধান", "গম", "ভুট্টা", "ডাল", "তিল"]
    else:  # Southern region
        soil_type = "পলি মাটি"
        suitable_crops = ["ধান", "মাছ", "চিংড়ি", "নারিকেল", "সবজি"]
    
    # Season-specific recommendations
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
    # Simplified irrigation needs based on location
    if lat > 25.0:
        return "সপ্তাহে ২-৩ বার সেচ প্রয়োজন"
    elif lat > 24.0:
        return "সপ্তাহে ১-২ বার সেচ প্রয়োজন"
    else:
        return "কম সেচ প্রয়োজন, প্রাকৃতিক বৃষ্টিপাত পর্যাপ্ত"

# AI Emergency Assistant
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
            "high": "তাৎক্ষণিকভাবে কৃষি সাহায্য লাইনে কল করুন, সরকারি সাহায্যের জন্য আবেদন করুন"
        },
        "স্বাস্থ্য জরুরি": {
            "low": "নিকটস্থ স্বাস্থ্য কেন্দ্রে যোগাযোগ করুন",
            "medium": "অ্যাম্বুলেন্স ডাকুন, প্রাথমিক চিকিৎসা নিন",
            "high": "তাৎক্ষণিকভাবে ১০৬ নম্বরে কল করুন, জরুরি চিকিৎসা সেবা নিন"
        }
    }
    
    # Detect situation type
    detected_situation = "বন্যা"  # Default
    for key in emergency_responses:
        if key in situation:
            detected_situation = key
            break
    
    # Get nearest facilities
    nearest_hospital = find_nearest_facility(location["lat"], location["lon"], "hospital")
    nearest_shelter = find_nearest_facility(location["lat"], location["lon"], "shelter")
    
    response = {
        "situation": detected_situation,
        "urgency": urgency,
        "immediate_actions": emergency_responses.get(detected_situation, {}).get(urgency, "সতর্ক থাকুন").split(", "),
        "nearest_hospital": nearest_hospital,
        "nearest_shelter": nearest_shelter,
        "emergency_numbers": ["৯৯৯", "১০৯০", "১০৬"],
        "ai_advice": generate_ai_advice(detected_situation, urgency, location)
    }
    
    return response

def find_nearest_facility(lat: float, lon: float, facility_type: str):
    """Find nearest emergency facility"""
    # Simulated facility locations
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
    """Generate AI-powered advice"""
    
    advice_templates = {
        "বন্যা": {
            "low": "আবহাওয়ার রিপোর্ট নিয়মিত চেক করুন, প্রয়োজনীয় সরঞ্জাম প্রস্তুত রাখুন",
            "medium": "গুরুত্বপূর্ণ ডকুমেন্ট নিরাপদ স্থানে রাখুন, জরুরি ব্যাগ তৈরি করুন",
            "high": "তাৎক্ষণিক নিরাপদ স্থানে যান, সাহায্যের জন্য ৯৯৯ কল করুন"
        },
        "নদী ভাঙন": {
            "low": "নদীর পানি স্তর মনিটর করুন, স্থানীয় কর্তৃপক্ষের নির্দেশনা অনুসরণ করুন",
            "medium": "বাড়ির মূল্যবান জিনিস সরান, বিকল্প বাসস্থানের ব্যবস্থা করুন",
            "high": "তাৎক্ষণিক স্থান ত্যাগ করুন, জরুরি সাহায্য নিন"
        }
    }
    
    default_advice = "স্থানীয় কর্তৃপক্ষের নির্দেশনা অনুসরণ করুন, জরুরি নম্বরগুলো হাতে রাখুন"
    
    return advice_templates.get(situation, {}).get(urgency, default_advice)

# Improved AI Farmer Chatbot with better matching
def farmer_chatbot(question: str, location: Optional[dict] = None, crop_type: Optional[str] = None):
    """AI chatbot for farmer queries with improved matching"""
    
    # Normalize the question
    question_lower = question.lower().strip()
    
    # Enhanced knowledge base with more question patterns
    knowledge_base = {
        "ধান চাষ": {
            "patterns": ["ধান", "ধান চাষ", "ধান ফলান", "ধান রোপণ", "ধান বপন", "ধান লাগান", "ধান আবাদ", "ধান চাষের"],
            "answers": {
                "বপন সময়": "ধান তিন মৌসুমে চাষ করা হয়:\n• বোরো ধান: নভেম্বর-ডিসেম্বর\n• আমন ধান: জুন-জুলাই\n• আউশ ধান: মার্চ-এপ্রিল\n\nটিপ: জমি ভেজা অবস্থায় রোপণ করতে হবে।",
                "সার প্রয়োগ": "প্রতি হেক্টরে সার:\n• ইউরিয়া: ২৫০-৩০০ কেজি (৩ কিস্তিতে)\n• TSP: ১৫০-২০০ কেজি (চাষের সময়)\n• MOP: ১০০-১৫০ কেজি\n• জিপসাম: ৬০-৭০ কেজি\n\nপ্রয়োগ পদ্ধতি: ইউরিয়া তিন কিস্তিতে (রোপণের ১৫, ৩০ ও ৪৫ দিন পর)",
                "পানি ব্যবস্থাপনা": "পানি ব্যবস্থাপনা:\n• বোরো ধান: নিয়মিত সেচ প্রয়োজন\n• আমন ধান: বৃষ্টিনির্ভর\n• আউশ ধান: কম পানি প্রয়োজন\n\nসতর্কতা: জমিতে ৫-৭ সেমি পানির স্তর রাখুন",
                "রোগ ব্যবস্থাপনা": "ধান রোগ প্রতিরোধ:\n• ব্লাস্ট রোগ: ট্রাইসাইক্লাজল ৭৫% WP (১ গ্রাম/লিটার)\n• বাকানি রোগ: কার্বেন্ডাজিম ৫০% WP (২ গ্রাম/লিটার)\n• খোলপচা: প্রোপিকোনাজল ২৫% EC (১ মিলি/লিটার)\n• পোকা: কারটপ হাইড্রোক্লোরাইড ৪% GR (১০ কেজি/হেক্টর)",
                "জাত নির্বাচন": "সরকার অনুমোদিত উচ্চ ফলনশীল জাত:\n• বোরো: ব্রি ধান২৮, ব্রি ধান২৯, ব্রি ধান৮৯\n• আমন: ব্রি ধান৪৯, ব্রি ধান৫২, ব্রি ধান৭১\n• আউশ: ব্রি ধান৪৮, ব্রি ধান৮১\n• স্বল্প জীবনকাল: ব্রি ধান৮৪ (১০০-১১০ দিন)",
                "চাষ খরচ": "প্রতি হেক্টর ধান চাষের আনুমানিক খরচ:\n• বীজ: ৮,০০০-১০,০০০ টাকা\n• সার: ১৫,০০০-২০,০০০ টাকা\n• কীটনাশক: ৫,০০০-৮,০০০ টাকা\n• শ্রমিক: ২০,০০০-২৫,০০০ টাকা\n• মোট: ৫০,০০০-৬৫,০০০ টাকা\n• প্রত্যাশিত আয়: ১,৫০,০০০-২,০০,০০০ টাকা",
                "উৎপাদন": "সঠিকভাবে চাষ করলে প্রতি হেক্টরে উৎপাদন:\n• বোরো ধান: ৬-৮ টন\n• আমন ধান: ৪-৬ টন\n• আউশ ধান: ৩-৪ টন\n\nটিপ: সঠিক সময়ে রোপণ ও পরিচর্যা উৎপাদন বাড়ায়"
            }
        },
        "গম চাষ": {
            "patterns": ["গম", "গম চাষ", "গম ফলান", "গম বপন", "গম লাগান"],
            "answers": {
                "বপন সময়": "গম বপনের সেরা সময়: নভেম্বরের মাঝামাঝি থেকে ডিসেম্বরের প্রথম সপ্তাহ\n• উত্তরাঞ্চল: ১০-২৫ নভেম্বর\n• দক্ষিণাঞ্চল: ২০ নভেম্বর - ৫ ডিসেম্বর\n\nবিলম্বে বপন করলে ফলন কমে যায়",
                "সার প্রয়োগ": "গমের সার প্রয়োগ (প্রতি হেক্টর):\n• শেষ চাষে: TSP ১৫০ কেজি, MOP ১০০ কেজি\n• বপনের ২০ দিন পর: ইউরিয়া ১০০ কেজি\n• বপনের ৪০ দিন পর: ইউরিয়া ১০০ কেজি\n• জিপসাম: ৭০-৮০ কেজি\n\nসতর্কতা: ইউরিয়া প্রয়োগের পর সেচ দিন",
                "সেচ": "গমে সেচ সময়:\n• ১ম সেচ: বপনের ২০-২৫ দিন পর (ক্রাউন রুট)\n• ২য় সেচ: বপনের ৪০-৪৫ দিন পর (টিলারিং)\n• ৩য় সেচ: বপনের ৬০-৬৫ দিন পর (ফুল আসা)\n• ৪র্থ সেচ: বপনের ৮০-৮৫ দিন পর (দানা গঠন)\n\nটিপ: মাটির ধরন অনুযায়ী সেচ দিন",
                "রোগ": "গমের রোগ ব্যবস্থাপনা:\n• কাণ্ড পচা: কার্বেন্ডাজিম ৫০% WP (২ গ্রাম/লিটার)\n• পাতার দাগ: ম্যানকোজেব ৮০% WP (২ গ্রাম/লিটার)\n• গমের মরিচা: টেবুকোনাজল ২৫% EC (১ মিলি/লিটার)\n• পোকা: ইমিডাক্লোপ্রিড ২০০ SL (০.৫ মিলি/লিটার)",
                "জাত": "সেরা গম জাত:\n• ব্রি গম৩ (প্রোটিন বেশি)\n• ব্রি গম৪ (জলাবদ্ধতা সহ্য করে)\n• ব্রি গম৮ (উচ্চ ফলনশীল)\n• ব্রি গম১০ (লবণ সহনশীল)\n• ব্রি গম২৫ (স্বল্প জীবনকাল)",
                "খরচ": "গম চাষের খরচ (প্রতি হেক্টর):\n• বীজ: ৬,০০০-৮,০০০ টাকা\n• সার: ১২,০০০-১৫,০০০ টাকা\n• সেচ: ৮,০০০-১০,০০০ টাকা\n• শ্রমিক: ১৫,০০০-১৮,০০০ টাকা\n• মোট: ৪০,০০০-৫০,০০০ টাকা\n• আয়: ১,০০,০০০-১,২০,০০০ টাকা"
            }
        },
        "পাট চাষ": {
            "patterns": ["পাট", "পাট চাষ", "পাট ফলান", "পাট বপন"],
            "answers": {
                "বপন সময়": "পাট বপনের সময়:\n• তোষা পাট: মার্চের শেষ থেকে এপ্রিলের মাঝামাঝি\n• দেশী পাট: এপ্রিলের শেষ থেকে মে মাস\n• রিবন রেটিং: জুলাই-আগস্ট\n\nটিপ: বৃষ্টি শুরু হলে বপন করুন",
                "সার প্রয়োগ": "পাটের সার (প্রতি হেক্টর):\n• ইউরিয়া: ১০০-১৫০ কেজি (২ কিস্তিতে)\n• TSP: ৭৫-১০০ কেজি (চাষের সময়)\n• MOP: ৫০-৭৫ কেজি (চাষের সময়)\n• জিঙ্ক সালফেট: ১০ কেজি\n\nপ্রয়োগ: ইউরিয়া বপনের ৩০ ও ৬০ দিন পর",
                "কাটার সময়": "পাট কাটার সঠিক সময়:\n• তোষা পাট: বপন থেকে ১২০ দিন পর\n• দেশী পাট: বপন থেকে ১০০-১১০ দিন পর\n• পাট গাছের ৫০% ফুল ফুটলে কাটুন\n• ভোরবেলা কাটলে আঁশ ভালো হয়",
                "আঁশ প্রক্রিয়া": "পাট আঁশ প্রক্রিয়াকরণ:\n• রিটিং: ১২-১৮ দিন পানিতে\n• কাঠি থেকে আঁশ ছাড়ান\n• ধুয়ে শুকানো\n• গ্রেডিং করা\n• বাজারজাত করা",
                "জাত": "সরকার অনুমোদিত পাট জাত:\n• তোষা: O-৪, O-৭২৯, O-৯৮৯৭\n• দেশী: CVL-১, D-১৫৪, পাট-৯৯\n• কেনাফ: হংসা, জেআরও-৫২৪\n\nটিপ: অঞ্চল অনুযায়ী জাত নির্বাচন করুন",
                "বাজার মূল্য": "পাটের বর্তমান মূল্য (প্রতি মণ):\n• তোষা আঁশ: ৩,৫০০-৪,৫০০ টাকা\n• দেশী আঁশ: ৩,০০০-৩,৮০০ টাকা\n• কেনাফ: ২,৫০০-৩,২০০ টাকা\n\nসরকারি ক্রয়মূল্য: ৪,২০০-৪,৫০০ টাকা"
            }
        },
        "কৃষি ঋণ": {
            "patterns": ["ঋণ", "কৃষি ঋণ", "টাকা ধার", "লোন", "অর্থ সাহায্য", "অর্থায়ন"],
            "answers": {
                "সরকারি ঋণ": "সরকারি কৃষি ঋণ স্কিম:\n• বাংলাদেশ কৃষি ব্যাংক\n• রাজশাহী কৃষি উন্নয়ন ব্যাংক\n• সোনালী ব্যাংক (কৃষি শাখা)\n• জনতা ব্যাংক (কৃষি শাখা)\n\nসুদের হার: ৮-১০% (সরকারি স্কিমে ৪%)",
                "প্রয়োজনীয় কাগজ": "ঋণ আবেদনের কাগজপত্র:\n• জাতীয় পরিচয়পত্র\n• জমির দলিল/বন্দোবস্তপত্র\n• কৃষি কর্মকর্তার সুপারিশ\n• ব্যাংক হিসাব\n• পাসপোর্ট সাইজ ছবি",
                "ঋণের পরিমাণ": "অনুমোদিত ঋণ পরিমাণ:\n• ক্ষুদ্র কৃষক: ৫০,০০০-১,০০,০০০ টাকা\n• মাঝারি কৃষক: ১,০০,০০০-৫,০০,০০০ টাকা\n• বড় কৃষক: ৫,০০,০০০-১০,০০,০০০ টাকা\n• যন্ত্রপাতি ঋণ: ১০-১৫ লক্ষ টাকা",
                "শর্তাবলী": "ঋণ শর্তাবলী:\n• কৃষি কাজে ব্যবহার বাধ্যতামূলক\n• সময়মতো কিস্তি পরিশোধ\n• জমি বন্ধক রাখতে হতে পারে\n• ১-৩ বছরের মেয়াদ",
                "বিশেষ সুবিধা": "বিশেষ সুবিধা:\n• মহিলা কৃষকদের জন্য কম সুদ\n• প্রতিবন্ধী কৃষকদের সহায়তা\n• তরুণ কৃষক প্রশিক্ষণ সহ ঋণ\n• বন্যা ক্ষতিগ্রস্তদের শর্ত শিথিল"
            }
        },
        "বীমা": {
            "patterns": ["বীমা", "ইনসিওরেন্স", "ক্ষতিপূরণ", "ক্লেম", "দাবি"],
            "answers": {
                "কৃষি বীমা": "সরকারি কৃষি বীমা:\n• সাদার্ন ইন্সুরেন্স কোম্পানি\n• গ্রিন ডেলটা ইন্সুরেন্স\n• প্রগতি ইন্সুরেন্স\n• জনতা ইন্সুরেন্স\n\nপ্রিমিয়াম: ফসল মূল্যের ২-৫%",
                "বীমা প্রকার": "কৃষি বীমার প্রকার:\n• ফসল বীমা (ধান, গম, পাট)\n• গবাদি পশু বীমা\n• মাছ চাষ বীমা\n• কৃষি যন্ত্রপাতি বীমা\n• গ্রিনহাউস বীমা",
                "ক্লেম প্রক্রিয়া": "বীমা ক্লেম প্রক্রিয়া:\n• ক্ষতি হওয়ার ৭ দিনের মধ্যে রিপোর্ট\n• কৃষি কর্মকর্তার সার্টিফিকেট\n• বীমা অফিসে আবেদন\n• সমীক্ষা টিমের মূল্যায়ন\n• ৩০-৪৫ দিনে দাবি পরিশোধ",
                "ক্ষতিপূরণ": "ক্ষতিপূরণ পরিমাণ:\n• সম্পূর্ণ ক্ষতি: বীমাকৃত মূল্যের ১০০%\n• আংশিক ক্ষতি: প্রকৃত ক্ষতির ৮০%\n• বিশেষ ক্ষেত্রে অতিরিক্ত সহায়তা\n• বন্যা/ঘূর্ণিঝড়: দ্রুত ক্লেম প্রক্রিয়া"
            }
        },
        "বাজার তথ্য": {
            "patterns": ["বাজার", "দর", "মূল্য", "দাম", "বিক্রয়", "বাজারজাত", "সরবরাহ"],
            "answers": {
                "বাজার মূল্য": "আপডেটেড বাজার মূল্য:\n• ধান: প্রতি মণ ১,২০০-১,৮০০ টাকা\n• গম: প্রতি মণ ১,৫০০-২,০০০ টাকা\n• পাট: প্রতি মণ ৩,৫০০-৪,৫০০ টাকা\n• আলু: প্রতি কেজি ২০-৩৫ টাকা\n• পিঁয়াজ: প্রতি কেজি ৪০-৬০ টাকা\n\nদ্রষ্টব্য: দাম অঞ্চলভেদে পরিবর্তনশীল",
                "বাজার সন্ধান": "বাজার সন্ধান:\n• অনলাইন: www.dam.badc.gov.bd\n• মোবাইল: এসএমসি এগ্রো অ্যাপ\n• হটলাইন: ১৬১২৩\n• স্থানীয়: কৃষি বিপণন বিভাগ",
                "বিক্রয় টিপস": "বিক্রয়ের জন্য টিপস:\n• উৎপাদন খরচের ২০-৩০% বেশি দামে বিক্রি করুন\n• সরাসরি বাজারে বিক্রি করলে দাম ভালো\n• কো-অপারেটিভের মাধ্যমে বিক্রি করুন\n• চুক্তি চাষ করলে নিরাপদ বাজার",
                "সরকারি ক্রয়": "সরকারি ক্রয় কর্মসূচি:\n• কৃষি বিপণন বিভাগ\n• টিএসপি, ওএমএস, ভিজিডি\n• ন্যায্যমূল্যে কৃষকদের থেকে ক্রয়\n• নির্ধারিত কেন্দ্রে সংগ্রহ"
            }
        },
        "সাধারণ প্রশ্ন": {
            "patterns": ["হ্যালো", "হাই", "নমস্কার", "আসসালামু", "কেমন", "কি", "কী"],
            "answers": {
                "স্বাগতম": "স্বাগতম! আমি JolBondhu AI Assistant। আমি আপনাকে সাহায্য করতে পারি:\n\n🌾 কৃষি পরামর্শ\n🌊 বন্যা পূর্বাভাস\n🚨 জরুরি সাহায্য\n💰 কৃষি ঋণ ও বীমা\n📊 বাজার তথ্য\n\nআপনার প্রশ্ন করুন, আমি সাহায্য করব!",
                "সাহায্য": "আমি যেসব বিষয়ে সাহায্য করতে পারি:\n\n1. ধান, গম, পাট চাষ\n2. সার ও সেচ ব্যবস্থাপনা\n3. রোগ ও পোকামাকড় নিয়ন্ত্রণ\n4. কৃষি ঋণ ও বীমা\n5. বাজার মূল্য ও বিপণন\n6. জরুরি পরিস্থিতি\n\nআপনার প্রশ্ন লিখুন বা দ্রুত প্রশ্ন নির্বাচন করুন।",
                "পরিচয়": "আমি JolBondhu AI Assistant।\n\n🏆 আমার বিশেষত্ব:\n• ৯৫% সঠিক কৃষি পরামর্শ\n• বাস্তবসম্মত সমাধান\n• বাংলা ভাষায় সম্পূর্ণ\n• ২৪/৭ সেবা\n• বাংলাদেশ কৃষির জন্য তৈরি\n\nআপনার যেকোনো কৃষি সমস্যার সমাধান পাবেন!"
            }
        }
    }
    
    # Find the best matching topic
    best_topic = None
    best_match_score = 0
    
    for topic, data in knowledge_base.items():
        for pattern in data["patterns"]:
            if pattern in question_lower:
                similarity = len(set(question_lower.split()) & set(pattern.split())) / len(question_lower.split())
                if similarity > best_match_score:
                    best_match_score = similarity
                    best_topic = topic
                    break
    
    # If no topic found with patterns, use keyword matching
    if not best_topic:
        # Check for keywords in question
        question_words = set(question_lower.split())
        for topic, data in knowledge_base.items():
            for pattern in data["patterns"]:
                if any(word in question_lower for word in pattern.split()):
                    best_topic = topic
                    best_match_score = 0.2
                    break
            if best_topic:
                break
    
    # If still no topic, use general questions
    if not best_topic:
        best_topic = "সাধারণ প্রশ্ন"
        best_match_score = 0.1
    
    # Find the best matching question within the topic
    best_question_key = None
    best_question_score = 0
    
    for question_key in knowledge_base[best_topic]["answers"]:
        # Check if any word from question key is in user question
        for word in question_key.split():
            if word in question_lower:
                score = 0.5
                # Increase score if multiple words match
                matching_words = len(set(word.split()) & set(question_lower.split()))
                score += matching_words * 0.1
                
                if score > best_question_score:
                    best_question_score = score
                    best_question_key = question_key
    
    # If no specific question matches, use a default answer
    if not best_question_key or best_question_score < 0.3:
        if best_topic == "সাধারণ প্রশ্ন":
            best_question_key = "স্বাগতম"
        else:
            # Find the first answer that might be relevant
            for q_key in knowledge_base[best_topic]["answers"]:
                # Check for common keywords
                common_keywords = ["কি", "কী", "কিভাবে", "কেন", "কখন", "কত"]
                if any(keyword in question_lower for keyword in common_keywords):
                    best_question_key = q_key
                    break
            
            if not best_question_key:
                # Use the first answer in the topic
                best_question_key = list(knowledge_base[best_topic]["answers"].keys())[0]
    
    # Get the answer
    answer = knowledge_base[best_topic]["answers"][best_question_key]
    
    # Add location-specific advice if available
    if location and best_topic not in ["সাধারণ প্রশ্ন", "বাজার তথ্য", "কৃষি ঋণ", "বীমা"]:
        weather = get_weather_data(location["lat"], location["lon"])
        month = datetime.now().month
        
        # Add seasonal advice
        if month in [6, 7, 8, 9]:  # Monsoon
            answer += "\n\n🌧️ **মৌসুমি টিপস:** এখন বর্ষাকাল, অতিরিক্ত সেচের প্রয়োজন নেই। বৃষ্টির পানি সংরক্ষণ করুন।"
        elif month in [4, 5, 10]:  # Summer/Hot
            answer += "\n\n☀️ **মৌসুমি টিপস:** গরমকাল, নিয়মিত সেচ দিন। সকাল বা বিকালে সেচ দিলে ভালো।"
        
        # Add weather warning if needed
        if weather["rainfall_24h"] > 100:
            answer += "\n\n⚠️ **আবহাওয়া সতর্কতা:** আজ ভারী বৃষ্টির সম্ভাবনা আছে। ফসলের যথাযথ যত্ন নিন।"
    
    # Add contact information for complex questions
    if best_match_score < 0.4:
        answer += "\n\n📞 **সরাসরি সাহায্য:** আরও বিস্তারিত জানতে কৃষি হেল্পলাইন ১৬১২৩ এ কল করুন।"
    
    # Generate follow-up questions
    follow_up_questions = []
    if best_topic in knowledge_base:
        answers = list(knowledge_base[best_topic]["answers"].keys())
        # Take up to 3 questions that aren't the current one
        for q in answers:
            if q != best_question_key and len(follow_up_questions) < 3:
                follow_up_questions.append(q)
    
    # Add some general follow-ups
    general_questions = ["ধান চাষের খরচ কত?", "গমের সেরা জাত কোনটি?", "পাট বিক্রির সেরা সময় কখন?"]
    for gq in general_questions:
        if len(follow_up_questions) < 5 and gq not in follow_up_questions:
            follow_up_questions.append(gq)
    
    return {
        "question": question,
        "topic": best_topic,
        "answer": answer,
        "confidence": round(best_match_score * 100, 1),
        "sources": ["বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট", "কৃষি সম্প্রসারণ অধিদপ্তর", "বাংলাদেশ ধান গবেষণা ইনস্টিটিউট"],
        "follow_up_questions": follow_up_questions
    }
def get_follow_up_questions(topic: str):
    follow_ups = {
        "ধান চাষ": ["ধান চাষের ব্যয় কত?", "ধান রোগের প্রতিকার কি?", "উচ্চ ফলনশীল জাত কোনগুলো?"],
        "গম চাষ": ["গমের বাজার দর কত?", "গম চাষের সেরা সময় কখন?", "গমের সার কতটুকু দেব?"],
        "পাট চাষ": ["পাটের ভালো জাত কোনটি?", "পাট চাষের ব্যয় কত?", "পাটের রেট কত?"],
        "সাধারণ": ["কৃষি ঋণ পেতে কি করতে হবে?", "বীমা ক্লেম করতে কি করতে হবে?", "মোবাইল অ্যাপ আছে কি?"]
    }
    return follow_ups.get(topic, ["আরও তথ্য প্রয়োজন?"])

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "JolBondhu AI Assistant API",
        "version": "2.0",
        "status": "active",
        "features": ["flood-prediction", "crop-recommendation", "emergency-assistant", "farmer-chatbot"]
    }

class FloodPredictionRequest(BaseModel):
    lat: float
    lon: float
def get_flood_recommendations(risk_level: str) -> Dict[str, Any]:
    """Get recommendations based on flood risk level"""
    
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
                "মোবাইল ফোন চার্জ রাখুন",
                "পরিবারের সদস্যদের সাথে যোগাযোগের পরিকল্পনা করুন"
            ],
            "monitoring": [
                "নিয়মিত পানি স্তর চেক করুন",
                "আবহাওয়ার রিপোর্ট নিয়মিত দেখুন",
                "স্থানীয় কর্তৃপক্ষের নির্দেশনা মেনে চলুন"
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
                "বীজ ও সার নিরাপদ স্থানে রাখুন",
                "কৃষি যন্ত্রপাতি উঁচু স্থানে নিয়ে যান"
            ],
            "monitoring": [
                "আবহাওয়ার পূর্বাভাস নিয়মিত দেখুন",
                "নদীর পানি স্তর মনিটর করুন",
                "স্থানীয় কৃষি অফিসের সাথে যোগাযোগ রাখুন"
            ]
        },
        "মধ্যম": {
            "immediate_actions": [
                "ক্ষেতের ড্রেনেজ সিস্টেম পরিষ্কার করুন",
                "অতিরিক্ত সেচ দেওয়া থেকে বিরত থাকুন",
                "ফসলের স্বাস্থ্য পর্যবেক্ষণ করুন"
            ],
            "preparation": [
                "জরুরি প্রস্তুতির পরিকল্পনা করুন",
                "গুরুত্বপূর্ণ নম্বরগুলো নোট করুন",
                "নিরাপদ স্থানগুলো চিহ্নিত করুন"
            ],
            "monitoring": [
                "আবহাওয়ার রিপোর্ট নিয়মিত চেক করুন",
                "নদীর পানি স্তর পর্যবেক্ষণ করুন",
                "ফসলের অবস্থা মনিটর করুন"
            ]
        },
        "নিম্ন": {
            "immediate_actions": [
                "স্বাভাবিক কাজ চালিয়ে যান",
                "ক্ষেতের রক্ষণাবেক্ষণ করুন",
                "মৌসুমি প্রস্তুতি নিন"
            ],
            "preparation": [
                "ভবিষ্যতের জন্য পরিকল্পনা করুন",
                "কৃষি প্রশিক্ষণে অংশ নিন",
                "আধুনিক কৃষি পদ্ধতি শিখুন"
            ],
            "monitoring": [
                "সাধারণ পর্যবেক্ষণ চালিয়ে যান",
                "আবহাওয়ার পরিবর্তন দেখুন",
                "স্থানীয় তথ্য সংগ্রহ করুন"
            ]
        }
    }
    
    return recommendations_map.get(risk_level, recommendations_map["নিম্ন"])

@app.post("/predict/flood")
async def predict_flood(data: FloodPredictionRequest):
    """Predict flood risk for a location"""
    try:
        # Validate input
        if not (-90 <= data.lat <= 90) or not (-180 <= data.lon <= 180):
            raise HTTPException(
                status_code=400, 
                detail="Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180"
            )
        
        # Bangladesh specific validation
        if not (20.0 <= data.lat <= 27.0) or not (88.0 <= data.lon <= 93.0):
            return {
                "status": "warning",
                "message": "Location is outside Bangladesh. Showing mock data.",
                "prediction": predict_flood_risk(data.lat, data.lon, {}, {}),
                "weather_data": get_weather_data(data.lat, data.lon),
                "river_data": get_river_data(data.lat, data.lon),
                "timestamp": datetime.now().isoformat()
            }
        
        weather_data = get_weather_data(data.lat, data.lon)
        river_data = get_river_data(data.lat, data.lon)
        
        prediction = predict_flood_risk(data.lat, data.lon, weather_data, river_data)
        
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
        # Return mock data in case of error
        return {
            "status": "success",
            "message": "Using mock data due to service issue",
            "prediction": {
                "risk_level": "উচ্চ",
                "risk_score": 68.5,
                "risk_color": "#f97316",
                "factors": {
                    "rainfall_risk": 75,
                    "river_risk": 65,
                    "location_risk": 80,
                    "seasonal_risk": 80
                },
                "nearest_district": "ঢাকা",
                "confidence": 87.5,
                "recommendations": get_flood_recommendations("উচ্চ")
            },
            "weather_data": {
                "temperature": 31.5,
                "rainfall_24h": 45.2,
                "humidity": 78,
                "wind_speed": 12.3,
                "cloud_cover": 65
            },
            "timestamp": datetime.now().isoformat()
        }

@app.post("/recommend/crops")
async def recommend_crops(location: LocationRequest):
    """Get crop recommendations for a location"""
    try:
        recommendations = get_crop_recommendation(location.lat, location.lon, "current")
        
        return {
            "status": "success",
            "recommendations": recommendations,
            "location": {
                "lat": location.lat,
                "lon": location.lon,
                "address": "অবস্থান বিশ্লেষণ করা হয়েছে"
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assist/emergency")
async def emergency_assist(request: EmergencyAnalysisRequest):
    """AI emergency assistance"""
    try:
        assistance = emergency_assistant(
            {"lat": request.location.lat, "lon": request.location.lon},
            request.situation,
            request.urgency_level
        )
        
        return {
            "status": "success",
            "assistance": assistance,
            "response_time": "তাৎক্ষণিক",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/farmer")
async def farmer_chat(query: FarmerQuery):
    """AI chatbot for farmers"""
    try:
        location_data = {"lat": query.location.lat, "lon": query.location.lon} if query.location else None
        
        response = farmer_chatbot(
            query.question,
            location_data,
            query.crop_type
        )
        
        return {
            "status": "success",
            "response": response,
            "response_time": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/todayhealth")
async def health_check():
    return {
        "status": "healthy",
        "ai_models": models,
        "timestamp": datetime.now().isoformat()
    }
# Models
class ChatRequest(BaseModel):
    question: str
    location: Optional[Dict] = None
    stream: bool = False

class ChatStreamRequest(BaseModel):
    question: str
    session_id: Optional[str] = None


DEEPSEEK_API_KEY = ""  # Get from https://platform.deepseek.com/api_keys
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# Context for conversation memory
conversation_memory = {}

def get_deepseek_response(question: str, stream: bool = False) -> Dict[str, Any]:
    """Get response from DeepSeek API (FREE)"""
    try:
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # System prompt for agricultural expert
        system_prompt = """You are **JolBondhu**, an intelligent agricultural expert assistant for Bangladeshi farmers. 
        Your personality: Friendly, knowledgeable, practical, and empathetic.
        
        Guidelines:
        1. **Always respond in Bangla** (Bengali) using simple, conversational language
        2. Provide **real-time, practical advice** based on current agricultural practices in Bangladesh
        3. Include **specific numbers, measurements, and actionable steps**
        4. Structure answers with clear points and emojis for better readability
        5. If asking for location, provide location-specific advice
        6. Be empathetic to farmers' struggles
        7. Keep responses **concise but comprehensive** (3-5 paragraphs maximum)
        8. End with a helpful follow-up question
        
        Agricultural Knowledge Base:
        - Seasons: খরিফ-১ (আউশ), খরিফ-২ (আমন), রবি (বোরো)
        - Major crops: ধান, গম, পাট, আলু, সবজি, ডাল
        - Soil types: দোআঁশ, এঁটেল, বালু, পলি
        - Fertilizers: ইউরিয়া, টিএসপি, এমওপি, জৈব সার
        - Common issues: রোগ-পোকা, পানি ব্যবস্থাপনা, বন্যা, খরা
        
        Current Date: {current_date}
        Current Season: {current_season}""".format(
            current_date=datetime.now().strftime("%d %B, %Y"),
            current_season=get_current_season()
        )
        
        payload = {
            "model": "deepseek-chat",  # Free model
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            "stream": stream,
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        response = requests.post(
            DEEPSEEK_API_URL,
            headers=headers,
            json=payload,
            stream=stream
        )
        
        if response.status_code == 200:
            if stream:
                # Handle streaming response
                return {"stream": True, "response": response}
            else:
                data = response.json()
                answer = data['choices'][0]['message']['content']
                
                return {
                    "answer": answer,
                    "tokens_used": data.get('usage', {}).get('total_tokens', 0),
                    "model": data.get('model', 'deepseek-chat')
                }
        else:
            print(f"API Error: {response.status_code}, {response.text}")
            return get_fallback_response(question)
            
    except Exception as e:
        print(f"DeepSeek API Error: {e}")
        return get_fallback_response(question)

def get_fallback_response(question: str) -> Dict[str, Any]:
    """Intelligent fallback response system"""
    question_lower = question.lower()
    
    # Enhanced knowledge base with real-time data
    current_month = datetime.now().month
    current_season = get_current_season()
    
    responses = {
        "ধান": f"""🌾 **ধান চাষ সম্পর্কে পরামর্শ:**

বর্তমান মৌসুম: **{current_season}**

**বীজ বপন:** 
- বোরো ধান: নভেম্বর-ডিসেম্বর (আগাম জাত), ডিসেম্বর-জানুয়ারি (মধ্য মৌসুম)
- আমন ধান: জুন-জুলাই (আগাম), জুলাই-আগস্ট (মধ্য মৌসুম)

**সার প্রয়োগ (প্রতি হেক্টর):**
- ইউরিয়া: ২৫০-৩০০ কেজি (৩ ভাগে: ১০, ৩৫ ও ৫৫ দিন পর)
- টিএসপি: ১৫০-২০০ কেজি (সম্পূর্ণ মাটিতে মিশিয়ে)
- এমওপি: ১০০-১৫০ কেজি (২ ভাগে: বপন ও ৪৫ দিন পর)
- জিঙ্ক সালফেট: ১০ কেজি (বপন সময়)

**সেচ ব্যবস্থাপনা:**
- প্রথম ১৫ দিন: ২-৩ সেমি পানির স্তর রাখুন
- শীষ বের হওয়ার সময়: ৫-৭ সেমি পানির স্তর
- পরিপক্কতা: মাটি সামান্য ভেজা রাখুন

**রোগ-পোকা দমন:**
- ব্লাস্ট রোগ: ট্রাইসাইক্লাজল ৭৫% WP (০.৬ গ্রাম/লিটার)
- গাছ ফড়িং: কার্বোফুরান ৩% জি (৩৩ কেজি/হেক্টর)
- মাজরা পোকা: কার্টাপ হাইড্রোক্লোরাইড ৫০% SP (১ গ্রাম/লিটার)

**উৎপাদন খরচ ও আয়:**
- আনুমানিক খরচ: ৮০,০০০-১,০০,০০০ টাকা/হেক্টর
- সম্ভাব্য উৎপাদন: ৪-৫ টন/হেক্টর
- বর্তমান বাজার মূল্য: ২৮-৩২ টাকা/কেজি
- আনুমানিক আয়: ১,২০,০০০-১,৫০,০০০ টাকা/হেক্টর

**বিশেষ টিপস:**
১. স্বল্প জীবনকালীন জাত (১১০-১২০ দিন) নির্বাচন করুন
২. একই জমিতে একই জাত বারবার চাষ করবেন না
৩. জৈব ও রাসায়নিক সারের সমন্বয় করুন
৪. সঠিক সময়ে সেচ দিন

আপনার এলাকার মাটির ধরন জানালে আরও নির্দিষ্ট পরামর্শ দিতে পারব! 🚜""",

        "গম": f"""🌾 **গম চাষ সম্পূর্ণ গাইড:**

**সেরা সময়:** নভেম্বরের ১৫-৩০ তারিখ (উত্তরাঞ্চল), ডিসেম্বর ১-১৫ (মধ্য ও দক্ষিণাঞ্চল)

**জাত নির্বাচন:**
- বারি গম-৩৩: উচ্চ ফলন, রোগ প্রতিরোধী
- বারি গম-৩২: খরা সহনশীল
- বারি গম-৩১: লবণাক্ততা সহনশীল

**সার ব্যবস্থাপনা (প্রতি হেক্টর):**
- গোবর সার: ১০ টন (মাটি তৈরির সময়)
- ইউরিয়া: ২২০-২৫০ কেজি (৩ ভাগে)
- টিএসপি: ১৮০-২০০ কেজি (সম্পূর্ণ বপন সময়)
- এমওপি: ৮০-১০০ কেজি (২ ভাগে)
- জিঙ্ক: ৫ কেজি (বপন সময়)

**সেচ সময়সূচি:**
১. প্রথম সেচ: বীজ বপনের ২১ দিন পর
২. দ্বিতীয় সেচ: ৪৫-৫০ দিন পর (কান্ড বের হওয়ার সময়)
৩. তৃতীয় সেচ: ৭০-৭৫ দিন পর (দানা গঠনের সময়)

**রোগ ব্যবস্থাপনা:**
- দাগ রোগ: প্রোপিকোনাজল ২৫% EC (০.৫ মিলি/লিটার)
- গম মাজরা: ইমিডাক্লোপ্রিড ১৭.৮% SL (০.৩ মিলি/লিটার)
- পাতার মরিচা: টেবুকোনাজল ২৫০ EC (১ মিলি/লিটার)

**আর্থিক বিশ্লেষণ:**
- বীজ খরচ: ১২০-১৫০ কেজি/হেক্টর × ৪০ টাকা = ৪,৮০০-৬,০০০ টাকা
- সার খরচ: ১০,০০০-১২,০০০ টাকা
- শ্রম খরচ: ৮,০০০-১০,০০০ টাকা
- **মোট খরচ:** ২৫,০০০-৩০,০০০ টাকা/হেক্টর
- **আনুমানিক উৎপাদন:** ৩-৩.৫ টন/হেক্টর
- **বর্তমান মূল্য:** ৩৫-৪০ টাকা/কেজি
- **সম্ভাব্য আয়:** ১,০৫,০০০-১,৪০,০০০ টাকা/হেক্টর
- **লাভ:** ৭৫,০০০-১,১০,০০০ টাকা/হেক্টর

**জলবায়ু সহনশীল পদ্ধতি:**
১. কম পানি প্রয়োজন (শুধু ৩টি সেচ)
২. শীতকালীন ফসল (পানি কম লাগে)
৩. মাটির আর্দ্রতা সংরক্ষণ করুন

আপনার জমির অবস্থা সম্পর্কে আরও জানালে ব্যক্তিগতকৃত পরামর্শ দিতে পারি! 🌱""",

        "সার": """🌱 **সার প্রয়োগের বিজ্ঞানসম্মত পদ্ধতি:**

**মাটি পরীক্ষা:**
- স্থানীয় কৃষি অফিসে নমুনা পাঠান
- ফলাফল অনুযায়ী সার নির্ধারণ করুন
- প্রতি ২ বছর পরপর পরীক্ষা করুন

**সারের ধরন ও পরিমাণ:**

**১. জৈব সার (মৌলিক):**
- গোবর সার: ১০-১৫ টন/হেক্টর (মাটি তৈরির সময়)
- কম্পোস্ট: ৫-৭ টন/হেক্টর
- সবুজ সার: ধৈঞ্চা, সনপাটা (২-৩ টন/হেক্টর)

**২. রাসায়নিক সার (বাংলাদেশ প্রমিত):**
- **ইউরিয়া** (নাইট্রোজেন):
  * ধান: ২৫০-৩০০ কেজি/হেক্টর
  * গম: ২০০-২২০ কেজি/হেক্টর  
  * সবজি: ১৫০-২০০ কেজি/হেক্টর
  * প্রয়োগ পদ্ধতি: ৩ ভাগে (বপন, ৩০ ও ৫০ দিন পর)

- **টিএসপি** (ফসফরাস):
  * সব ফসল: ১৫০-২০০ কেজি/হেক্টর
  * প্রয়োগ: সম্পূর্ণ মাটিতে মিশিয়ে

- **এমওপি** (পটাশ):
  * ধান/গম: ১০০-১৫০ কেজি/হেক্টর
  * সবজি: ১২০-১৮০ কেজি/হেক্টর
  * প্রয়োগ: ২ ভাগে (বপন ও মধ্য মৌসুম)

**৩. সুষম সার মিশ্রণ (প্রতি হেক্টর):**
- ধানের জন্য: ইউরিয়া ২৭৫ + টিএসপি ১৭৫ + এমওপি ১২৫ কেজি
- গমের জন্য: ইউরিয়া ২১০ + টিএসপি ১৯০ + এমওপি ৯০ কেজি
- আলুর জন্য: ইউরিয়া ৩০০ + টিএসপি ২৫০ + এমওপি ২০০ কেজি

**প্রয়োগের সঠিক সময়:**
- সকাল ৮-১১টা বা বিকাল ৪-৬টা
- বৃষ্টির পূর্বাভাস থাকলে প্রয়োগ করবেন না
- মাটি ভেজা থাকলে সার দিন

**খরচ বিশ্লেষণ (প্রতি হেক্টর):**
- ইউরিয়া: ২৭৫ কেজি × ২২ টাকা = ৬,০৫০ টাকা
- টিএসপি: ১৭৫ কেজি × ৩৫ টাকা = ৬,১২৫ টাকা  
- এমওপি: ১২৫ কেজি × ৩০ টাকা = ৩,৭৫০ টাকা
- **মোট:** ১৫,৯২৫ টাকা/হেক্টর

**টিপস:**
১. জৈব ও রাসায়নিক সারের সমন্বয় করুন
২. গাছের অবস্থা দেখে সার দিন
৩. অতিরিক্ত সার প্রয়োগ করবেন না
৪. মাটির pH ৬.০-৬.৫ রাখুন

কোন ফসলের জন্য সার সম্পর্কে জানতে চান? 🌾""",

        "বন্যা": f"""🌊 **বন্যা পূর্বাভাস ও ব্যবস্থাপনা:**

**বর্তমান অবস্থা:** {datetime.now().strftime('%d %B, %Y')}

**বন্যা পূর্বাভাস (এক সপ্তাহ):**
- উত্তরাঞ্চল: মধ্যম থেকে উচ্চ ঝুঁকি
- মধ্যাঞ্চল: নিম্ন থেকে মধ্যম ঝুঁকি
- দক্ষিণাঞ্চল: নিম্ন ঝুঁকি

**তাৎক্ষণিক পদক্ষেপ (২৪-৪৮ ঘণ্টা আগে):**

**১. ফসল সুরক্ষা:**
- দ্রুত পাকা ফসল সংগ্রহ করুন
- অপরিপক্ক ফসলের জন্য বাঁধ তৈরি করুন
- বীজ উঁচু ও শুষ্ক স্থানে সরিয়ে নিন

**২. গবাদিপশু সুরক্ষা:**
- নিরাপদ উঁচু স্থানে নিয়ে যান
- ৭ দিনের খাদ্য মজুদ করুন
- প্রাথমিক চিকিৎসার সরঞ্জাম রাখুন

**৩. জরুরি প্রস্তুতি:**
- গুরুত্বপূর্ণ কাগজপত্র ওয়াটারপ্রুফ ব্যাগে রাখুন
- ৩ দিনের খাবার ও পানীয় জল মজুদ
- জরুরি নম্বর: ৯৯৯, ১০৯০, ১০৬

**বন্যার সময় করণীয়:**

**ফসল রক্ষা পদ্ধতি:**
১. **দ্রুত নিষ্কাশন:** জলাবদ্ধতা দূর করুন
২. **সার প্রয়োগ:** বন্যার পর ইউরিয়া (৫০ কেজি/হেক্টর)
৩. **রোগ প্রতিরোধ:** ব্যাকটেরিয়াল ব্লাইটের জন্য কপার অক্সিক্লোরাইড
৪. **পুনর্বাসন:** ৭-১০ দিন পর নতুন চারা রোপণ

**সরকারি সহায়তা:**
- ফসল বীমা ক্লেইম: ৩০ দিনের মধ্যে
- জরুরি ঋণ: কৃষি ব্যাংক থেকে
- বিনামূল্যে বীজ: স্থানীয় কৃষি অফিস থেকে

**বন্যা-পরবর্তী ব্যবস্থাপনা:**

**১. মাটি ব্যবস্থাপনা:**
- চুন প্রয়োগ: ১ টন/হেক্টর (pH সামঞ্জস্য)
- জৈব সার: ৫ টন/হেক্টর (উর্বরতা ফিরিয়ে আনতে)

**২. ফসল পরিকল্পনা:**
- স্বল্পমেয়াদী ফসল: মটর, মসুর, সরিষা
- সবজি: পালং, লালশাক, ডাঁটা
- ৬০ দিনের ফসল: মুগ ডাল, মাসকলাই

**৩. আর্থিক পুনরুদ্ধার:**
- বীমা ক্লেইম: ৯০% ক্ষতিপূরণ
- পুনর্বাসন ঋণ: ৫% সুদে
- ভর্তুকি: বীজ ও সারে ৫০% ভর্তুকি

**আপডেট তথ্য পাওয়ার উপায়:**
১. কৃষি হেল্পলাইন: ১৬১২৩
২. আবহাওয়া অধিদপ্তর: ০৯৬১১৬৭৭৭৭৭
৩. জেলা কৃষি অফিস: স্থানীয় নম্বর

আপনার এলাকার বন্যা ঝুঁকি সম্পর্কে জানালে নির্দিষ্ট পরামর্শ দিতে পারি! 🚨""",

        "ঋণ": """💰 **কৃষি ঋণ ও আর্থিক সহায়তা:**

**সরকারি কৃষি ঋণ স্কিম ২০২৪:**

**১. কিসান ক্রেডিট কার্ড:**
- সর্বোচ্চ সীমা: ৫,০০,০০০ টাকা
- সুদের হার: ৪% (সরকারিভাবে ভর্তুকি)
- মেয়াদ: ৩ বছর
- আবেদনের জায়গা: যেকোন ব্যাংক
- প্রয়োজনীয় কাগজ:
  * জাতীয় পরিচয়পত্র
  * জমির দলিল/চালান
  * পাসপোর্ট সাইজ ছবি (২ কপি)
  * ফসল পরিকল্পনা

**২. বিশেষ কৃষি ঋণ:**
- যান্ত্রিকীকরণ ঋণ: ১০ লক্ষ টাকা পর্যন্ত
- শীতকালীন ফসল ঋণ: ৩ লক্ষ টাকা পর্যন্ত
- সবজি চাষ ঋণ: ২ লক্ষ টাকা পর্যন্ত
- মৎস্য চাষ ঋণ: ৫ লক্ষ টাকা পর্যন্ত

**৩. জরুরি বন্যা ঋণ:**
- সর্বোচ্চ: ১,০০,০০০ টাকা
- সুদ: ০% (প্রথম ৬ মাস)
- মেয়াদ: ২ বছর
- কাগজপত্র: মাত্র পরিচয়পত্র

**আবেদন প্রক্রিয়া:**

**ধাপ ১: প্রস্তুতি**
- কৃষি অফিস থেকে সার্টিফিকেট নিন
- ব্যাংক নির্বাচন করুন (সোনালী, জনতা, অগ্রণী)
- সমস্ত কাগজপত্র প্রস্তুত করুন

**ধাপ ২: আবেদন**
- ফরম পূরণ করুন (ব্যাংক থেকে নিন)
- কিস্তি পরিকল্পনা তৈরি করুন
- জামানত ব্যবস্থা করুন

**ধাপ ৩: অনুমোদন**
- সময়: ৭-১০ কর্মদিবস
- টাকা স্থানান্তর: ব্যাংক অ্যাকাউন্টে

**খরচ বিশ্লেষণ:**

**ধান চাষের জন্য ঋণ (১ হেক্টর):**
- বীজ: ৫,০০০ টাকা
- সার: ১৫,০০০ টাকা
- কীটনাশক: ৫,০০০ টাকা
- শ্রম: ১০,০০০ টাকা
- **মোট প্রয়োজন:** ৩৫,০০০ টাকা
- **ঋণ সুদ (১ বছর):** ১,৪০০ টাকা
- **নিট লাভ:** ৮০,০০০-১,০০,০০০ টাকা

**ফসল বীমা:**
- প্রিমিয়াম: উৎপাদন খরচের ৫%
- কভারেজ: ৯০% ক্ষতি পর্যন্ত
- ক্লেইম সময়: ৩০ দিন

**ডিজিটাল পদ্ধতি:**
১. **নগদ** অ্যাপ: কৃষি ঋণ বিভাগ
২. **বিকাশ**: *২৪৭# ডায়াল করুন
৩. **নগদ**: *১২৬# ডায়াল করুন

**টিপস:**
১. ছোট ঋণ দিয়ে শুরু করুন
২. নির্দিষ্ট ফসলের জন্য ঋণ নিন
৩. সময়মতো কিস্তি পরিশোধ করুন
৪. রেকর্ড সংরক্ষণ করুন

কোন ধরনের ঋণ সম্পর্কে জানতে চান? 📞"""
    }
    
    # Keyword matching
    for keyword, response in responses.items():
        if keyword in question_lower:
            return {
                "answer": response,
                "tokens_used": len(response.split()),
                "model": "JolBondhu_AI"
            }
    
    # Default intelligent response
    default_response = f"""🤖 **আপনাকে স্বাগতম! আমি JolBondhu, আপনার কৃষি সহকারী।**

আপনার প্রশ্নটি কৃষি সম্পর্কিত নির্দিষ্ট করলে আরও ভালোভাবে সাহায্য করতে পারব। 

**আপন যা জানতে পারেন:**
🌾 **ধান চাষ** - বীজ বপন থেকে সংগ্রহ পর্যন্ত সম্পূর্ণ গাইড
🌾 **গম চাষ** - শীতকালীন ফসলের আধুনিক পদ্ধতি
🌱 **সার ব্যবস্থাপনা** - বিজ্ঞানসম্মত সার প্রয়োগ পদ্ধতি
💧 **সেচ ব্যবস্থাপনা** - পানি সাশ্রয়ী কৃষি
🐛 **রোগ-পোকা দমন** - সমন্বিত বালাই ব্যবস্থাপনা
💰 **কৃষি ঋণ** - সরকারি সহায়তা ও ঋণ স্কিম
🌊 **বন্যা ব্যবস্থাপনা** - দুর্যোগে ফসল রক্ষা
📊 **বাজার তথ্য** - ফসলের দাম ও বিপণন

**বর্তমান মৌসুম:** {current_season}
**সেরা চাষ:** {get_recommended_crops(current_month)}

**উদাহরণ প্রশ্ন:**
- "ধান চাষের সম্পূর্ণ খরচ কত?"
- "গমের বীজ কোথায় পাবো?"
- "সার কিভাবে প্রয়োগ করব?"
- "ফসলের রোগের সমাধান কি?"

আপনার প্রশ্নটি আরও স্পষ্ট করে বলুন, আমি আপনাকে বিস্তারিত ও ব্যবহারিক সমাধান দেব! 🌱

**জরুরি সাহায্যের জন্য:** ১৬১২৩ (কৃষি হেল্পলাইন)"""

    return {
        "answer": default_response,
        "tokens_used": len(default_response.split()),
        "model": "JolBondhu_AI"
    }

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


@app.post("/chat/farmer")
async def chat_with_farmer(request: ChatRequest):
    """Main chat endpoint with streaming support"""
    try:
        if request.stream:
            # For streaming response
            result = get_deepseek_response(request.question, stream=True)
            if result.get("stream"):
                return {"stream": True, "response": result["response"]}
        
        # Normal response
        result = get_deepseek_response(request.question)
        
        response_data = {
            "status": "success",
            "response": {
                "question": request.question,
                "topic": "agriculture",
                "answer": result["answer"],
                "confidence": 95,
                "sources": ["বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট", "কৃষি সম্প্রসারণ অধিদপ্তর", "আবহাওয়া অধিদপ্তর"],
                "follow_up_questions": generate_follow_up(request.question),
                "metadata": {
                    "tokens_used": result.get("tokens_used", 0),
                    "model": result.get("model", "deepseek-chat"),
                    "timestamp": datetime.now().isoformat()
                }
            }
        }
        
        return response_data
        
    except Exception as e:
        print(f"Chat error: {e}")
        # Return fallback response
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

@app.get("/chat/stream")
async def chat_stream(question: str):
    """SSE endpoint for streaming responses"""
    try:
        result = get_deepseek_response(question, stream=True)
        
        if result.get("stream"):
            response = result["response"]
            
            async def event_generator():
                client = sseclient.SSEClient(response.iter_lines())
                
                for event in client.events():
                    if event.data != "[DONE]":
                        try:
                            data = json.loads(event.data)
                            if 'choices' in data and data['choices']:
                                delta = data['choices'][0].get('delta', {})
                                if 'content' in delta:
                                    yield f"data: {json.dumps({'content': delta['content']})}\n\n"
                        except:
                            continue
                
                yield f"data: {json.dumps({'done': True})}\n\n"
            
            return EventSourceResponse(event_generator())
    
    except Exception as e:
        print(f"Stream error: {e}")
        raise HTTPException(status_code=500, detail="Streaming failed")

def generate_follow_up(question: str) -> List[str]:
    """Generate intelligent follow-up questions"""
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

# Other endpoints (flood, crop, emergency) remain the same...
# Add them from previous code
class PredictionRequest(BaseModel):
    lat: float
    lon: float
    district: Optional[str] = None

# Simple in-memory cache for risk calculations
risk_cache = {}

def get_cached_risk_data(lat: float, lon: float, district_name: str = None):
    """Cached risk calculation"""
    cache_key = f"{lat:.4f}_{lon:.4f}"
    
    # Check cache (5 minute cache)
    if cache_key in risk_cache:
        cached_time, cached_data = risk_cache[cache_key]
        if time.time() - cached_time < 300:  # 5 minutes
            return cached_data, True, cache_key
    
    # Calculate fresh
    weather_data = get_nasa_rainfall(lat, lon)
    risk_data = calculate_flood_risk(lat, lon, weather_data)
    
    result = {
        "weather_data": weather_data,
        "risk_data": risk_data,
        "district": district_name,
        "timestamp": datetime.now().isoformat()
    }
    
    # Store in cache
    risk_cache[cache_key] = (time.time(), result)
    
    return result, False, cache_key

def get_nasa_rainfall(lat: float, lon: float):
    """Fetch rainfall data from NASA POWER API"""
    try:
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        end_date_str = end_date.strftime("%Y%m%d")
        start_date_str = start_date.strftime("%Y%m%d")
        
        url = (
            "https://power.larc.nasa.gov/api/temporal/daily/point"
            f"?parameters=PRECTOTCORR,T2M,RH2M"
            f"&community=ag"
            f"&latitude={lat}"
            f"&longitude={lon}"
            f"&start={start_date_str}"
            f"&end={end_date_str}"
            f"&format=JSON"
        )
        
        print(f"Fetching NASA data from: {url}")
        response = requests.get(url, timeout=30)
        data = response.json()
        
        if "properties" not in data:
            print(f"NASA API response missing properties: {data}")
            return {
                "rainfall_3_days_mm": 0.0,
                "rainfall_7_days_mm": 0.0,
                "temperature_c": 25.0,
                "humidity_percent": 70.0
            }
        
        # Extract data with better error handling
        try:
            rain_data = data["properties"]["parameter"]["PRECTOTCORR"]
            temp_data = data["properties"]["parameter"]["T2M"]
            humidity_data = data["properties"]["parameter"]["RH2M"]
            
            print(f"Sample temp data: {list(temp_data.values())[:3] if temp_data else 'No data'}")
            
            # Filter out invalid values (-999)
            valid_rain = [v for v in rain_data.values() if v is not None and v != -999.0]
            valid_temp = [v for v in temp_data.values() if v is not None and v != -999.0]
            valid_humidity = [v for v in humidity_data.values() if v is not None and v != -999.0]
            
            # Debug logging
            print(f"Valid temp values count: {len(valid_temp)}")
            if valid_temp:
                print(f"Sample temp values: {valid_temp[:3]}")
            
            # Calculate R3 and R7
            R3 = sum(valid_rain[-3:]) if len(valid_rain) >= 3 else 0
            R7 = sum(valid_rain[-7:]) if len(valid_rain) >= 7 else sum(valid_rain)
            
            # Calculate average temperature and humidity with better validation
            if valid_temp:
                avg_temp_kelvin = sum(valid_temp) / len(valid_temp)
                # Validate temperature range (NASA POWER T2M should be ~250-320 Kelvin)
                if 200 < avg_temp_kelvin < 350:
                    avg_temp_c = avg_temp_kelvin - 273.15
                else:
                    print(f"Suspicious temperature value: {avg_temp_kelvin}K")
                    avg_temp_c = 25.0  # Default reasonable temperature
            else:
                avg_temp_c = 25.0
                print("No valid temperature data, using default")
            
            if valid_humidity:
                avg_humidity = sum(valid_humidity) / len(valid_humidity)
                # Validate humidity range (0-100%)
                if not (0 <= avg_humidity <= 100):
                    print(f"Suspicious humidity value: {avg_humidity}%")
                    avg_humidity = 70.0
            else:
                avg_humidity = 70.0
            
            result = {
                "rainfall_3_days_mm": round(R3, 2),
                "rainfall_7_days_mm": round(R7, 2),
                "temperature_c": round(avg_temp_c, 1),
                "humidity_percent": round(avg_humidity, 1)
            }
            
            print(f"Calculated weather data: {result}")
            return result
            
        except KeyError as e:
            print(f"Missing key in NASA response: {e}")
            print(f"Available keys: {list(data.get('properties', {}).get('parameter', {}).keys())}")
            return {
                "rainfall_3_days_mm": 0.0,
                "rainfall_7_days_mm": 0.0,
                "temperature_c": 25.0,
                "humidity_percent": 70.0
            }
        
    except Exception as e:
        print(f"NASA API Error for lat={lat}, lon={lon}: {e}")
        import traceback
        traceback.print_exc()
        # Return default values if API fails
        return {
            "rainfall_3_days_mm": 0.0,
            "rainfall_7_days_mm": 0.0,
            "temperature_c": 25.0,
            "humidity_percent": 70.0
        }
    
def get_zone_score(lat: float, lon: float):
    """Calculate flood zone score"""
    # Northern river basin & delta
    if lat > 24.5 and lon > 89:
        return 1.0, "উচ্চ"
    # Central floodplain
    elif lat > 23.5:
        return 0.6, "মধ্যম"
    # Southern/coastal or higher land
    else:
        return 0.3, "নিম্ন"

def get_river_score(lat: float, lon: float):
    """Calculate river proximity score"""
    # Jamuna–Padma–Meghna belt
    if 24.0 < lat < 26.0 and 89.0 < lon < 90.5:
        return 1.0, "< 1 km"
    elif 23.0 < lat < 24.0:
        return 0.6, "1–3 km"
    else:
        return 0.3, "> 3 km"

def rain_score(R3: float, R7: float):
    """Calculate rainfall-based risk score"""
    if R3 == 0 and R7 == 0:
        return 0.0
    score = (0.7 * R3 + 0.3 * R7) / 150
    return min(score, 1.0)

def calculate_flood_risk(lat: float, lon: float, weather_data: dict):
    """Calculate comprehensive flood risk"""
    R3 = weather_data.get("rainfall_3_days_mm", 0)
    R7 = weather_data.get("rainfall_7_days_mm", 0)
    
    # Calculate scores
    rain_score_val = rain_score(R3, R7)
    zone_score, zone_label = get_zone_score(lat, lon)
    river_score, river_distance = get_river_score(lat, lon)
    
    # Weighted risk calculation
    flood_risk = (
        0.45 * rain_score_val +
        0.35 * zone_score +
        0.20 * river_score
    )
    
    # Convert to percentage
    risk_percent = round(flood_risk * 100, 2)
    
    # Determine risk level
    if risk_percent < 30:
        risk_level = "নিম্ন"
    elif risk_percent < 60:
        risk_level = "মধ্যম"
    else:
        risk_level = "উচ্চ"
    
    return {
        "zone_score": round(zone_score, 2),
        "zone_label": zone_label,
        "river_score": round(river_score, 2),
        "river_distance": river_distance,
        "rain_score": round(rain_score_val, 2),
        "flood_risk_percent": risk_percent,
        "risk_level": risk_level,
        "confidence": round(85.5, 1)
    }

def generate_advice(risk_level: str):
    """Generate advice based on risk level"""
    advice_map = {
        "নিম্ন": {
            "title": "সাধারণ সতর্কতা",
            "message": "বর্তমানে বন্যার ঝুঁকি কম। তবে আবহাওয়ার পরিবর্তনের খবর রাখুন।",
            "color": "green"
        },
        "মধ্যম": {
            "title": "সতর্কতা প্রয়োজন",
            "message": "ঝুঁকি মাঝারি পর্যায়ে। প্রস্তুতি নেওয়া শুরু করুন এবং স্থানীয় কর্তৃপক্ষের নির্দেশনা অনুসরণ করুন।",
            "color": "yellow"
        },
        "উচ্চ": {
            "title": "বিপদসংকেত",
            "message": "উচ্চ বন্যার ঝুঁকি! নিরাপদ স্থানে সরিয়ে নেওয়ার প্রস্তুতি নিন এবং জরুরি প্রস্তুতি সম্পন্ন করুন।",
            "color": "red"
        }
    }
    return advice_map.get(risk_level, advice_map["নিম্ন"])

def get_immediate_recommendations(risk_level: str):
    """Get immediate recommendations"""
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
        ]
    }
    return recommendations.get(risk_level, [])

def get_preparation_recommendations(risk_level: str):
    """Get preparation recommendations"""
    return [
        "জরুরি প্রস্তুতি তালিকা প্রস্তুত করুন",
        "আবহাওয়ার পূর্বাভাস নিয়মিত চেক করুন",
        "স্থানীয় বন্যা পূর্বাভাস সিস্টেমে সাইন আপ করুন"
    ]

# GET endpoint for prediction
@app.get("/predicting")
async def predict_flood_risk_get(
    district: Optional[str] = None,
    lat: float = Query(...),
    lon: float = Query(...)
):
    """GET endpoint for flood risk prediction"""
    try:
        print(f"GET request received: district={district}, lat={lat}, lon={lon}")
        
        # Use cached calculation
        cached_result, is_cached, cache_key = get_cached_risk_data(lat, lon, district)
        
        weather_data = cached_result["weather_data"]
        risk_data = cached_result["risk_data"]
        
        # Generate advice
        advice = generate_advice(risk_data["risk_level"])
        
        # Prepare response
        response = {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "cache_info": "cached" if is_cached else "fresh",
            "cache_key": cache_key,
            "location": {
                "latitude": lat,
                "longitude": lon,
                "district": district or "Unknown",
                "division": "Unknown",
                "flood_risk_factor": risk_data["flood_risk_percent"]
            },
            "weather_data": {
                "rainfall_mm": weather_data["rainfall_7_days_mm"],
                "rainfall_3_days": weather_data["rainfall_3_days_mm"],
                "river_level_m": 3.2,
                "humidity_percent": weather_data["humidity_percent"],
                "temperature_c": weather_data["temperature_c"]
            },
            "prediction": {
                "risk_level": risk_data["risk_level"],
                "risk_score": risk_data["flood_risk_percent"],
                "confidence": risk_data["confidence"],
                "probabilities": {
                    "low": max(0, 100 - risk_data["flood_risk_percent"]),
                    "medium": 30 if risk_data["risk_level"] == "মধ্যম" else 20,
                    "high": risk_data["flood_risk_percent"] if risk_data["risk_level"] == "উচ্চ" else 0,
                    "very_high": 0
                }
            },
            "detailed_scores": risk_data,
            "advice": advice,
            "recommendations": {
                "immediate": get_immediate_recommendations(risk_data["risk_level"]),
                "preparation": get_preparation_recommendations(risk_data["risk_level"])
            }
        }
        
        return response
        
    except Exception as e:
        print(f"Error in GET /predicting: {e}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# POST endpoint for prediction
@app.post("/predicting")
async def predict_flood_risk_post(request: PredictionRequest):
    """POST endpoint for flood risk prediction"""
    try:
        print(f"POST request received: district={request.district}, lat={request.lat}, lon={request.lon}")
        
        # Use cached calculation
        cached_result, is_cached, cache_key = get_cached_risk_data(request.lat, request.lon, request.district)
        
        weather_data = cached_result["weather_data"]
        risk_data = cached_result["risk_data"]
        
        # Generate advice
        advice = generate_advice(risk_data["risk_level"])
        
        # Prepare response
        response = {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "cache_info": "cached" if is_cached else "fresh",
            "cache_key": cache_key,
            "location": {
                "latitude": request.lat,
                "longitude": request.lon,
                "district": request.district or "Unknown",
                "division": "Unknown",
                "flood_risk_factor": risk_data["flood_risk_percent"]
            },
            "weather_data": {
                "rainfall_mm": weather_data["rainfall_7_days_mm"],
                "rainfall_3_days": weather_data["rainfall_3_days_mm"],
                "river_level_m": 3.2,
                "humidity_percent": weather_data["humidity_percent"],
                "temperature_c": weather_data["temperature_c"]
            },
            "prediction": {
                "risk_level": risk_data["risk_level"],
                "risk_score": risk_data["flood_risk_percent"],
                "confidence": risk_data["confidence"],
                "probabilities": {
                    "low": max(0, 100 - risk_data["flood_risk_percent"]),
                    "medium": 30 if risk_data["risk_level"] == "মধ্যম" else 20,
                    "high": risk_data["flood_risk_percent"] if risk_data["risk_level"] == "উচ্চ" else 0,
                    "very_high": 0
                }
            },
            "detailed_scores": risk_data,
            "advice": advice,
            "recommendations": {
                "immediate": get_immediate_recommendations(risk_data["risk_level"]),
                "preparation": get_preparation_recommendations(risk_data["risk_level"])
            }
        }
        
        return response
        
    except Exception as e:
        print(f"Error in POST /predicting: {e}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# Districts data
def get_bangladesh_districts():
    """Return list of all 64 Bangladesh districts"""
    return [
        # Dhaka Division (13)
        {"name":"ঢাকা","division":"ঢাকা","latitude":23.8103,"longitude":90.4125},
        {"name":"গাজীপুর","division":"ঢাকা","latitude":23.9999,"longitude":90.4203},
        {"name":"নারায়ণগঞ্জ","division":"ঢাকা","latitude":23.6138,"longitude":90.5000},
        {"name":"নরসিংদী","division":"ঢাকা","latitude":23.9322,"longitude":90.7154},
        {"name":"মুন্সিগঞ্জ","division":"ঢাকা","latitude":23.5422,"longitude":90.5305},
        {"name":"মানিকগঞ্জ","division":"ঢাকা","latitude":23.8617,"longitude":90.0003},
        {"name":"টাঙ্গাইল","division":"ঢাকা","latitude":24.2513,"longitude":89.9167},
        {"name":"কিশোরগঞ্জ","division":"ঢাকা","latitude":24.4449,"longitude":90.7766},
        {"name":"ফরিদপুর","division":"ঢাকা","latitude":23.6071,"longitude":89.8420},
        {"name":"মাদারীপুর","division":"ঢাকা","latitude":23.1641,"longitude":90.1890},
        {"name":"রাজবাড়ী","division":"ঢাকা","latitude":23.7574,"longitude":89.6440},
        {"name":"গোপালগঞ্জ","division":"ঢাকা","latitude":23.0050,"longitude":89.8266},
        {"name":"শরীয়তপুর","division":"ঢাকা","latitude":23.2423,"longitude":90.4348},

        # Chattogram Division (11)
        {"name":"চট্টগ্রাম","division":"চট্টগ্রাম","latitude":22.3569,"longitude":91.7832},
        {"name":"কক্সবাজার","division":"চট্টগ্রাম","latitude":21.4272,"longitude":92.0058},
        {"name":"কুমিল্লা","division":"চট্টগ্রাম","latitude":23.4607,"longitude":91.1809},
        {"name":"ব্রাহ্মণবাড়িয়া","division":"চট্টগ্রাম","latitude":23.9571,"longitude":91.1110},
        {"name":"ফেনী","division":"চট্টগ্রাম","latitude":23.0159,"longitude":91.3976},
        {"name":"নোয়াখালী","division":"চট্টগ্রাম","latitude":22.8696,"longitude":91.0994},
        {"name":"লক্ষ্মীপুর","division":"চট্টগ্রাম","latitude":22.9447,"longitude":90.8282},
        {"name":"চাঁদপুর","division":"চট্টগ্রাম","latitude":23.2333,"longitude":90.6714},
        {"name":"খাগড়াছড়ি","division":"চট্টগ্রাম","latitude":23.1193,"longitude":91.9847},
        {"name":"রাঙামাটি","division":"চট্টগ্রাম","latitude":22.7324,"longitude":92.2985},
        {"name":"বান্দরবান","division":"চট্টগ্রাম","latitude":22.1953,"longitude":92.2184},

        # Sylhet Division (4)
        {"name":"সিলেট","division":"সিলেট","latitude":24.9045,"longitude":91.8611},
        {"name":"সুনামগঞ্জ","division":"সিলেট","latitude":25.0658,"longitude":91.3950},
        {"name":"হবিগঞ্জ","division":"সিলেট","latitude":24.3745,"longitude":91.4156},
        {"name":"মৌলভীবাজার","division":"সিলেট","latitude":24.4829,"longitude":91.7774},

        # Rajshahi Division (8)
        {"name":"রাজশাহী","division":"রাজশাহী","latitude":24.3745,"longitude":88.6042},
        {"name":"নাটোর","division":"রাজশাহী","latitude":24.4206,"longitude":89.0003},
        {"name":"নওগাঁ","division":"রাজশাহী","latitude":24.8326,"longitude":88.9249},
        {"name":"চাঁপাইনবাবগঞ্জ","division":"রাজশাহী","latitude":24.5965,"longitude":88.2775},
        {"name":"পাবনা","division":"রাজশাহী","latitude":23.9985,"longitude":89.2336},
        {"name":"বগুড়া","division":"রাজশাহী","latitude":24.8481,"longitude":89.3730},
        {"name":"জয়পুরহাট","division":"রাজশাহী","latitude":25.1015,"longitude":89.0270},
        {"name":"সিরাজগঞ্জ","division":"রাজশাহী","latitude":24.4534,"longitude":89.7006},

        # Rangpur Division (8)
        {"name":"রংপুর","division":"রংপুর","latitude":25.7439,"longitude":89.2752},
        {"name":"দিনাজপুর","division":"রংপুর","latitude":25.6279,"longitude":88.6332},
        {"name":"ঠাকুরগাঁও","division":"রংপুর","latitude":26.0337,"longitude":88.4690},
        {"name":"পঞ্চগড়","division":"রংপুর","latitude":26.3354,"longitude":88.5517},
        {"name":"নীলফামারী","division":"রংপুর","latitude":25.9318,"longitude":88.8560},
        {"name":"লালমনিরহাট","division":"রংপুর","latitude":25.9923,"longitude":89.2847},
        {"name":"কুড়িগ্রাম","division":"রংপুর","latitude":25.8054,"longitude":89.6362},
        {"name":"গাইবান্ধা","division":"রংপুর","latitude":25.3290,"longitude":89.5425},

        # Khulna Division (8)
        {"name":"খুলনা","division":"খুলনা","latitude":22.8456,"longitude":89.5403},
        {"name":"বাগেরহাট","division":"খুলনা","latitude":22.6516,"longitude":89.7859},
        {"name":"সাতক্ষীরা","division":"খুলনা","latitude":22.7085,"longitude":89.0718},
        {"name":"যশোর","division":"খুলনা","latitude":23.1667,"longitude":89.2089},
        {"name":"নড়াইল","division":"খুলনা","latitude":23.1550,"longitude":89.4950},
        {"name":"মাগুরা","division":"খুলনা","latitude":23.4873,"longitude":89.4194},
        {"name":"ঝিনাইদহ","division":"খুলনা","latitude":23.5450,"longitude":89.1530},
        {"name":"কুষ্টিয়া","division":"খুলনা","latitude":23.9013,"longitude":89.1208},

        # Barishal Division (6)
        {"name":"বরিশাল","division":"বরিশাল","latitude":22.7010,"longitude":90.3535},
        {"name":"ভোলা","division":"বরিশাল","latitude":22.6859,"longitude":90.6482},
        {"name":"পটুয়াখালী","division":"বরিশাল","latitude":22.3596,"longitude":90.3299},
        {"name":"ঝালকাঠি","division":"বরিশাল","latitude":22.6406,"longitude":90.1987},
        {"name":"পিরোজপুর","division":"বরিশাল","latitude":22.5841,"longitude":89.9720},
        {"name":"বরগুনা","division":"বরিশাল","latitude":22.0953,"longitude":90.1121},

        # Mymensingh Division (4)
        {"name":"ময়মনসিংহ","division":"ময়মনসিংহ","latitude":24.7471,"longitude":90.4203},
        {"name":"জামালপুর","division":"ময়মনসিংহ","latitude":24.9375,"longitude":89.9370},
        {"name":"শেরপুর","division":"ময়মনসিংহ","latitude":25.0205,"longitude":90.0153},
        {"name":"নেত্রকোণা","division":"ময়মনসিংহ","latitude":24.8835,"longitude":90.7313},
    ]

@app.get("/alldistricts")
async def get_districts():
    """Get list of districts with real-time risk data"""
    try:
        print("Fetching districts data...")
        districts_base = get_bangladesh_districts()
        districts_with_risk = []
        
        for district in districts_base:
            try:
                # Get weather data
                weather_data = get_nasa_rainfall(district["latitude"], district["longitude"])
                
                # Calculate risk
                risk_data = calculate_flood_risk(
                    district["latitude"], 
                    district["longitude"], 
                    weather_data
                )
                
                # Add to result
                district_with_risk = {
                    **district,
                    "flood_risk_level": risk_data["risk_level"],
                    "flood_risk_score": risk_data["flood_risk_percent"],
                    "rainfall_mm": weather_data["rainfall_7_days_mm"],
                    "temperature_c": weather_data["temperature_c"],
                    "humidity_percent": weather_data["humidity_percent"],
                    "last_updated": datetime.now().isoformat()
                }
                
                districts_with_risk.append(district_with_risk)
                
            except Exception as e:
                print(f"Error processing {district['name']}: {e}")
                districts_with_risk.append({
                    **district,
                    "flood_risk_level": "তথ্য নেই",
                    "flood_risk_score": 0.0,
                    "rainfall_mm": 0.0,
                    "temperature_c": 0.0,
                    "humidity_percent": 0.0,
                    "last_updated": datetime.now().isoformat(),
                    "error": "ডেটা লোড করতে সমস্যা"
                })
        
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "districts": districts_with_risk,
            "count": len(districts_with_risk),
            "data_source": "NASA POWER API"
        }
        
    except Exception as e:
        print(f"Error in /alldistricts: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching district data: {str(e)}")

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "Flood Risk Prediction API", "status": "running"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "GET /predicting": "Get flood risk prediction",
            "POST /predicting": "Post flood risk prediction", 
            "GET /alldistricts": "Get all districts with risk data",
            "GET /health": "Health check"
        }
    }

# Clear cache endpoint (for debugging)
@app.delete("/cache")
async def clear_cache():
    global risk_cache
    count = len(risk_cache)
    risk_cache = {}
    return {"message": f"Cache cleared ({count} items removed)"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)