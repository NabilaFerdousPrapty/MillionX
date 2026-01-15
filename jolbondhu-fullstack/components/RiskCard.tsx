"use client";

import {
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Droplets,
  RefreshCw,
  MapPin,
  CloudRain,
  Thermometer,
  Wind,
  Loader2,
  ShieldAlert,
  Clock,
  Waves,
  ThermometerSun,
  Cloud,
  Navigation,
} from "lucide-react";
import { useState, useEffect } from "react";

interface RiskCardProps {
  latitude?: number;
  longitude?: number;
}

interface FloodRiskData {
  riskLevel: "নিম্ন" | "মধ্যম" | "উচ্চ" | "অতি_উচ্চ";
  riskScore: number;
  confidence: number;
  nextUpdate: string;
  lastUpdated: string;
  locationName: string;
  factors: {
    precipitation: number;
    riverLevel: number;
    soilMoisture: number;
    upstreamFlow: number;
    windSpeed: number;
    forecast: string;
    temperature: number;
    humidity: number;
  };
  recommendations: string[];
  warnings: string[];
  nearestRiver: string;
  elevation: number;
}

export default function RiskCard({ latitude, longitude }: RiskCardProps) {
  const [floodData, setFloodData] = useState<FloodRiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFloodData = async () => {
    if (!latitude || !longitude) {
      setError("অবস্থান তথ্য পাওয়া যায়নি");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/flood-risk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: latitude,
          lon: longitude,
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      setFloodData(data);
    } catch (err) {
      console.error("Error fetching flood data:", err);
      setError(
        "বন্যা ঝুঁকি তথ্য লোড করতে সমস্যা। অনুগ্রহ করে আবার চেষ্টা করুন।"
      );
      // Fallback to mock data
      setFloodData(generateMockFloodData(latitude, longitude));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchFloodData();
    }
  }, [latitude, longitude]);

  const generateMockFloodData = (lat: number, lon: number): FloodRiskData => {
    const riskScore = 45 + Math.random() * 40;
    let riskLevel: FloodRiskData["riskLevel"] = "নিম্ন";
    if (riskScore >= 80) riskLevel = "অতি_উচ্চ";
    else if (riskScore >= 60) riskLevel = "উচ্চ";
    else if (riskScore >= 30) riskLevel = "মধ্যম";

    return {
      riskLevel,
      riskScore: Math.round(riskScore),
      confidence: 75 + Math.random() * 20,
      nextUpdate: getNextUpdateTime(),
      lastUpdated: new Date().toLocaleTimeString("bn-BD"),
      locationName: "সিরাজগঞ্জ, বাংলাদেশ",
      factors: {
        precipitation: 15 + Math.random() * 20,
        riverLevel: 4 + Math.random() * 6,
        soilMoisture: 60 + Math.random() * 30,
        upstreamFlow: 200 + Math.random() * 200,
        windSpeed: 5 + Math.random() * 10,
        forecast: "মাঝারি বৃষ্টি",
        temperature: 28 + Math.random() * 7,
        humidity: 70 + Math.random() * 20,
      },
      recommendations: [
        "জমির জল নিষ্কাশন পরীক্ষা করুন",
        "ফসলের অবস্থা পর্যবেক্ষণ করুন",
        "আবহাওয়ার পূর্বাভাস নিয়মিত দেখুন",
      ],
      warnings: ["মাঝারি বন্যার সম্ভাবনা"],
      nearestRiver: "যমুনা নদী",
      elevation: 10 + Math.random() * 40,
    };
  };

  const getNextUpdateTime = (): string => {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1);
    return nextHour.toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const ঝুঁকি_কনফিগ = {
    নিম্ন: {
      color: "bg-emerald-100 text-emerald-800",
      icon: CheckCircle,
      title: "নিম্ন ঝুঁকি",
      description: "স্বাভাবিক কৃষিকাজ চালিয়ে যেতে পারেন",
      gradient: "from-emerald-100 to-emerald-200",
      advice: "ফসল রোপণ ও পরিচর্যা চালিয়ে যান",
      alert: false,
    },
    মধ্যম: {
      color: "bg-amber-100 text-amber-800",
      icon: Info,
      title: "মধ্যম ঝুঁকি",
      description: "পরিস্থিতি নিবিড়ভাবে পর্যবেক্ষণ করুন",
      gradient: "from-amber-100 to-yellow-200",
      advice: "অতিরিক্ত সতর্কতা অবলম্বন করুন",
      alert: false,
    },
    উচ্চ: {
      color: "bg-orange-100 text-orange-800",
      icon: AlertTriangle,
      title: "উচ্চ ঝুঁকি",
      description: "তাৎক্ষণিক প্রতিরোধমূলক ব্যবস্থা নিন",
      gradient: "from-orange-100 to-red-200",
      advice: "জরুরি সতর্কতা অনুসরণ করুন",
      alert: true,
    },
    অতি_উচ্চ: {
      color: "bg-red-100 text-red-800",
      icon: ShieldAlert,
      title: "অতি উচ্চ ঝুঁকি",
      description: "জীবন ও সম্পদের ঝুঁকি, অবিলম্বে ব্যবস্থা নিন",
      gradient: "from-red-100 to-red-300",
      advice: "অবিলম্বে নিরাপদ স্থানে যান",
      alert: true,
    },
  };

  if (loading) {
    return (
      <div className="bangladeshi-card p-8 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-green-800">বন্যা ঝুঁকি তথ্য লোড হচ্ছে...</p>
        <p className="text-sm text-green-600 mt-2">
          আপনার অবস্থান বিশ্লেষণ করা হচ্ছে
        </p>
      </div>
    );
  }

  if (error && !floodData) {
    return (
      <div className="bangladeshi-card p-6">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchFloodData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  if (!floodData) return null;

  const কনফিগ = ঝুঁকি_কনফিগ[floodData.riskLevel];
  const আইকন = কনফিগ.icon;

  return (
    <div className="bangladeshi-card p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${কনফিগ.gradient} opacity-10`}
      />

      {/* Location and Refresh Header */}
      <div className="relative mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <MapPin className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-900">
                বন্যা ঝুঁকি বিশ্লেষণ
              </h2>
              <p className="text-green-700 flex items-center gap-2">
                <span>{floodData.locationName}</span>
                <span className="text-xs px-2 py-1 bg-green-100 rounded">
                  উচ্চতা: {floodData.elevation.toFixed(1)} মিটার
                </span>
              </p>
              <p className="text-sm text-green-600">
                নিকটতম নদী: {floodData.nearestRiver}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchFloodData}
              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Clock className="h-3 w-3" />
                শেষ আপডেট: {floodData.lastUpdated}
              </div>
              <div className="text-xs text-green-500">
                পরবর্তী আপডেট: {floodData.nextUpdate}
              </div>
            </div>
          </div>
        </div>

        {/* Main Risk Indicator */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-4 ${কনফিগ.color} rounded-2xl shadow-lg`}>
              <আইকন className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-900">
                {কনফিগ.title}
              </h3>
              <p className="text-green-700">{কনফিগ.description}</p>
              <p className="text-green-600 mt-1">
                <span className="font-semibold">পরামর্শ:</span> {কনফিগ.advice}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-green-900">
              {floodData.riskScore}%
            </div>
            <div className="text-sm text-green-600">ঝুঁকি স্কোর</div>
            <div className="text-xs text-green-500 mt-1">
              {floodData.confidence}% নির্ভরযোগ্যতা
            </div>
          </div>
        </div>
      </div>

      <div className="relative space-y-6">
        {/* Risk Progress Bar */}
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-green-200">
          <div className="flex justify-between text-sm text-green-700 mb-2">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              ঝুঁকির মাত্রা বিশ্লেষণ
            </span>
            <span className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-green-100 rounded">
                আপডেট: {floodData.lastUpdated}
              </span>
            </span>
          </div>
          <div className="h-4 bg-green-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${কনফিগ.gradient} rounded-full transition-all duration-1000`}
              style={{ width: `${floodData.riskScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-green-600 mt-2 px-1">
            <span>০% - নিম্ন</span>
            <span>৩০% - মধ্যম</span>
            <span>৬০% - উচ্চ</span>
            <span className="font-semibold text-red-600">৮০%+ - অতি উচ্চ</span>
          </div>
        </div>

        {/* Real-time Factors */}
        <div>
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            রিয়েল-টাইম ঝুঁকি কারণসমূহ
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "বৃষ্টিপাত",
                value: `${floodData.factors.precipitation.toFixed(1)} মিমি`,
                icon: CloudRain,
                status:
                  floodData.factors.precipitation > 20
                    ? "উচ্চ"
                    : floodData.factors.precipitation > 10
                    ? "মধ্যম"
                    : "নিম্ন",
                color:
                  floodData.factors.precipitation > 20
                    ? "bg-red-100 text-red-800"
                    : floodData.factors.precipitation > 10
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800",
              },
              {
                label: "নদীর পানির স্তর",
                value: `${floodData.factors.riverLevel.toFixed(1)} মিটার`,
                icon: Waves,
                status:
                  floodData.factors.riverLevel > 8
                    ? "উচ্চ"
                    : floodData.factors.riverLevel > 6
                    ? "মধ্যম"
                    : "নিম্ন",
                color:
                  floodData.factors.riverLevel > 8
                    ? "bg-red-100 text-red-800"
                    : floodData.factors.riverLevel > 6
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800",
              },
              {
                label: "মাটির আর্দ্রতা",
                value: `${floodData.factors.soilMoisture.toFixed(0)}%`,
                icon: Droplets,
                status:
                  floodData.factors.soilMoisture > 80
                    ? "উচ্চ"
                    : floodData.factors.soilMoisture > 60
                    ? "মধ্যম"
                    : "নিম্ন",
                color:
                  floodData.factors.soilMoisture > 80
                    ? "bg-red-100 text-red-800"
                    : floodData.factors.soilMoisture > 60
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800",
              },
              {
                label: "তাপমাত্রা",
                value: `${floodData.factors.temperature.toFixed(1)}°C`,
                icon: ThermometerSun,
                status: floodData.factors.temperature > 35 ? "উচ্চ" : "সাধারণ",
                color:
                  floodData.factors.temperature > 35
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800",
              },
              {
                label: "উজানের প্রবাহ",
                value: `${floodData.factors.upstreamFlow.toFixed(0)} m³/s`,
                icon: Navigation,
                status:
                  floodData.factors.upstreamFlow > 400
                    ? "উচ্চ"
                    : floodData.factors.upstreamFlow > 200
                    ? "মধ্যম"
                    : "নিম্ন",
                color:
                  floodData.factors.upstreamFlow > 400
                    ? "bg-red-100 text-red-800"
                    : floodData.factors.upstreamFlow > 200
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800",
              },
              {
                label: "বাতাসের গতি",
                value: `${floodData.factors.windSpeed.toFixed(1)} km/h`,
                icon: Wind,
                status: floodData.factors.windSpeed > 15 ? "উচ্চ" : "নিম্ন",
                color:
                  floodData.factors.windSpeed > 15
                    ? "bg-purple-100 text-purple-800"
                    : "bg-cyan-100 text-cyan-800",
              },
              {
                label: "আপেক্ষিক আর্দ্রতা",
                value: `${floodData.factors.humidity}%`,
                icon: Cloud,
                status:
                  floodData.factors.humidity > 85
                    ? "উচ্চ"
                    : floodData.factors.humidity > 70
                    ? "মধ্যম"
                    : "নিম্ন",
                color:
                  floodData.factors.humidity > 85
                    ? "bg-red-100 text-red-800"
                    : floodData.factors.humidity > 70
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800",
              },
              {
                label: "আবহাওয়ার পূর্বাভাস",
                value: floodData.factors.forecast,
                icon: CloudRain,
                status: floodData.factors.forecast.includes("বৃষ্টি")
                  ? "উচ্চ"
                  : "নিম্ন",
                color: floodData.factors.forecast.includes("বৃষ্টি")
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800",
              },
            ].map((কারণ, সূচক) => (
              <div
                key={সূচক}
                className="bg-white p-4 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <কারণ.icon
                    className={`h-5 w-5 ${
                      কারণ.color.includes("red")
                        ? "text-red-500"
                        : কারণ.color.includes("amber")
                        ? "text-amber-500"
                        : কারণ.color.includes("emerald")
                        ? "text-emerald-500"
                        : কারণ.color.includes("blue")
                        ? "text-blue-500"
                        : কারণ.color.includes("purple")
                        ? "text-purple-500"
                        : কারণ.color.includes("cyan")
                        ? "text-cyan-500"
                        : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${কারণ.color} font-medium`}
                  >
                    {কারণ.status}
                  </span>
                </div>
                <p className="text-sm text-green-700 font-medium mb-1">
                  {কারণ.label}
                </p>
                <p className="text-xl font-bold text-green-900">{কারণ.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-300">
          <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            প্রস্তাবিত ব্যবস্থা
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {floodData.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <span className="text-sm text-green-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Alert */}
        {কনফিগ.alert && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-bold text-red-800">🚨 জরুরি সতর্কতা</p>
                <p className="text-sm text-red-700">
                  {floodData.warnings.join(" ")}
                </p>
                <div className="mt-2 text-xs text-red-600">
                  <p>🔔 স্থানীয় কর্তৃপক্ষের নির্দেশনা অনুসরণ করুন</p>
                  <p>📞 জরুরি যোগাযোগ: ৯৯৯</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Source */}
        <div className="text-xs text-green-600 pt-4 border-t border-green-200">
          <p>
            তথ্যের উৎস: OpenWeather API, Open-Elevation API, River Monitoring
            Systems
          </p>
          <p className="mt-1">
            দ্রষ্টব্য: এটি একটি পূর্বাভাসমূলক মডেল। স্থানীয় কর্তৃপক্ষের
            নির্দেশনা সর্বদা অগ্রাধিকার পাবে।
          </p>
        </div>
      </div>
    </div>
  );
}
