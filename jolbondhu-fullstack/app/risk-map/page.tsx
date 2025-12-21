"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Layers,
  Filter,
  Download,
  AlertTriangle,
  CloudRain,
  Droplets,
  Thermometer,
  Droplet,
  Wind,
  Calendar,
  ShieldAlert,
  Navigation,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { Feature, FeatureCollection, Polygon } from "geojson";

// React Leaflet components dynamically imported (to avoid SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] bg-gray-100 animate-pulse rounded-xl"></div>
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

// Types
type RiskLevel = "নিম্ন" | "মধ্যম" | "উচ্চ" | "অতি উচ্চ";

interface District {
  name: string;
  risk: RiskLevel;
  lat: number;
  lon: number;
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
  advice: {
    title: string;
    message: string;
    actions: string[];
    color: string;
  };
  recommendations: {
    immediate: string[];
    preparation: string[];
  };
}

interface DistrictInfo {
  name: string;
  division: string;
  latitude: number;
  longitude: number;
  flood_risk_level: RiskLevel;
  flood_risk_score: number;
}

const বাংলাদেশের_জেলাসমূহ: District[] = [
  { name: "সিরাজগঞ্জ", risk: "উচ্চ", lat: 24.4539, lon: 89.7083 },
  { name: "কুড়িগ্রাম", risk: "অতি উচ্চ", lat: 25.8054, lon: 89.6362 },
  { name: "গাইবান্ধা", risk: "উচ্চ", lat: 25.3287, lon: 89.5281 },
  { name: "বগুড়া", risk: "মধ্যম", lat: 24.8465, lon: 89.3773 },
  { name: "জামালপুর", risk: "উচ্চ", lat: 24.9375, lon: 89.9373 },
  { name: "সুনামগঞ্জ", risk: "অতি উচ্চ", lat: 25.0659, lon: 91.395 },
  { name: "সিলেট", risk: "উচ্চ", lat: 24.8918, lon: 91.883 },
  { name: "নেত্রকোণা", risk: "মধ্যম", lat: 24.8859, lon: 90.729 },
  { name: "কিশোরগঞ্জ", risk: "উচ্চ", lat: 24.4448, lon: 90.7826 },
  { name: "মুন্সীগঞ্জ", risk: "নিম্ন", lat: 23.5483, lon: 90.525 },
  { name: "শরীয়তপুর", risk: "নিম্ন", lat: 23.2064, lon: 90.3478 },
  { name: "রংপুর", risk: "মধ্যম", lat: 25.7439, lon: 89.2752 },
  { name: "নীলফামারী", risk: "মধ্যম", lat: 25.9667, lon: 88.95 },
  { name: "লালমনিরহাট", risk: "উচ্চ", lat: 25.9167, lon: 89.45 },
  { name: "দিনাজপুর", risk: "নিম্ন", lat: 25.6217, lon: 88.6354 },
  { name: "ঠাকুরগাঁও", risk: "নিম্ন", lat: 26.0333, lon: 88.4667 },
  { name: "টাঙ্গাইল", risk: "মধ্যম", lat: 24.2641, lon: 89.918 },
  { name: "ময়মনসিংহ", risk: "উচ্চ", lat: 24.7471, lon: 90.4203 },
  { name: "শেরপুর", risk: "মধ্যম", lat: 25.0205, lon: 90.0179 },
  { name: "নরসিংদী", risk: "নিম্ন", lat: 23.9321, lon: 90.715 },
  { name: "নারায়ণগঞ্জ", risk: "নিম্ন", lat: 23.6238, lon: 90.5 },
];

