export interface AIFeatureProps {
  userLocation?: { lat: number; lon: number };
}

export interface FloodPrediction {
  risk_level: string;
  risk_score: number;
  risk_color: string;
  factors: Record<string, number>;
  nearest_district: string;
  confidence: number;
}

export interface CropRecommendation {
  current_season: string;
  soil_type: string;
  recommended_crops: string[];
  planting_time: string;
  fertilizer_recommendation: string;
  irrigation_needs: string;
}

export interface EmergencyAssistance {
  situation: string;
  urgency: string;
  immediate_actions: string[];
  nearest_hospital: any;
  nearest_shelter: any;
  emergency_numbers: string[];
  ai_advice: string;
}

export interface ChatResponse {
  question: string;
  topic: string;
  answer: string;
  confidence: number;
  sources: string[];
  follow_up_questions: string[];
}
