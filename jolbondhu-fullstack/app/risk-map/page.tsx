"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  CloudRain,
  Navigation,
  AlertTriangle,
  Shield,
  RefreshCw,
  Gauge,
  Waves,
  Sun,
  Wind,
} from "lucide-react";

// --- Dynamic Imports for Leaflet ---
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
        <span className="text-gray-400">ম্যাপ লোড হচ্ছে...</span>
      </div>
    ),
  },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false },
);

type RiskLevel = "নিম্ন" | "মধ্যম" | "উচ্চ" | "অতি উচ্চ";

interface DistrictInfo {
  name: string;
  division: string;
  latitude: number;
  longitude: number;
  flood_risk_level: RiskLevel;
  flood_risk_score: number;
}

interface WeatherData {
  rainfall_mm: number;
  rainfall_3_days: number;
  river_level_m: number;
  humidity_percent: number;
  temperature_c: number;
}

interface PredictionData {
  risk_level: RiskLevel;
  risk_score: number;
  confidence: number;
  probabilities?: {
    low: number;
    medium: number;
    high: number;
    very_high: number;
  };
  detailed_scores?: {
    zone_score: number;
    river_score: number;
    rain_score: number;
  };
  model_scores?: {
    xgb_score: number;
    lstm_score: number;
    unet_score: number;
    ensemble_score: number;
  };
}

interface AdviceData {
  title: string;
  message: string;
  actions: string[];
  color: string;
}

interface AIResponse {
  status: string;
  timestamp: string;
  cache_info?: string;
  location: {
    latitude: number;
    longitude: number;
    district: string;
    division: string;
    flood_risk_factor: number;
  };
  weather_data: WeatherData;
  prediction: PredictionData;
  advice: AdviceData;
  recommendations: {
    immediate: string[];
    preparation: string[];
  };
  detailed_scores?: any;
}

const API_BASE = "http://127.0.0.1:8000";

export default function RiskMapPage() {
  const [timeFilter, setTimeFilter] = useState("আগামী ৭ দিন");
  const [layer, setLayer] = useState("ঝুঁকি_মানচিত্র");
  const [zoomLevel, setZoomLevel] = useState(7);
  const [Leaflet, setLeaflet] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [allDistricts, setAllDistricts] = useState<DistrictInfo[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [modelsStatus, setModelsStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const ঝুঁকি_রঙ: Record<RiskLevel, string> = {
    নিম্ন: "#10b981",
    মধ্যম: "#f59e0b",
    উচ্চ: "#f97316",
    "অতি উচ্চ": "#dc2626",
  };

  const filteredDistricts = allDistricts.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 1. Initialize Leaflet
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        setLeaflet(L);
        setMapReady(true);
      });
    }
  }, []);

  // 2. Load Models Status
  useEffect(() => {
    const fetchModelsStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/models/status`);
        if (res.ok) {
          const data = await res.json();
          setModelsStatus(data);
        }
      } catch (e) {
        console.error("Could not fetch models status");
      }
    };
    fetchModelsStatus();
  }, []);

  // 3. Load District Data
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setApiError("");
        const res = await fetch(`${API_BASE}/districts`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (data.status === "success") {
          setAllDistricts(data.districts);
          if (data.districts?.length > 0) {
            setSelectedDistrict(data.districts[0].name);
          }
        }
      } catch (e: any) {
        console.error("District Fetch Error:", e);
        setApiError(
          "সার্ভার থেকে ডেটা লোড করা যাচ্ছে না। ব্যাকএন্ড চালু আছে কিনা যাচাই করুন।",
        );
      }
    };
    fetchDistricts();
  }, []);

  // ─── FIXED: Use URLSearchParams so Bengali text is encoded correctly ─────────
  const fetchAiPrediction = async (
    districtName: string,
    lat: number,
    lon: number,
  ) => {
    setIsLoading(true);
    setApiError("");

    try {
      // URLSearchParams handles Unicode (Bengali) encoding correctly.
      // The browser will set the proper charset header automatically.
      const params = new URLSearchParams();
      params.set("lat", String(lat));
      params.set("lon", String(lon));
      params.set("district", districtName); // Bengali passed as-is — no manual encode

      const url = `${API_BASE}/predict?${params.toString()}`;
      console.log("[Predict] URL →", url);

      let res: Response;
      try {
        res = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(15_000),
        });
      } catch (networkErr: any) {
        const msg =
          networkErr?.name === "TimeoutError"
            ? "সার্ভার সাড়া দিচ্ছে না (timeout)। ব্যাকএন্ড চালু আছে কিনা দেখুন।"
            : `নেটওয়ার্ক ত্রুটি: ${networkErr?.message ?? "অজানা"}`;
        setApiError(msg);
        setAiResult(getMockResponse(districtName, lat, lon));
        return;
      }

      // Read body before checking res.ok so we get the real error detail
      let data: any;
      try {
        data = await res.json();
      } catch {
        setApiError(
          `সার্ভার অপ্রত্যাশিত রেসপন্স পাঠিয়েছে (HTTP ${res.status})।`,
        );
        setAiResult(getMockResponse(districtName, lat, lon));
        return;
      }

      if (!res.ok) {
        // FastAPI validation errors: detail is either a string or [{loc,msg,type}]
        let detail = "অজানা ত্রুটি";
        if (typeof data?.detail === "string") {
          detail = data.detail;
        } else if (Array.isArray(data?.detail)) {
          detail = data.detail
            .map((e: any) => `${e.loc?.join(".")} — ${e.msg}`)
            .join(", ");
        } else if (data?.message) {
          detail = data.message;
        }
        setApiError(`API ত্রুটি (${res.status}): ${detail}`);
        setAiResult(getMockResponse(districtName, lat, lon));
        return;
      }

      if (data.status !== "success") {
        const detail = data?.detail || data?.message || "Prediction failed";
        setApiError(`পূর্বাভাস ত্রুটি: ${detail}`);
        setAiResult(getMockResponse(districtName, lat, lon));
        return;
      }

      // ✅ Success
      setAiResult(data);
      setZoomLevel(10);
    } finally {
      setIsLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const getMockResponse = (
    districtName: string,
    lat: number,
    lon: number,
  ): AIResponse => {
    const riskLevels: RiskLevel[] = ["নিম্ন", "মধ্যম", "উচ্চ"];
    const randomRisk =
      riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const tempVariation = (lat - 23.8) * -0.5;
    const baseTemp = 28 + tempVariation + (Math.random() * 3 - 1.5);
    let riverLevel = 3.5;
    if (
      districtName.includes("কুড়িগ্রাম") ||
      districtName.includes("সিরাজগঞ্জ")
    ) {
      riverLevel = 7.5 + Math.random() * 2;
    } else if (
      districtName.includes("সুনামগঞ্জ") ||
      districtName.includes("সিলেট")
    ) {
      riverLevel = 6.5 + Math.random() * 2;
    } else {
      riverLevel = 3 + Math.random() * 2;
    }
    return {
      status: "success",
      timestamp: new Date().toISOString(),
      cache_info: "fresh",
      location: {
        latitude: lat,
        longitude: lon,
        district: districtName,
        division: "ঢাকা",
        flood_risk_factor:
          randomRisk === "উচ্চ" ? 0.8 : randomRisk === "মধ্যম" ? 0.5 : 0.2,
      },
      weather_data: {
        rainfall_mm: Math.random() * 150 + 20,
        rainfall_3_days: Math.random() * 80 + 10,
        river_level_m: riverLevel,
        humidity_percent: 60 + Math.random() * 25,
        temperature_c: parseFloat(baseTemp.toFixed(1)),
      },
      prediction: {
        risk_level: randomRisk,
        risk_score:
          randomRisk === "উচ্চ" ? 75 : randomRisk === "মধ্যম" ? 50 : 25,
        confidence: 75 + Math.random() * 15,
        probabilities: {
          low: randomRisk === "নিম্ন" ? 70 : 20,
          medium: randomRisk === "মধ্যম" ? 60 : 25,
          high: randomRisk === "উচ্চ" ? 65 : 20,
          very_high: 10,
        },
        detailed_scores: {
          zone_score: parseFloat((0.3 + Math.random() * 0.6).toFixed(2)),
          river_score: parseFloat((0.2 + Math.random() * 0.7).toFixed(2)),
          rain_score: parseFloat((0.1 + Math.random() * 0.8).toFixed(2)),
        },
        model_scores: {
          xgb_score: 70 + Math.random() * 20,
          lstm_score: 65 + Math.random() * 20,
          unet_score: 60 + Math.random() * 20,
          ensemble_score: 68 + Math.random() * 15,
        },
      },
      advice: {
        title:
          randomRisk === "উচ্চ"
            ? "জরুরি অবস্থা"
            : randomRisk === "মধ্যম"
              ? "সতর্কতা প্রয়োজন"
              : "স্বাভাবিক অবস্থা",
        message: `${districtName} এলাকায় বন্যার ${randomRisk} ঝুঁকি রয়েছে।`,
        actions: [
          "নিয়মিত আবহাওয়ার রিপোর্ট চেক করুন",
          "স্থানীয় কর্তৃপক্ষের নির্দেশনা অনুসরণ করুন",
        ],
        color: ঝুঁকি_রঙ[randomRisk],
      },
      recommendations: {
        immediate: [
          "আবহাওয়ার পূর্বাভাস পর্যবেক্ষণ করুন",
          "জরুরি নম্বর হাতে রাখুন (৯৯৯)",
        ],
        preparation: [
          "জরুরি প্রস্তুতি তালিকা প্রস্তুত করুন",
          "নিরাপদ আশ্রয়ের অবস্থান জেনে রাখুন",
        ],
      },
    };
  };

  const handleDistrictClick = async (districtName: string) => {
    const d = allDistricts.find((x) => x.name === districtName);
    if (!d) return;
    setSelectedDistrict(districtName);
    await fetchAiPrediction(d.name, d.latitude, d.longitude);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("ব্রাউজার জিপিএস সমর্থন করে না।");
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!allDistricts.length) {
          setIsLoading(false);
          alert("জেলার তথ্য লোড হয়নি।");
          return;
        }
        let nearest = allDistricts[0];
        let best = Infinity;
        for (const d of allDistricts) {
          const R = 6371;
          const lat1 = (latitude * Math.PI) / 180;
          const lat2 = (d.latitude * Math.PI) / 180;
          const dLat = ((d.latitude - latitude) * Math.PI) / 180;
          const dLon = ((d.longitude - longitude) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
          const distance = 2 * R * Math.asin(Math.sqrt(a));
          if (distance < best) {
            best = distance;
            nearest = d;
          }
        }
        setSelectedDistrict(nearest.name);
        await fetchAiPrediction(nearest.name, latitude, longitude);
      },
      (error) => {
        setIsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert("লোকেশন পারমিশন Allow করুন ব্রাউজার সেটিংসে।");
        } else {
          alert("লোকেশন এরর: " + error.message);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleRefresh = () => {
    if (selectedDistrict) {
      const district = allDistricts.find((d) => d.name === selectedDistrict);
      if (district) {
        fetchAiPrediction(district.name, district.latitude, district.longitude);
      }
    }
  };

  const RiskBadge = ({ level }: { level: RiskLevel }) => (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-semibold"
      style={{ backgroundColor: ঝুঁকি_রঙ[level] }}
    >
      <AlertTriangle className="w-4 h-4" />
      {level}
    </div>
  );

  const ConfidenceMeter = ({ confidence }: { confidence: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 rounded-full h-2 transition-all duration-500"
        style={{ width: `${confidence}%` }}
      />
    </div>
  );

  const mapCenter: [number, number] = aiResult
    ? [aiResult.location.latitude, aiResult.location.longitude]
    : [23.8103, 90.4125];

  const বাংলাদেশ_সীমানা: any = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "বাংলাদেশ" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [88.0464, 26.6314],
              [92.6727, 26.4465],
              [92.3057, 20.786],
              [88.8881, 21.7022],
              [88.0464, 26.6314],
            ],
          ],
        },
      },
    ],
  };

  const ঝুঁকি_আইকন = useMemo(() => {
    if (!Leaflet) return {} as any;
    const createIcon = (color: string, text: string) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="${color}" stroke="white" stroke-width="3"/>
        <text x="24" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="white">${text}</text>
      </svg>`;
      return Leaflet.icon({
        iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });
    };
    return {
      নিম্ন: createIcon("#10b981", "ন"),
      মধ্যম: createIcon("#f59e0b", "ম"),
      উচ্চ: createIcon("#f97316", "উ"),
      "অতি উচ্চ": createIcon("#dc2626", "!!"),
    };
  }, [Leaflet]);

  if (!mapReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-green-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4" />
          ম্যাপ প্রস্তুত হচ্ছে...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div className="container mx-auto px-4 py-8">
        {modelsStatus?.models_loaded && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-300 text-sm flex items-center gap-2">
            <Shield className="w-5 h-5" />✅ AI মডেল সক্রিয় (XGBoost + LSTM +
            UNet) - রিয়েল টাইম পূর্বাভাস
          </div>
        )}

        {apiError && (
          <div className="mb-4 p-4 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300">
            <p className="font-semibold">⚠️ সতর্কতা:</p>
            <p>{apiError}</p>
            <p className="text-sm mt-2">
              ডেমো ডেটা দেখানো হচ্ছে। ব্যাকএন্ড সার্ভার চালু করতে: python
              index.py
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    বন্যা ঝুঁকি মানচিত্র
                  </h1>
                  <p className="text-sm text-gray-500">
                    AI + NASA POWER রিয়েল-টাইম ডেটা
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    সময়সীমা
                  </label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>আগামী ৭ দিন</option>
                    <option>আগামী ১৪ দিন</option>
                    <option>আগামী ৩০ দিন</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    লেয়ার
                  </label>
                  <select
                    value={layer}
                    onChange={(e) => setLayer(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>ঝুঁকি_মানচিত্র</option>
                    <option>বৃষ্টিপাত</option>
                    <option>নদীর_স্তর</option>
                    <option>তাপমাত্রা</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                  {isLoading ? "যাচাই করা হচ্ছে..." : "আমার লোকেশন চেক করুন"}
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading || !selectedDistrict}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                  title="রিফ্রেশ"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">
                  জেলা নির্বাচন করুন:
                </h3>
                <input
                  type="text"
                  placeholder="জেলা খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredDistricts.map((d) => (
                    <button
                      key={d.name}
                      onClick={() => handleDistrictClick(d.name)}
                      className={`w-full p-3 rounded-lg border text-left flex justify-between items-center transition ${
                        selectedDistrict === d.name
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-medium text-gray-700">
                        {d.name}
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${ঝুঁকি_রঙ[d.flood_risk_level]}20`,
                          color: ঝুঁকি_রঙ[d.flood_risk_level],
                        }}
                      >
                        {d.flood_risk_level}
                      </span>
                    </button>
                  ))}
                  {filteredDistricts.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      কোন জেলা পাওয়া যায়নি
                    </p>
                  )}
                </div>
              </div>
            </div>

            {modelsStatus?.models_loaded && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-100">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  মডেল তথ্য
                </h3>
                <div className="space-y-2 text-sm">
                  {["XGBoost", "LSTM", "UNet"].map((m) => (
                    <div key={m} className="flex justify-between">
                      <span className="text-gray-600">{m}:</span>
                      <span className="text-green-600">✓ সক্রিয়</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className="text-gray-600">ফিচার সংখ্যা:</span>
                    <span>{modelsStatus.feature_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ডেটা সোর্স:</span>
                    <span className="text-blue-600">NASA POWER</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-green-100">
              <div className="h-[500px] rounded-xl overflow-hidden relative z-0">
                <MapContainer
                  key={`${mapCenter[0]}-${mapCenter[1]}`}
                  center={mapCenter}
                  zoom={zoomLevel}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <GeoJSON
                    data={বাংলাদেশ_সীমানা}
                    style={{ color: "#0ea5e9", weight: 2, fillOpacity: 0.1 }}
                  />
                  {Leaflet &&
                    allDistricts.map((d) => (
                      <Marker
                        key={d.name}
                        position={[d.latitude, d.longitude]}
                        icon={ঝুঁকি_আইকন[d.flood_risk_level]}
                        eventHandlers={{
                          click: () => handleDistrictClick(d.name),
                        }}
                      >
                        <Popup>
                          <div className="text-center min-w-[150px]">
                            <strong className="block text-lg mb-1">
                              {d.name}
                            </strong>
                            <span
                              className="inline-block px-2 py-1 rounded-full text-white text-xs mb-2"
                              style={{
                                backgroundColor: ঝুঁকি_রঙ[d.flood_risk_level],
                              }}
                            >
                              {d.flood_risk_level} ঝুঁকি
                            </span>
                            <p className="text-xs text-gray-500 mt-2">
                              ঝুঁকি স্কোর: {d.flood_risk_score}%
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  {aiResult && Leaflet && (
                    <Marker
                      position={[
                        aiResult.location.latitude,
                        aiResult.location.longitude,
                      ]}
                      icon={Leaflet.icon({
                        iconUrl:
                          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                      })}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong className="block">আপনার অবস্থান</strong>
                          <span className="text-sm text-gray-600">
                            {aiResult.location.district}
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        {/* AI Result Card */}
        {aiResult && (
          <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
            <div
              className="p-4"
              style={{ backgroundColor: `${aiResult.advice.color}10` }}
            >
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {aiResult.location.district}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {aiResult.location.division} বিভাগ
                  </p>
                </div>
                <RiskBadge level={aiResult.prediction.risk_level} />
              </div>
            </div>

            <div className="p-6">
              {/* Risk Score */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    ঝুঁকি স্কোর
                  </span>
                  <span className="text-2xl font-bold">
                    {aiResult.prediction.risk_score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="rounded-full h-3 transition-all duration-500"
                    style={{
                      width: `${aiResult.prediction.risk_score}%`,
                      backgroundColor: aiResult.advice.color,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-gray-600 text-sm flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    নির্ভুলতা: {aiResult.prediction.confidence.toFixed(1)}%
                  </span>
                  <ConfidenceMeter
                    confidence={aiResult.prediction.confidence}
                  />
                </div>
              </div>

              {/* Weather Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  icon={<CloudRain className="text-blue-500" />}
                  label="৭ দিনের বৃষ্টিপাত"
                  value={`${aiResult.weather_data.rainfall_mm.toFixed(1)} mm`}
                  sub={`৩ দিন: ${(aiResult.weather_data.rainfall_3_days || 0).toFixed(1)} mm`}
                />
                <StatCard
                  icon={<Waves className="text-cyan-500" />}
                  label="নদীর স্তর"
                  value={`${aiResult.weather_data.river_level_m.toFixed(2)} m`}
                  sub="স্বাভাবিক: 3-5m"
                />
                <StatCard
                  icon={<Sun className="text-orange-500" />}
                  label="তাপমাত্রা"
                  value={`${aiResult.weather_data.temperature_c} °C`}
                />
                <StatCard
                  icon={<Wind className="text-green-500" />}
                  label="আর্দ্রতা"
                  value={`${aiResult.weather_data.humidity_percent.toFixed(1)}%`}
                />
              </div>

              {/* Detailed Scores */}
              {aiResult.prediction.detailed_scores && (
                <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">জোন স্কোর</p>
                    <p className="font-bold text-lg">
                      {aiResult.prediction.detailed_scores.zone_score}
                    </p>
                    <p className="text-xs text-gray-400">ভৌগলিক অবস্থান</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">নদী সন্নিধি</p>
                    <p className="font-bold text-lg">
                      {aiResult.prediction.detailed_scores.river_score}
                    </p>
                    <p className="text-xs text-gray-400">নদীর নৈকট্য</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">বৃষ্টিপাত স্কোর</p>
                    <p className="font-bold text-lg">
                      {aiResult.prediction.detailed_scores.rain_score}
                    </p>
                    <p className="text-xs text-gray-400">গত ৭ দিনের বৃষ্টি</p>
                  </div>
                </div>
              )}

              {/* Model Scores */}
              {aiResult.prediction.model_scores && (
                <div className="mb-6 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    🤖 মডেলের পূর্বাভাস:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(
                      [
                        ["XGBoost", aiResult.prediction.model_scores.xgb_score],
                        ["LSTM", aiResult.prediction.model_scores.lstm_score],
                        ["UNet", aiResult.prediction.model_scores.unet_score],
                        [
                          "এনসেম্বল",
                          aiResult.prediction.model_scores.ensemble_score,
                        ],
                      ] as [string, number][]
                    ).map(([label, score]) => (
                      <div key={label} className="flex justify-between">
                        <span>{label}:</span>
                        <span className="font-medium">
                          {Math.round(score || 0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advice */}
              <div
                className="p-4 rounded-lg mb-6"
                style={{ backgroundColor: `${aiResult.advice.color}15` }}
              >
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {aiResult.advice.title}
                </h4>
                <p className="text-gray-700">{aiResult.advice.message}</p>
              </div>

              {/* Recommendations */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    জরুরি করণীয়
                  </h4>
                  <ul className="space-y-2">
                    {aiResult.recommendations.immediate.map((action, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-600 flex gap-2"
                      >
                        <span className="text-orange-500">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    প্রস্তুতিমূলক ব্যবস্থা
                  </h4>
                  <ul className="space-y-2">
                    {aiResult.recommendations.preparation.map((action, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-600 flex gap-2"
                      >
                        <span className="text-green-500">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {aiResult.cache_info && (
                <div className="mt-4 text-xs text-gray-400 text-center border-t pt-3">
                  📡 ডেটা সোর্স: NASA POWER API |{" "}
                  {aiResult.cache_info === "cached"
                    ? "📦 ক্যাশ থেকে"
                    : "🔄 লাইভ"}
                  <br />
                  ⏱️ শেষ আপডেট:{" "}
                  {new Date(aiResult.timestamp).toLocaleString("bn-BD")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: any) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold text-gray-800 text-lg">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
