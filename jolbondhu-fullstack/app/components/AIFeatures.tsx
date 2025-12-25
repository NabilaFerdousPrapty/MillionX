"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Brain,
  Leaf,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Shield,
  Phone,
} from "lucide-react";

interface AIFeatureProps {
  userLocation?: { lat: number; lon: number };
}

interface FloodPrediction {
  risk_level: string;
  risk_score: number;
  risk_color: string;
  factors: Record<string, number>;
  nearest_district: string;
  confidence: number;
}

interface CropRecommendation {
  current_season: string;
  soil_type: string;
  recommended_crops: string[];
  planting_time: string;
  fertilizer_recommendation: string;
  irrigation_needs: string;
}

interface EmergencyAssistance {
  situation: string;
  urgency: string;
  immediate_actions: string[];
  nearest_hospital: any;
  nearest_shelter: any;
  emergency_numbers: string[];
  ai_advice: string;
}

interface ChatResponse {
  question: string;
  topic: string;
  answer: string;
  confidence: number;
  sources: string[];
  follow_up_questions: string[];
}

const ঝুঁকি_রঙ: Record<string, string> = {
  "অতি উচ্চ": "#dc2626",
  উচ্চ: "#f97316",
  মধ্যম: "#f59e0b",
  নিম্ন: "#10b981",
};