export default function RiskMapPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("সিরাজগঞ্জ");
  const [zoomLevel, setZoomLevel] = useState<number>(7);
  const [layer, setLayer] = useState<string>("ঝুঁকি_মানচিত্র");
  const [timeFilter, setTimeFilter] = useState<string>("আগামী ৭ দিন");
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState<boolean>(false);
  const [Leaflet, setLeaflet] = useState<any>(null);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [allDistricts, setAllDistricts] = useState<DistrictInfo[]>([]);
  const [userCoordinates, setUserCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const ঝুঁকি_রঙ: Record<RiskLevel, string> = {
    নিম্ন: "#10b981",
    মধ্যম: "#f59e0b",
    উচ্চ: "#f97316",
    "অতি উচ্চ": "#dc2626",
  };

  // Fetch all districts on component mount
  useEffect(() => {
    fetchAllDistricts();
  }, []);

  const fetchAllDistricts = async () => {
    setIsLoadingDistricts(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/districts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          setAllDistricts(data.districts);
        }
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("আপনার ব্রাউজারটি জিপিএস সমর্থন করে না।");
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoordinates({ lat: latitude, lon: longitude });
        await fetchAiPrediction(latitude, longitude);
      },
      (error) => {
        setIsLoading(false);
        alert("লোকেশন পাওয়া যায়নি। অনুগ্রহ করে পারমিশন চেক করুন।");
      }
    );
  };

  const handleDistrictClick = async (districtName: string) => {
    setSelectedDistrict(districtName);
    setIsLoading(true);

    // Find district coordinates
    const district = বাংলাদেশের_জেলাসমূহ.find((d) => d.name === districtName);
    if (district) {
      await fetchAiPrediction(district.lat, district.lon);
    }
  };

  const fetchAiPrediction = async (lat: number, lon: number) => {
    setIsLoading(true);
    try {
      console.log(`🌍 Fetching prediction for lat: ${lat}, lon: ${lon}`);

      const response = await fetch(
        `http://127.0.0.1:8000/predict?lat=${lat}&lon=${lon}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 API Response:", data);

      if (data.status === "success") {
        setAiResult(data);
        // Zoom to the location
        setZoomLevel(10);
      } else {
        // Fallback if API returns error
        setAiResult({
          status: "success",
          timestamp: new Date().toISOString(),
          location: {
            latitude: lat,
            longitude: lon,
            district: "অজানা",
            division: "অজানা",
            flood_risk_factor: 0.5,
          },
          weather_data: {
            rainfall_mm: 0,
            river_level_m: 0,
            humidity_percent: 0,
            temperature_c: 0,
          },
          prediction: {
            risk_level: "মধ্যম",
            risk_score: 1,
            confidence: 0.5,
            probabilities: {
              low: 0.25,
              medium: 0.5,
              high: 0.15,
              very_high: 0.1,
            },
          },
          advice: {
            title: "তথ্য পাওয়া যায়নি",
            message:
              "ডেটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
            actions: ["আবার চেষ্টা করুন", "ইন্টারনেট সংযোগ চেক করুন"],
            color: "yellow",
          },
          recommendations: {
            immediate: ["সাধারণ সতর্কতা বজায় রাখুন"],
            preparation: ["নিয়মিত আবহাওয়ার রিপোর্ট চেক করুন"],
          },
        });
      }
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
      setAiResult({
        status: "success",
        timestamp: new Date().toISOString(),
        location: {
          latitude: lat,
          longitude: lon,
          district: "সিরাজগঞ্জ",
          division: "রাজশাহী",
          flood_risk_factor: 0.8,
        },
        weather_data: {
          rainfall_mm: 450.25,
          river_level_m: 8.75,
          humidity_percent: 85.5,
          temperature_c: 31.2,
        },
        prediction: {
          risk_level: "উচ্চ",
          risk_score: 2,
          confidence: 0.85,
          probabilities: {
            low: 0.1,
            medium: 0.25,
            high: 0.45,
            very_high: 0.2,
          },
        },
        advice: {
          title: "সংযোগ সমস্যা",
          message: "সার্ভার সংযোগ করতে সমস্যা হচ্ছে। ডেমো ডেটা দেখানো হচ্ছে।",
          actions: ["ইন্টারনেট চেক করুন", "পুনরায় চেষ্টা করুন"],
          color: "orange",
        },
        recommendations: {
          immediate: [
            "বৃষ্টির জল নিষ্কাশনের ব্যবস্থা চেক করুন",
            "গবাদি পশু নিরাপদ স্থানে রাখুন",
          ],
          preparation: [
            "জরুরি প্রস্তুতির পরিকল্পনা তৈরি করুন",
            "স্থানীয় আশ্রয় কেন্দ্রের অবস্থান জানুন",
          ],
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Bangladesh boundary GeoJSON type
  interface BangladeshBoundary extends FeatureCollection {
    features: Feature<Polygon>[];
  }

  const বাংলাদেশ_সীমানা: BangladeshBoundary = {
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

  const দেশ_সীমানা_স্টাইল = {
    fillColor: "#f0f9ff",
    weight: 2,
    opacity: 1,
    color: "#0ea5e9",
    fillOpacity: 0.1,
  };

  // Leaflet dynamic load
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
          iconUrl: "/leaflet/images/marker-icon.png",
          shadowUrl: "/leaflet/images/marker-shadow.png",
        });
        setLeaflet(L);
        setMapReady(true);
      });
    }
  }, []);

  const ঝুঁকি_আইকন = useMemo(() => {
    if (!Leaflet) return {};

    const createCustomIcon = (color: string, text: string) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="${color}" stroke="white" stroke-width="3"/>
        <path fill="white" d="M24 14a8 8 0 0 1 8 8c0 4.418-7.635 13.247-7.635 13.247S16 26.418 16 22a8 8 0 0 1 8-8zm0 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
        <circle cx="34" cy="14" r="6" fill="white" stroke="${color}" stroke-width="2"/>
        <text x="34" y="17" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">${text}</text>
      </svg>`;

      return Leaflet.icon({
        iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });
    };

    return {
      নিম্ন: createCustomIcon("#10b981", "ন"),
      মধ্যম: createCustomIcon("#f59e0b", "ম"),
      উচ্চ: createCustomIcon("#f97316", "উ"),
      "অতি উচ্চ": createCustomIcon("#dc2626", "!!"),
    };
  }, [Leaflet]);

  const নির্বাচিত_জেলা = বাংলাদেশের_জেলাসমূহ.find(
    (d) => d.name === selectedDistrict
  );

  if (!mapReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700">মানচিত্র লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRiskColor = (risk: RiskLevel) => {
    return ঝুঁকি_রঙ[risk];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Controls and Information */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-green-900">
                    বন্যা ঝুঁকি মানচিত্র
                  </h1>
                  <p className="text-green-700">
                    বাংলাদেশের বন্যা প্রবণ এলাকার রিয়েল-টাইম মানচিত্র
                  </p>
                </div>
              </div>

              {/* Current Location Button */}
              <div className="mb-6">
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg flex items-center justify-center gap-2 hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Navigation className="h-5 w-5" />
                  )}
                  {isLoading
                    ? "লোকেশন শনাক্ত করা হচ্ছে..."
                    : "আমার বর্তমান লোকেশন চেক করুন"}
                </button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  আপনার বর্তমান অবস্থানের ঝুঁকি বিশ্লেষণ পেতে বাটনটি ক্লিক করুন
                </p>
              </div>

              {/* Filter Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    <Filter className="inline h-4 w-4 mr-2" />
                    সময় ফিল্টার
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["আজ", "আগামী ৩ দিন", "আগামী ৭ দিন", "এই মাস"].map(
                      (time) => (
                        <button
                          key={time}
                          onClick={() => setTimeFilter(time)}
                          className={`px-4 py-2 rounded-lg border-2 ${
                            timeFilter === time
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-green-200 text-green-700 hover:border-green-300"
                          } transition-colors`}
                        >
                          {time}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    <Layers className="inline h-4 w-4 mr-2" />
                    মানচিত্র স্তর
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        id: "ঝুঁকি_মানচিত্র",
                        label: "ঝুঁকি মানচিত্র",
                        icon: AlertTriangle,
                      },
                      { id: "বৃষ্টিপাত", label: "বৃষ্টিপাত", icon: CloudRain },
                      {
                        id: "নদী_স্তর",
                        label: "নদীর পানি স্তর",
                        icon: Droplets,
                      },
                    ].map((layerItem) => (
                      <button
                        key={layerItem.id}
                        onClick={() => setLayer(layerItem.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                          layer === layerItem.id
                            ? "border-green-500 bg-green-50"
                            : "border-green-200 hover:border-green-300"
                        }`}
                      >
                        <layerItem.icon
                          className={`h-5 w-5 ${
                            layer === layerItem.id
                              ? "text-green-600"
                              : "text-green-500"
                          }`}
                        />
                        <span
                          className={`${
                            layer === layerItem.id
                              ? "text-green-900 font-medium"
                              : "text-green-700"
                          }`}
                        >
                          {layerItem.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected District Information */}
            {নির্বাচিত_জেলা && !aiResult && (
              <div className="bangladeshi-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: ঝুঁকি_রঙ[নির্বাচিত_জেলা.risk],
                    }}
                  >
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 text-lg">
                      {নির্বাচিত_জেলা.name}
                    </h3>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: ঝুঁকি_রঙ[নির্বাচিত_জেলা.risk],
                      }}
                    >
                      {নির্বাচিত_জেলা.risk} ঝুঁকি
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDistrictClick(নির্বাচিত_জেলা.name)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  <ShieldAlert className="h-5 w-5" />
                  <span>বিস্তারিত বিশ্লেষণ দেখুন</span>
                </button>
              </div>
            )}

            {/* Legend */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Layers className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-green-900">ঝুঁকি নির্দেশিকা</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(ঝুঁকি_রঙ).map(([level, color]) => {
                  const descriptions: Record<RiskLevel, string> = {
                    নিম্ন: "স্বাভাবিক অবস্থা",
                    মধ্যম: "সতর্কতা প্রয়োজন",
                    উচ্চ: "জরুরি ব্যবস্থা প্রয়োজন",
                    "অতি উচ্চ": "তাৎক্ষণিক ব্যবস্থা প্রয়োজন",
                  };

                  return (
                    <div key={level} className="flex items-start gap-3">
                      <div
                        className="w-4 h-4 rounded mt-1"
                        style={{ backgroundColor: color }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-800">
                            {level}
                          </span>
                        </div>
                        <p className="text-xs text-green-600">
                          {descriptions[level as RiskLevel]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="lg:w-2/3">
            <div className="bangladeshi-card p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-green-900">
                    বাংলাদেশ বন্যা ঝুঁকি মানচিত্র
                  </h2>
                  <p className="text-green-700">
                    রিয়েল-টাইম ডেটা ভিত্তিক ঝুঁকি বিশ্লেষণ
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>লাইভ আপডেট চলছে</span>
                </div>
              </div>

              {/* Leaflet Map */}
              <div className="relative rounded-2xl border-2 border-green-300 overflow-hidden h-[600px]">
                <MapContainer
                  center={
                    aiResult
                      ? [
                          aiResult.location.latitude,
                          aiResult.location.longitude,
                        ]
                      : [23.685, 90.3563]
                  }
                  zoom={zoomLevel}
                  style={{ height: "100%", width: "100%" }}
                  className="rounded-xl"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <GeoJSON data={বাংলাদেশ_সীমানা} style={দেশ_সীমানা_স্টাইল} />

                  {Leaflet &&
                    বাংলাদেশের_জেলাসমূহ.map((জেলা) => (
                      <Marker
                        key={জেলা.name}
                        position={[জেলা.lat, জেলা.lon]}
                        icon={ঝুঁকি_আইকন[জেলা.risk as RiskLevel]}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-lg text-green-900 mb-2">
                              {জেলা.name}
                            </h3>
                            <div
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                                জেলা.risk === "অতি উচ্চ"
                                  ? "bg-red-100 text-red-800"
                                  : জেলা.risk === "উচ্চ"
                                  ? "bg-orange-100 text-orange-800"
                                  : জেলা.risk === "মধ্যম"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {জেলা.risk} ঝুঁকি
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              অবস্থান: {জেলা.lat.toFixed(4)},{" "}
                              {জেলা.lon.toFixed(4)}
                            </p>
                            <button
                              className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              onClick={() => handleDistrictClick(জেলা.name)}
                            >
                              বিস্তারিত বিশ্লেষণ
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                  {/* User location marker */}
                  {aiResult && (
                    <Marker
                      position={[
                        aiResult.location.latitude,
                        aiResult.location.longitude,
                      ]}
                      icon={
                        Leaflet &&
                        Leaflet.icon({
                          iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="20" fill="#3b82f6" stroke="white" stroke-width="3"/>
                            <circle cx="24" cy="24" r="8" fill="white"/>
                            <path fill="white" d="M24 10a2 2 0 0 1 2 2v12a2 2 0 0 1-4 0V12a2 2 0 0 1 2-2z"/>
                          </svg>
                        `)}`,
                          iconSize: [40, 40],
                          iconAnchor: [20, 40],
                          popupAnchor: [0, -40],
                        })
                      }
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-blue-900">
                            আপনার অবস্থান
                          </h3>
                          <p className="text-sm text-gray-600">
                            {aiResult.location.district},{" "}
                            {aiResult.location.division}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(14, z + 1))}
                    className="p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50"
                  >
                    <span className="text-lg font-bold text-gray-700">+</span>
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(6, z - 1))}
                    className="p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50"
                  >
                    <span className="text-lg font-bold text-gray-700">-</span>
                  </button>
                </div>
              </div>

              {/* Map Controls */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg flex items-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all">
                  <Download className="h-4 w-4" />
                  <span>মানচিত্র ডাউনলোড</span>
                </button>
                <button
                  onClick={() => setZoomLevel(7)}
                  className="px-4 py-2 bg-white border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  পুরো বাংলাদেশ দেখুন
                </button>
                {aiResult && (
                  <button
                    onClick={() => setZoomLevel(10)}
                    className="px-4 py-2 bg-white border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    বিশ্লেষিত অবস্থানে যান
                  </button>
                )}
              </div>

              {/* Districts List */}
              <div className="mt-8">
                <h3 className="font-bold text-green-900 mb-4">
                  জেলাভিত্তিক ঝুঁকি তালিকা
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {বাংলাদেশের_জেলাসমূহ.slice(0, 9).map((জেলা) => (
                    <button
                      key={জেলা.name}
                      onClick={() => handleDistrictClick(জেলা.name)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedDistrict === জেলা.name
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-green-200 hover:border-green-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: ঝুঁকি_রঙ[জেলা.risk] }}
                          ></div>
                          <span className="text-green-800 font-medium">
                            {জেলা.name}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            জেলা.risk === "অতি উচ্চ"
                              ? "bg-red-100 text-red-800"
                              : জেলা.risk === "উচ্চ"
                              ? "bg-orange-100 text-orange-800"
                              : জেলা.risk === "মধ্যম"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {জেলা.risk}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Result Display */}
        {aiResult && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bangladeshi-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-green-900">
                    AI বিশ্লেষণ রিপোর্ট
                  </h3>
                  <p className="text-green-700 text-sm">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    {formatDate(aiResult.timestamp)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">
                    Live from JolBondhu AI
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    আস্থার হার:{" "}
                    {(aiResult.prediction.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {/* Location and Risk Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                      <div className="p-3 bg-white rounded-lg shadow">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">শনাক্তকৃত এলাকা</p>
                        <h4 className="text-lg font-bold text-blue-900">
                          {aiResult.location.district},{" "}
                          {aiResult.location.division}
                        </h4>
                        <p className="text-sm text-gray-600">
                          অবস্থান: {aiResult.location.latitude.toFixed(4)},{" "}
                          {aiResult.location.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${getRiskColor(
                        aiResult.prediction.risk_level
                      )}15`,
                      border: `2px solid ${getRiskColor(
                        aiResult.prediction.risk_level
                      )}`,
                    }}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle
                          className="h-6 w-6"
                          style={{
                            color: getRiskColor(aiResult.prediction.risk_level),
                          }}
                        />
                        <span
                          className="text-lg font-bold"
                          style={{
                            color: getRiskColor(aiResult.prediction.risk_level),
                          }}
                        >
                          {aiResult.prediction.risk_level} ঝুঁকি
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        ঝুঁকি স্কোর: {aiResult.prediction.risk_score}/3
                      </p>
                    </div>
                  </div>
                </div>

                {/* Weather Data */}
                <div>
                  <h4 className="font-bold text-green-900 mb-3">
                    আবহাওয়া তথ্য
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CloudRain className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-blue-600">বৃষ্টিপাত</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900">
                        {aiResult.weather_data.rainfall_mm.toFixed(1)} mm
                      </p>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="h-4 w-4 text-cyan-600" />
                        <span className="text-xs text-cyan-600">নদী স্তর</span>
                      </div>
                      <p className="text-lg font-bold text-cyan-900">
                        {aiResult.weather_data.river_level_m.toFixed(2)} m
                      </p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="h-4 w-4 text-amber-600" />
                        <span className="text-xs text-amber-600">
                          তাপমাত্রা
                        </span>
                      </div>
                      <p className="text-lg font-bold text-amber-900">
                        {aiResult.weather_data.temperature_c.toFixed(1)} °C
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplet className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs text-emerald-600">
                          আর্দ্রতা
                        </span>
                      </div>
                      <p className="text-lg font-bold text-emerald-900">
                        {aiResult.weather_data.humidity_percent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Probability Distribution */}
                <div>
                  <h4 className="font-bold text-green-900 mb-3">
                    ঝুঁকি সম্ভাব্যতা
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(aiResult.prediction.probabilities).map(
                      ([level, probability]) => {
                        const banglaLevels: Record<string, RiskLevel> = {
                          low: "নিম্ন",
                          medium: "মধ্যম",
                          high: "উচ্চ",
                          very_high: "অতি উচ্চ",
                        };
                        const levelName = banglaLevels[level] || level;
                        return (
                          <div key={level} className="flex items-center gap-3">
                            <span className="text-sm text-gray-700 w-20">
                              {levelName}:
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${probability * 100}%`,
                                  backgroundColor: getRiskColor(
                                    levelName as RiskLevel
                                  ),
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 w-12">
                              {(probability * 100).toFixed(1)}%
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* AI Advice */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-dashed border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900">
                        {aiResult.advice.title}
                      </h4>
                      <p className="text-sm text-blue-700">
                        {aiResult.advice.message}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-green-900 mb-2">
                      তাৎক্ষণিক পদক্ষেপ:
                    </h5>
                    <ul className="space-y-2">
                      {aiResult.advice.actions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <span className="text-sm text-gray-700">
                            {action}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-green-900 mb-2">
                      প্রস্তুতিমূলক ব্যবস্থা:
                    </h5>
                    <ul className="space-y-2">
                      {aiResult.recommendations.preparation.map(
                        (action, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                            <span className="text-sm text-gray-700">
                              {action}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg flex items-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg">
                    <Download className="h-5 w-5" />
                    <span>রিপোর্ট ডাউনলোড</span>
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg">
                    <MapPin className="h-5 w-5" />
                    <span>নিকটস্থ আশ্রয়কেন্দ্র দেখুন</span>
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg flex items-center gap-2 hover:from-orange-600 hover:to-red-700 transition-all shadow-lg">
                    <ShieldAlert className="h-5 w-5" />
                    <span>SMS সতর্কতা নিন</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaflet CSS */}
      <style jsx global>{`
        @import url("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");

        .leaflet-container {
          width: 100%;
          height: 100%;
          font-family: "Hind Siliguri", sans-serif;
          z-index: 1;
        }

        .leaflet-control-attribution {
          font-size: 10px;
        }

        .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
