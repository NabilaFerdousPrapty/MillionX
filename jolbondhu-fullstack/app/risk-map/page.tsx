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
} from "lucide-react";
import dynamic from "next/dynamic";

// React Leaflet কম্পোনেন্টগুলো ডাইনামিকভাবে ইমপোর্ট করুন (SSR এড়ানোর জন্য)
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
interface District {
  name: string;
  risk: "নিম্ন" | "মধ্যম" | "উচ্চ" | "অতি উচ্চ";
  lat: number;
  lon: number;
}

interface RainfallData {
  current: number;
  hourly: number;
  forecast: number;
  temperature: number;
  humidity: number;
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
  const [rainfallData, setRainfallData] = useState<RainfallData | null>(null);
  const [Leaflet, setLeaflet] = useState<any>(null);

  const ঝুঁকি_রঙ = {
    নিম্ন: "#10b981",
    মধ্যম: "#f59e0b",
    উচ্চ: "#f97316",
    "অতি উচ্চ": "#dc2626",
  };

  // Leaflet dynamic load
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // Fix Leaflet marker icons
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
          iconUrl: "/leaflet/images/marker-icon.png",
          shadowUrl: "/leaflet/images/marker-shadow.png",
        });
        setLeaflet(L.default);
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

  // বাংলাদেশের জিওজেসন ডেটা
  const বাংলাদেশ_সীমানা = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: { name: "বাংলাদেশ" },
        geometry: {
          type: "Polygon" as const,
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

  // বাংলাদেশ সীমানা স্টাইল
  const দেশ_সীমানা_স্টাইল = {
    fillColor: "#f0f9ff",
    weight: 2,
    opacity: 1,
    color: "#0ea5e9",
    fillOpacity: 0.1,
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* বাম প্যানেল - কন্ট্রোল এবং তথ্য */}
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

              {/* ফিল্টার অপশন */}
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

            {/* নির্বাচিত জেলা তথ্য */}
            {নির্বাচিত_জেলা && (
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

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600">অবস্থান</p>
                      <p className="font-mono text-sm text-blue-800">
                        {নির্বাচিত_জেলা.lat.toFixed(4)},{" "}
                        {নির্বাচিত_জেলা.lon.toFixed(4)}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-600">সর্বশেষ আপডেট</p>
                      <p className="font-medium text-emerald-800">
                        ২ ঘন্টা আগে
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      🚨 জরুরি সতর্কতা
                    </p>
                    <p className="text-xs text-amber-700">
                      এই জেলায় আগামী ৪৮ ঘন্টার মধ্যে বন্যার উচ্চ ঝুঁকি রয়েছে।
                      ফসল রক্ষার জন্য অবিলম্বে ব্যবস্থা নিন।
                    </p>
                  </div>

                  <button className="w-full farmer-button flex items-center justify-center gap-2 py-3">
                    <Download className="h-5 w-5" />
                    <span>বিস্তারিত রিপোর্ট ডাউনলোড</span>
                  </button>
                </div>
              </div>
            )}

            {/* লিজেন্ড */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Layers className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-green-900">ঝুঁকি নির্দেশিকা</h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    level: "নিম্ন" as const,
                    color: "bg-emerald-500",
                    desc: "স্বাভাবিক অবস্থা",
                  },
                  {
                    level: "মধ্যম" as const,
                    color: "bg-amber-500",
                    desc: "সতর্কতা প্রয়োজন",
                  },
                  {
                    level: "উচ্চ" as const,
                    color: "bg-orange-500",
                    desc: "জরুরি ব্যবস্থা প্রয়োজন",
                  },
                  {
                    level: "অতি উচ্চ" as const,
                    color: "bg-red-600",
                    desc: "তাৎক্ষণিক ব্যবস্থা প্রয়োজন",
                  },
                ].map((item) => (
                  <div key={item.level} className="flex items-start gap-3">
                    <div className={`w-4 h-4 ${item.color} rounded mt-1`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">
                          {item.level}
                        </span>
                      </div>
                      <p className="text-xs text-green-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ডান প্যানেল - মানচিত্র */}
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

              {/* Leaflet মানচিত্র */}
              <div className="relative rounded-2xl border-2 border-green-300 overflow-hidden h-[600px]">
                <MapContainer
                  center={[23.685, 90.3563]}
                  zoom={zoomLevel}
                  style={{ height: "100%", width: "100%" }}
                  className="rounded-xl"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <GeoJSON
                    data={বাংলাদেশ_সীমানা as any}
                    style={দেশ_সীমানা_স্টাইল}
                  />

                  {Leaflet &&
                    বাংলাদেশের_জেলাসমূহ.map((জেলা) => (
                      <Marker
                        key={জেলা.name}
                        position={[জেলা.lat, জেলা.lon]}
                        icon={ঝুঁকি_আইকন[জেলা.risk]}
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
                              onClick={() => setSelectedDistrict(জেলা.name)}
                            >
                              বিস্তারিত দেখুন
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>

                {/* Zoom কন্ট্রোল */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(6, z - 1))}
                    className="p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50"
                  >
                    <span className="text-lg font-bold text-gray-700">+</span>
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(14, z + 1))}
                    className="p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50"
                  >
                    <span className="text-lg font-bold text-gray-700">-</span>
                  </button>
                </div>
              </div>

              {/* মানচিত্র কন্ট্রোল */}
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
                <button
                  onClick={() => {
                    if (নির্বাচিত_জেলা) {
                      setZoomLevel(10);
                    }
                  }}
                  className="px-4 py-2 bg-white border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  নির্বাচিত জেলায় যান
                </button>
              </div>

              {/* জেলাসমূহের লিস্ট */}
              <div className="mt-8">
                <h3 className="font-bold text-green-900 mb-4">
                  জেলাভিত্তিক ঝুঁকি তালিকা
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {বাংলাদেশের_জেলাসমূহ.slice(0, 9).map((জেলা) => (
                    <button
                      key={জেলা.name}
                      onClick={() => setSelectedDistrict(জেলা.name)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedDistrict === জেলা.name
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-green-200 hover:border-green-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full`}
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