export default function AIFeatures({ userLocation }: AIFeatureProps) {
  const [activeTab, setActiveTab] = useState<
    "flood" | "crop" | "emergency" | "chat"
  >("flood");
  const [isLoading, setIsLoading] = useState(false);
  const [floodPrediction, setFloodPrediction] =
    useState<FloodPrediction | null>(null);
  const [cropRecommendation, setCropRecommendation] =
    useState<CropRecommendation | null>(null);
  const [emergencyAssistance, setEmergencyAssistance] =
    useState<EmergencyAssistance | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatResponse[]>([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [weatherData, setWeatherData] = useState<any>(null);

  const API_BASE = "http://127.0.0.1:8000";

  // Fetch initial data based on location
  // AIFeatures.tsx ফাইলের useEffect আপডেট করুন
  useEffect(() => {
    if (userLocation) {
      fetchFloodPrediction();
      fetchCropRecommendation();
      fetchWeatherData();
    } else {
      // যদি userLocation না থাকে, ডেমো ডেটা লোড করুন
      setFloodPrediction({
        risk_level: "উচ্চ",
        risk_score: 68.5,
        risk_color: "#f97316",
        factors: {
          rainfall_risk: 75,
          river_risk: 65,
          location_risk: 80,
          seasonal_risk: 80,
        },
        nearest_district: "সিরাজগঞ্জ",
        confidence: 87.5,
      });

      setCropRecommendation({
        current_season: "খরিফ-২",
        soil_type: "দোআঁশ মাটি",
        recommended_crops: ["ধান", "পাট", "মুগ ডাল"],
        planting_time: "জুলাই - সেপ্টেম্বর",
        fertilizer_recommendation: "ইউরিয়া: ২৫০-৩০০ kg/ha, TSP: ১৫০-২০০ kg/ha",
        irrigation_needs: "সপ্তাহে ২-৩ বার সেচ প্রয়োজন",
      });

      setWeatherData({
        temperature: 31.5,
        rainfall_24h: 45.2,
        humidity: 78,
        wind_speed: 12.3,
        cloud_cover: 65,
      });
    }
  }, [userLocation]);

  const fetchFloodPrediction = async () => {
    if (!userLocation) return;

    setIsLoading(true);
    try {
      console.log("Fetching flood prediction for:", userLocation);

      const response = await fetch(`${API_BASE}/predict/flood`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          lat: userLocation.lat,
          lon: userLocation.lon,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.status === "success" || data.prediction) {
        setFloodPrediction(data.prediction);
        setWeatherData(
          data.weather_data || {
            temperature: 31.5,
            rainfall_24h: 45.2,
            humidity: 78,
            wind_speed: 12.3,
            cloud_cover: 65,
          }
        );
      }
    } catch (error) {
      console.error("Flood prediction error:", error);
      // Fallback demo data
      setFloodPrediction({
        risk_level: "উচ্চ",
        risk_score: 68.5,
        risk_color: "#f97316",
        factors: {
          rainfall_risk: 75,
          river_risk: 65,
          location_risk: 80,
          seasonal_risk: 80,
        },
        nearest_district: "সিরাজগঞ্জ",
        confidence: 87.5,
      });

      setWeatherData({
        temperature: 31.5,
        rainfall_24h: 45.2,
        humidity: 78,
        wind_speed: 12.3,
        cloud_cover: 65,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const fetchCropRecommendation = async () => {
    if (!userLocation) return;

    try {
      const response = await fetch(`${API_BASE}/recommend/crops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: userLocation.lat,
          lon: userLocation.lon,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setCropRecommendation(data.recommendations);
      }
    } catch (error) {
      console.error("Crop recommendation error:", error);
      // Fallback demo data
      setCropRecommendation({
        current_season: "খরিফ-২",
        soil_type: "দোআঁশ মাটি",
        recommended_crops: ["ধান", "পাট", "মুগ ডাল"],
        planting_time: "জুলাই - সেপ্টেম্বর",
        fertilizer_recommendation: "ইউরিয়া: ২৫০-৩০০ kg/ha, TSP: ১৫০-২০০ kg/ha",
        irrigation_needs: "সপ্তাহে ২-৩ বার সেচ প্রয়োজন",
      });
    }
  };

  const fetchWeatherData = async () => {
    if (!userLocation) return;

    // Simulated weather data
    setWeatherData({
      temperature: 31.5,
      rainfall_24h: 45.2,
      humidity: 78,
      wind_speed: 12.3,
      cloud_cover: 65,
    });
  };

  const handleEmergencyRequest = async (situation: string, urgency: string) => {
    if (!userLocation) {
      alert("অবস্থান শনাক্ত করুন প্রথমে");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/assist/emergency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: { lat: userLocation.lat, lon: userLocation.lon },
          situation,
          urgency_level: urgency,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setEmergencyAssistance(data.assistance);
        setActiveTab("emergency");
      }
    } catch (error) {
      console.error("Emergency assistance error:", error);
      // Fallback demo data
      setEmergencyAssistance({
        situation: "বন্যা",
        urgency: "উচ্চ",
        immediate_actions: [
          "তাৎক্ষণিক নিরাপদ স্থানে যান",
          "গুরুত্বপূর্ণ জিনিসপত্র উঁচু স্থানে রাখুন",
          "জরুরি নম্বরগুলো ব্যবহার করুন",
        ],
        nearest_hospital: {
          name: "ঢাকা মেডিকেল কলেজ",
          distance: "৩.২ km",
        },
        nearest_shelter: {
          name: "মোহাম্মদপুর সাইক্লোন শেল্টার",
          distance: "২.৫ km",
        },
        emergency_numbers: ["৯৯৯", "১০৯০", "১০৬"],
        ai_advice: "তাৎক্ষণিক নিরাপদ স্থানে যান, সাহায্যের জন্য ৯৯৯ কল করুন",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    const question = userQuestion;
    setUserQuestion("");

    try {
      const response = await fetch(`${API_BASE}/chat/farmer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          location: userLocation,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setChatHistory([...chatHistory, data.response]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Fallback response
      setChatHistory([
        ...chatHistory,
        {
          question,
          topic: "সাধারণ",
          answer:
            "দয়া করে আপনার প্রশ্নটি আরও বিস্তারিতভাবে বলুন। অথবা সরাসরি কৃষি হেল্পলাইন ১৬১২৩ এ কল করুন।",
          confidence: 65,
          sources: ["বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট"],
          follow_up_questions: [
            "ধান চাষের ব্যয় কত?",
            "গম চাষের সেরা সময় কখন?",
          ],
        },
      ]);
    }
  };

  const getRiskDescription = (level: string) => {
    const descriptions: Record<string, string> = {
      "অতি উচ্চ": "তাৎক্ষণিক ব্যবস্থা প্রয়োজন। নিরাপদ স্থানে যান।",
      উচ্চ: "জরুরি প্রস্তুতি নিন। সতর্ক থাকুন।",
      মধ্যম: "সতর্কতা অবলম্বন করুন। পর্যবেক্ষণ করুন।",
      নিম্ন: "স্বাভাবিক অবস্থা। নিয়মিত মনিটর করুন।",
    };
    return descriptions[level] || "তথ্য পাওয়া যায়নি";
  };

  return (
    <div className="space-y-6">
      {/* AI Features Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8" />
              <h2 className="text-2xl font-bold">JolBondhu AI Assistant</h2>
            </div>
            <p className="opacity-90">
              কৃত্রিম বুদ্ধিমত্তা ভিত্তিক বন্যা পূর্বাভাস ও কৃষি পরামর্শ
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
              <Sparkles className="h-4 w-4" />
              <span>Real-time AI Analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveTab("flood")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeTab === "flood"
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <CloudRain className="h-4 w-4" />
          বন্যা পূর্বাভাস
        </button>
        <button
          onClick={() => setActiveTab("crop")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeTab === "crop"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Leaf className="h-4 w-4" />
          ফসল পরামর্শ
        </button>
        <button
          onClick={() => setActiveTab("emergency")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeTab === "emergency"
              ? "bg-red-100 text-red-700 border border-red-300"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          জরুরি সাহায্য
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeTab === "chat"
              ? "bg-purple-100 text-purple-700 border border-purple-300"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          AI চ্যাট
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">AI বিশ্লেষণ চলছে...</p>
          </div>
        )}

        {/* Flood Prediction Tab */}
        {!isLoading && activeTab === "flood" && (
          <div className="space-y-6">
            {floodPrediction ? (
              <>
                {/* Risk Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          বন্যা ঝুঁকি বিশ্লেষণ
                        </h3>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {floodPrediction.nearest_district}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
                          <div>
                            <p className="text-sm text-gray-600">
                              ঝুঁকি মাত্রা
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor: floodPrediction.risk_color,
                                }}
                              ></div>
                              <h4
                                className="text-2xl font-bold"
                                style={{ color: floodPrediction.risk_color }}
                              >
                                {floodPrediction.risk_level}
                              </h4>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">ঝুঁকি স্কোর</p>
                            <h4 className="text-2xl font-bold text-gray-900">
                              {floodPrediction.risk_score}/100
                            </h4>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            {getRiskDescription(floodPrediction.risk_level)}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">আস্থার হার</span>
                              <span className="font-medium text-green-600">
                                {floodPrediction.confidence}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">শেষ আপডেট</span>
                              <span className="font-medium text-gray-700">
                                {new Date().toLocaleTimeString("bn-BD")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weather Data */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      আবহাওয়া তথ্য
                    </h3>
                    {weatherData ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-orange-600" />
                            <span className="text-sm text-gray-600">
                              তাপমাত্রা
                            </span>
                          </div>
                          <span className="font-medium">
                            {weatherData.temperature}°C
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CloudRain className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-600">
                              বৃষ্টিপাত (২৪ঘণ্টা)
                            </span>
                          </div>
                          <span className="font-medium">
                            {weatherData.rainfall_24h} mm
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-cyan-600" />
                            <span className="text-sm text-gray-600">
                              আর্দ্রতা
                            </span>
                          </div>
                          <span className="font-medium">
                            {weatherData.humidity}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-600">
                              বাতাসের গতি
                            </span>
                          </div>
                          <span className="font-medium">
                            {weatherData.wind_speed} km/h
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        আবহাওয়া তথ্য লোড হচ্ছে...
                      </p>
                    )}
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    ঝুঁকি ফ্যাক্টর বিশ্লেষণ
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(floodPrediction.factors).map(
                      ([key, value]) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">
                              {key === "rainfall_risk" && "বৃষ্টিপাত ঝুঁকি"}
                              {key === "river_risk" && "নদীর পানি স্তর"}
                              {key === "location_risk" && "অবস্থানগত ঝুঁকি"}
                              {key === "seasonal_risk" && "মৌসুমি ঝুঁকি"}
                            </span>
                            <span className="text-sm font-medium">
                              {value}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${value}%`,
                                backgroundColor:
                                  value > 70
                                    ? "#dc2626"
                                    : value > 50
                                    ? "#f97316"
                                    : "#f59e0b",
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-blue-900">
                      🤖 AI এর সুপারিশ
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {floodPrediction.risk_level === "অতি উচ্চ" && (
                      <>
                        <p className="text-blue-800">
                          <strong>তাৎক্ষণিক পদক্ষেপ:</strong> নিরাপদ স্থানে
                          সরিয়ে যান, জরুরি নম্বরগুলো ব্যবহার করুন।
                        </p>
                        <p className="text-blue-800">
                          <strong>প্রস্তুতি:</strong> গুরুত্বপূর্ণ ডকুমেন্ট ও
                          জিনিসপত্র নিরাপদ স্থানে রাখুন।
                        </p>
                      </>
                    )}
                    {floodPrediction.risk_level === "উচ্চ" && (
                      <>
                        <p className="text-blue-800">
                          <strong>প্রস্তুতি:</strong> জরুরি প্রস্তুতির ব্যাগ
                          তৈরি করুন, গবাদিপশু নিরাপদ স্থানে নিন।
                        </p>
                        <p className="text-blue-800">
                          <strong>মনিটরিং:</strong> নদীর পানি স্তর ও আবহাওয়ার
                          রিপোর্ট নিয়মিত চেক করুন।
                        </p>
                      </>
                    )}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setActiveTab("emergency")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        জরুরি সাহায্য নিন
                      </button>
                      <button
                        onClick={fetchFloodPrediction}
                        className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        আপডেট করুন
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <CloudRain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  ঝুঁকি বিশ্লেষণ দেখতে অবস্থান শনাক্ত করুন
                </p>
              </div>
            )}
          </div>
        )}

        {/* Crop Recommendation Tab */}
        {!isLoading && activeTab === "crop" && (
          <div className="space-y-6">
            {cropRecommendation ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Crop Recommendations */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <Leaf className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          ফসল সুপারিশ
                        </h3>
                        <p className="text-sm text-gray-600">
                          বর্তমান মৌসুম: {cropRecommendation.current_season}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          🎯 সুপারিশকৃত ফসল
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {cropRecommendation.recommended_crops.map(
                            (crop, index) => (
                              <span
                                key={index}
                                className="px-3 py-2 bg-green-100 text-green-800 rounded-lg font-medium"
                              >
                                {crop}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          🌱 মাটির ধরন
                        </h4>
                        <p className="text-gray-700">
                          {cropRecommendation.soil_type}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          📅 রোপণের সময়
                        </h4>
                        <p className="text-gray-700">
                          {cropRecommendation.planting_time}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Farming Advice */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <h4 className="font-bold text-green-900 mb-3">
                        সার প্রয়োগ পরামর্শ
                      </h4>
                      <p className="text-green-800 text-sm">
                        {cropRecommendation.fertilizer_recommendation}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                      <h4 className="font-bold text-cyan-900 mb-3">
                        সেচ ব্যবস্থাপনা
                      </h4>
                      <p className="text-cyan-800 text-sm">
                        {cropRecommendation.irrigation_needs}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                      <h4 className="font-bold text-amber-900 mb-3">
                        🧠 AI টিপস
                      </h4>
                      <ul className="text-amber-800 text-sm space-y-2">
                        <li>• মৌসুমের প্রথম দিকে রোপণ করুন</li>
                        <li>• জৈব সার ব্যবহার করে উৎপাদন বাড়ান</li>
                        <li>• সেচের সময় পানির অপচয় রোধ করুন</li>
                        <li>• ফসলের স্বাস্থ্য নিয়মিত পর্যবেক্ষণ করুন</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Market Information */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    বাজার তথ্য ও সহায়তা
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
                      <h4 className="font-medium text-blue-900">কৃষি ঋণ</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        সরকারি সুবিধা ও ঋণ স্কিম
                      </p>
                    </button>
                    <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
                      <h4 className="font-medium text-green-900">
                        বাজার মূল্য
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        দৈনিক ফসলের দর জানুন
                      </p>
                    </button>
                    <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
                      <h4 className="font-medium text-purple-900">
                        বীমা ক্লেম
                      </h4>
                      <p className="text-sm text-purple-700 mt-1">
                        ফসল বীমা দাবি করুন
                      </p>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  ফসল সুপারিশ দেখতে অবস্থান শনাক্ত করুন
                </p>
              </div>
            )}
          </div>
        )}

        {/* Emergency Assistance Tab */}
        {!isLoading && activeTab === "emergency" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Emergency Types */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        জরুরি সাহায্য প্রয়োজন?
                      </h3>
                      <p className="text-sm text-gray-600">
                        আপনার পরিস্থিতি নির্বাচন করুন
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { type: "বন্যা", urgency: "উচ্চ", icon: "🌊" },
                      { type: "নদী ভাঙন", urgency: "উচ্চ", icon: "🏞️" },
                      { type: "ফসল নষ্ট", urgency: "মধ্যম", icon: "🌾" },
                      {
                        type: "স্বাস্থ্য জরুরি",
                        urgency: "অতি উচ্চ",
                        icon: "🏥",
                      },
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleEmergencyRequest(item.type, item.urgency)
                        }
                        className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{item.icon}</span>
                          <ChevronRight className="h-5 w-5 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="font-medium text-red-900">
                          {item.type}
                        </h4>
                        <p className="text-sm text-red-700 mt-1">
                          জরুরি মাত্রা: {item.urgency}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emergency Assistance Result */}
                {emergencyAssistance && (
                  <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-6 w-6 text-red-600" />
                      <h3 className="text-lg font-bold text-red-900">
                        AI জরুরি সহায়তা
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-red-900 mb-2">
                          তাৎক্ষণিক পদক্ষেপ:
                        </h4>
                        <ul className="space-y-2">
                          {emergencyAssistance.immediate_actions.map(
                            (action, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                <span className="text-red-800">{action}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-red-900 mb-2">
                          🤖 AI পরামর্শ:
                        </h4>
                        <p className="text-red-800">
                          {emergencyAssistance.ai_advice}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-red-200">
                          <h5 className="font-medium text-red-900 text-sm mb-1">
                            নিকটস্থ হাসপাতাল
                          </h5>
                          <p className="text-red-700 text-sm">
                            {emergencyAssistance.nearest_hospital?.name}
                          </p>
                          <p className="text-red-600 text-xs">
                            দূরত্ব:{" "}
                            {emergencyAssistance.nearest_hospital?.distance}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-red-200">
                          <h5 className="font-medium text-red-900 text-sm mb-1">
                            নিকটস্থ আশ্রয়কেন্দ্র
                          </h5>
                          <p className="text-red-700 text-sm">
                            {emergencyAssistance.nearest_shelter?.name}
                          </p>
                          <p className="text-red-600 text-xs">
                            দূরত্ব:{" "}
                            {emergencyAssistance.nearest_shelter?.distance}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-red-200">
                        <h4 className="font-medium text-red-900 mb-2">
                          জরুরি নম্বর:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {emergencyAssistance.emergency_numbers.map(
                            (number, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  window.open(`tel:${number}`, "_blank")
                                }
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                              >
                                <Phone className="h-4 w-4" />
                                {number}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Emergency Actions */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4">
                    দ্রুত সাহায্য
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => window.open("tel:999", "_blank")}
                      className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="h-5 w-5" />
                      জরুরি কল করুন (৯৯৯)
                    </button>
                    <button
                      onClick={() => window.open("tel:1090", "_blank")}
                      className="w-full p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="h-5 w-5" />
                      দুর্যোগ ব্যবস্থাপনা (১০৯০)
                    </button>
                    <button
                      onClick={() => window.open("tel:106", "_blank")}
                      className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="h-5 w-5" />
                      অ্যাম্বুলেন্স (১০৬)
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3">
                    🚨 জরুরি টিপস
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-2">
                    <li>• শান্ত থাকুন, ভয় পাবেন না</li>
                    <li>• নিরাপদ স্থানে যান</li>
                    <li>• জরুরি নম্বরগুলো হাতে রাখুন</li>
                    <li>• গুরুত্বপূর্ণ জিনিসপত্র সাথে রাখুন</li>
                    <li>• পরিবারের সদস্যদের সাথে যোগাযোগ রাখুন</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Tab */}
        {!isLoading && activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[500px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        JolBondhu AI চ্যাট
                      </h3>
                      <p className="text-sm text-gray-600">
                        কৃষি বিশেষজ্ঞ AI সহকারী
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        কৃষি সম্পর্কিত যেকোন প্রশ্ন করুন
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        উদাহরণ: "ধান চাষের সেরা সময় কখন?", "গমের সার কতটুকু
                        দেব?"
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((chat, index) => (
                      <div key={index} className="space-y-4">
                        {/* User Question */}
                        <div className="flex justify-end">
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                            <p>{chat.question}</p>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">
                                টপিক: {chat.topic} | আস্থা: {chat.confidence}%
                              </span>
                            </div>
                            <p className="text-gray-800">{chat.answer}</p>

                            {/* Follow-up Questions */}
                            {chat.follow_up_questions.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">
                                  সম্পর্কিত প্রশ্ন:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {chat.follow_up_questions
                                    .slice(0, 3)
                                    .map((q, i) => (
                                      <button
                                        key={i}
                                        onClick={() => setUserQuestion(q)}
                                        className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-50"
                                      >
                                        {q}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder="আপনার কৃষি সম্পর্কিত প্রশ্ন লিখুন..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !userQuestion.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
                    >
                      {isLoading ? "..." : "জিজ্ঞাসা করুন"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Chat Suggestions */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4">দ্রুত প্রশ্ন</h4>
                <div className="space-y-3">
                  {[
                    "ধান চাষের ব্যয় কত?",
                    "গমের সেরা জাত কোনটি?",
                    "পাট চাষের সময় কখন?",
                    "কৃষি ঋণ পেতে কি করতে হবে?",
                    "ফসলের রোগের প্রতিকার কি?",
                    "সার প্রয়োগের নিয়ম কি?",
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setUserQuestion(question)}
                      className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-3">
                  💡 AI চ্যাট বৈশিষ্ট্য
                </h4>
                <ul className="text-purple-800 text-sm space-y-2">
                  <li>• ২৪/৭ কৃষি পরামর্শ</li>
                  <li>• অবস্থানভিত্তিক সুপারিশ</li>
                  <li>• বাস্তবসম্মত সমাধান</li>
                  <li>• সরকারি স্কিম তথ্য</li>
                  <li>• বাজার মূল্য নির্দেশিকা</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3">সরাসরি সাহায্য</h4>
                <button
                  onClick={() => window.open("tel:16123", "_blank")}
                  className="w-full p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  কৃষি হেল্পলাইন (১৬১২৩)
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ২৪ ঘন্টা কৃষি পরামর্শ সেবা
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
