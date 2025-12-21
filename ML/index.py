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
        "name": "সিরাজগঞ্জ",
        "lat": 24.4539,
        "lon": 89.7083,
        "division": "রাজশাহী",
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

# API Endpoints
@app.get("/")
async def home():
    """API Home"""
    return {
        "status": "success",
        "service": "JolBondhu Flood Risk Prediction API",
        "version": "2.0.0",
        "endpoints": {
            "predict": "/predict?lat={latitude}&lon={longitude}",
            "health": "/health",
            "districts": "/districts",
            "docs": "/docs"
        }
    }

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

# This allows running with: python index.py
if __name__ == "__main__":
    print("🚀 Starting JolBondhu API server...")
    print("📡 API Documentation available at: http://127.0.0.1:8000/docs")
    uvicorn.run(
        "index:app",  # Important: use string reference instead of app object
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )