"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import {
  MapPin,
  Layers,
  Filter,
  Download,
  CloudRain,
  Droplets,
  Thermometer,
  Droplet,
  Calendar,
  Navigation,
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
  }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
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

interface AIResponse {
  status: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    district: string;
    division: string;
    flood_risk_factor: number;
  };
  weather_data: {
    rainfall_mm: number;
    river_level_m: number;
    humidity_percent: number;
    temperature_c: number;
  };
  prediction: {
    risk_level: RiskLevel;
    risk_score: number;
    confidence: number;
    probabilities: {
      low: number;
      medium: number;
      high: number;
      very_high: number;
    };
  };
  advice: { title: string; message: string; actions: string[]; color: string };
  recommendations: { immediate: string[]; preparation: string[] };
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

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const ঝুঁকি_রঙ: Record<RiskLevel, string> = {
    নিম্ন: "#10b981",
    মধ্যম: "#f59e0b",
    উচ্চ: "#f97316",
    "অতি উচ্চ": "#dc2626",
  };

  // 1. Initialize Leaflet properly
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // Fix marker icons
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

  // 2. Load District Data
  useEffect(() => {
    (async () => {
      try {
        setApiError("");
        const res = await fetch(`${API_BASE}/alldistricts`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();

        if (data.status === "success") {
          setAllDistricts(data.districts);
          // Default selection (don't auto-fetch AI to save requests, just set district)
          if (data.districts?.length > 0) {
            setSelectedDistrict(data.districts[0].name);
          }
        }
      } catch (e: any) {
        console.error("District Fetch Error:", e);
        setApiError(
          "সার্ভার থেকে ডেটা লোড করা যাচ্ছে না। (Check Backend Console)"
        );
      }
    })();
  }, []);

  // In frontend code
  const fetchAiPrediction = async (
    districtName: string,
    lat: number,
    lon: number
  ) => {
    setIsLoading(true);
    setApiError("");
    try {
      // Change to POST request
      const url = `${API_BASE}/predicting`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          district: districtName,
          lat: lat,
          lon: lon,
        }),
      });

      if (!res.ok) throw new Error(`Prediction Failed: ${res.status}`);

      const data = await res.json();

      if (data.status === "success") {
        setAiResult(data);
        setZoomLevel(12);
      }
    } catch (e: any) {
      console.error(e);
      setApiError(`API ত্রুটি: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistrictClick = async (districtName: string) => {
    const d = allDistricts.find((x) => x.name === districtName);
    if (!d) return;
    setSelectedDistrict(districtName);
    await fetchAiPrediction(d.name, d.latitude, d.longitude);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return alert("ব্রাউজার জিপিএস সমর্থন করে না।");

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        if (!allDistricts.length) {
          setIsLoading(false);
          return alert("জেলার তথ্য লোড হয়নি।");
        }

        // Find nearest district
        let nearest = allDistricts[0];
        let best = Infinity;
        for (const d of allDistricts) {
          const dist =
            (d.latitude - latitude) ** 2 + (d.longitude - longitude) ** 2;
          if (dist < best) {
            best = dist;
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
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Define Map Center dynamically
  const mapCenter: [number, number] = aiResult
    ? [aiResult.location.latitude, aiResult.location.longitude]
    : [23.8103, 90.4125]; // Default Dhaka

  // GeoJSON Data
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

  // Custom Icons Memo
  const ঝুঁকি_আইকন = useMemo(() => {
    if (!Leaflet) return {} as any;
    const createIcon = (color: string, text: string) => {
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
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
        ম্যাপ প্রস্তুত হচ্ছে...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* 3. Force Load Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div className="container mx-auto px-4 py-8">
        {apiError && (
          <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
            {apiError}
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
                    AI এবং রিয়েল-টাইম ডেটা
                  </p>
                </div>
              </div>

              <button
                onClick={handleUseCurrentLocation}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin">⌛</span>
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
                {isLoading ? "যাচাই করা হচ্ছে..." : "আমার লোকেশন চেক করুন"}
              </button>

              {/* Districts List */}
              <div className="mt-6 max-h-[400px] overflow-y-auto">
                <h3 className="font-semibold text-gray-700 mb-3">
                  জেলা নির্বাচন করুন:
                </h3>
                <div className="space-y-2">
                  {allDistricts.map((d) => (
                    <button
                      key={d.name}
                      onClick={() => handleDistrictClick(d.name)}
                      className={`w-full p-3 rounded-lg border text-left flex justify-between items-center transition
                        ${
                          selectedDistrict === d.name
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <span className="font-medium text-gray-700">
                        {d.name}
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded bg-gray-100"
                        style={{ color: ঝুঁকি_রঙ[d.flood_risk_level] }}
                      >
                        {d.flood_risk_level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-green-100 h-full">
              <div className="h-[600px] rounded-xl overflow-hidden relative z-0">
                {/* 4. KEY PROP IS CRITICAL HERE */}
                <MapContainer
                  key={`${mapCenter[0]}-${mapCenter[1]}`} // Forces re-render when center changes
                  center={mapCenter}
                  zoom={zoomLevel}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <GeoJSON
                    data={বাংলাদেশ_সীমানা}
                    style={{ color: "#0ea5e9", weight: 2, fillOpacity: 0.1 }}
                  />

                  {/* Render District Markers */}
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
                          <div className="text-center">
                            <strong className="block text-lg mb-1">
                              {d.name}
                            </strong>
                            <span
                              style={{ color: ঝুঁকি_রঙ[d.flood_risk_level] }}
                            >
                              {d.flood_risk_level} ঝুঁকি
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                  {/* Special Marker for Selected Location */}
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
                      <Popup>আপনার বর্তমান অবস্থান</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        {/* AI Result Card */}
        {aiResult && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-blue-100 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              ফলাফল: {aiResult.location.district} (
              {aiResult.prediction.risk_level} ঝুঁকি)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<CloudRain className="text-blue-500" />}
                label="বৃষ্টিপাত"
                value={`${aiResult.weather_data.rainfall_mm} mm`}
              />
              <StatCard
                icon={<Droplets className="text-cyan-500" />}
                label="নদীর স্তর"
                value={`${aiResult.weather_data.river_level_m} m`}
              />
              <StatCard
                icon={<Thermometer className="text-orange-500" />}
                label="তাপমাত্রা"
                value={`${aiResult.weather_data.temperature_c} °C`}
              />
              <StatCard
                icon={<Droplet className="text-green-500" />}
                label="আর্দ্রতা"
                value={`${aiResult.weather_data.humidity_percent}%`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Component for Stats
function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
