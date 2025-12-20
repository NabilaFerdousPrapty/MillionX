import pandas as pd
from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import Optional
from sklearn.ensemble import RandomForestClassifier
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from geopy.geocoders import Nominatim
import numpy as np

# 1. Initialize FastAPI
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for request validation
class PredictionRequest(BaseModel):
    lat: float
    lon: float

# 2. Setup a dummy dataset logic (Replace with your CSV path later)
def train_model():
    print("🤖 Training JolBondhu ML Model...")
    # More realistic data
    data = {
        'rainfall': [100, 500, 300, 50, 600, 200, 400, 150, 250, 350],
        'river_level': [2.5, 8.0, 5.0, 1.0, 9.5, 4.0, 6.0, 3.0, 4.5, 7.0],
        'risk': [0, 2, 1, 0, 2, 1, 2, 0, 1, 2]  # 0: Low, 1: Medium, 2: High
    }
    df = pd.DataFrame(data)
    X = df[['rainfall', 'river_level']]
    y = df['risk']
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    print("✅ Model trained successfully!")
    return model

model = train_model()

# Initialize geolocator
geolocator = Nominatim(user_agent="jolbondhu_app")

# Get district name from coordinates
def get_district_from_coords(lat: float, lon: float) -> str:
    try:
        location = geolocator.reverse(f"{lat}, {lon}", language="bn")
        if location and location.raw.get('address'):
            address = location.raw['address']
            # Try to get district from various possible keys
            district = address.get('county') or address.get('district') or address.get('state_district')
            if district:
                return district
    except Exception as e:
        print(f"Geocoding error: {e}")
    
    # Fallback: Find nearest district from our list
    districts_coords = {
        "সিরাজগঞ্জ": (24.4539, 89.7083),
        "কুড়িগ্রাম": (25.8054, 89.6362),
        "গাইবান্ধা": (25.3287, 89.5281),
        "বগুড়া": (24.8465, 89.3773),
        "জামালপুর": (24.9375, 89.9373),
        "সুনামগঞ্জ": (25.0659, 91.395),
        "সিলেট": (24.8918, 91.883),
        "নেত্রকোণা": (24.8859, 90.729),
        "কিশোরগঞ্জ": (24.4448, 90.7826),
        "মুন্সীগঞ্জ": (23.5483, 90.525),
        "শরীয়তপুর": (23.2064, 90.3478),
        "রংপুর": (25.7439, 89.2752),
        "নীলফামারী": (25.9667, 88.95),
        "লালমনিরহাট": (25.9167, 89.45),
        "দিনাজপুর": (25.6217, 88.6354),
        "ঠাকুরগাঁও": (26.0333, 88.4667),
        "টাঙ্গাইল": (24.2641, 89.918),
        "ময়মনসিংহ": (24.7471, 90.4203),
        "শেরপুর": (25.0205, 90.0179),
        "নরসিংদী": (23.9321, 90.715),
        "নারায়ণগঞ্জ": (23.6238, 90.5),
    }
    
    # Find nearest district
    min_dist = float('inf')
    nearest_district = "অজানা"
    
    for district_name, (d_lat, d_lon) in districts_coords.items():
        dist = np.sqrt((lat - d_lat)**2 + (lon - d_lon)**2)
        if dist < min_dist:
            min_dist = dist
            nearest_district = district_name
    
    return nearest_district

# 3. Define API Endpoints
@app.get("/")
def home():
    return {"status": "JolBondhu API is Running", "version": "1.0.0"}

@app.get("/predict")
async def predict_risk(lat: float = Query(..., description="Latitude"), 
                       lon: float = Query(..., description="Longitude")):
    """
    Predict flood risk based on latitude and longitude
    """
    try:
        print(f"🔍 Received request for lat: {lat}, lon: {lon}")
        
        # Get district name
        district = get_district_from_coords(lat, lon)
        print(f"📍 Identified district: {district}")
        
        # Simulate weather data based on location
        # In production, integrate with weather API
        np.random.seed(int(lat * 100 + lon))
        
        # Generate realistic data based on coordinates
        current_rainfall = 200 + (abs(lat - 24.0) * 50) + np.random.rand() * 200
        current_river = 3.0 + (abs(lon - 90.0) * 0.5) + np.random.rand() * 4
        
        # Make prediction
        prediction = model.predict([[current_rainfall, current_river]])[0]
        
        # Risk level mapping with Bangla
        risk_levels = {
            0: "নিম্ন",
            1: "মধ্যম", 
            2: "উচ্চ"
        }
        
        risk_level = risk_levels[prediction]
        
        # Generate advice based on risk level
        advice_dict = {
            "নিম্ন": "বর্তমান অবস্থা ভালো আছে। স্বাভাবিক জীবনযাপন করুন।",
            "মধ্যম": "সতর্কতা অবলম্বন করুন। বৃষ্টিপাত পর্যবেক্ষণ করুন।",
            "উচ্চ": "জরুরি সতর্কতা! বন্যা আশঙ্কা রয়েছে। নিরাপদ স্থানে চলে যান।"
        }
        
        advice = advice_dict[risk_level]
        
        return {
            "status": "success",
            "identified_district": district,
            "risk_level": risk_level,
            "prediction_score": int(prediction),
            "rainfall_mm": round(current_rainfall, 2),
            "river_level_m": round(current_river, 2),
            "advice": advice,
            "coordinates": {
                "latitude": lat,
                "longitude": lon
            }
        }
        
    except Exception as e:
        print(f"❌ Error in prediction: {e}")
        return {
            "status": "error",
            "message": str(e),
            "identified_district": "অজানা",
            "risk_level": "মধ্যম",
            "advice": "ডেটা প্রক্রিয়াকরণে সমস্যা হয়েছে।"
        }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "jolbondhu_api"}

# 4. Start the server
if __name__ == "__main__":
    print("🚀 Starting JolBondhu API server...")
    print("📡 API Documentation available at: http://127.0.0.1:8000/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)