"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Layers,
  Filter,
  Download,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CloudRain,
  Droplets,
} from "lucide-react";
import { Legend } from "recharts";

const বাংলাদেশের_জেলাসমূহ = [
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
  const [selectedDistrict, setSelectedDistrict] = useState("সিরাজগঞ্জ");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [layer, setLayer] = useState("ঝুঁকি_মানচিত্র");
  const [timeFilter, setTimeFilter] = useState("আগামী_৭_দিন");

  const ঝুঁকি_রঙ = {
    নিম্ন: "bg-emerald-500",
    মধ্যম: "bg-amber-500",
    উচ্চ: "bg-orange-500",
    "অতি উচ্চ": "bg-red-600",
  };

  const ঝুঁকি_বর্ডার = {
    নিম্ন: "border-emerald-200",
    মধ্যম: "border-amber-200",
    উচ্চ: "border-orange-200",
    "অতি উচ্চ": "border-red-200",
  };

  const নির্বাচিত_জেলা = বাংলাদেশের_জেলাসমূহ.find(
    (d) => d.name === selectedDistrict
  );

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
                    {["আজ", "আগামী_৩_দিন", "আগামী_৭_দিন", "এই_মাস"].map(
                      (time) => (
                        <button
                          key={time}
                          onClick={() => setTimeFilter(time)}
                          className={`px-4 py-2 rounded-lg border-2 ${
                            timeFilter === time
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-green-200 text-green-700"
                          }`}
                        >
                          {time.replace(/_/g, " ")}
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
                      {
                        id: "ফসল_ক্ষতি",
                        label: "ফসল ক্ষতি পূর্বাভাস",
                        icon: Layers,
                      },
                    ].map((layerItem) => (
                      <button
                        key={layerItem.id}
                        onClick={() => setLayer(layerItem.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${
                          layer === layerItem.id
                            ? "border-green-500 bg-green-50"
                            : "border-green-200"
                        }`}
                      >
                        <layerItem.icon className="h-5 w-5 text-green-600" />
                        <span className="text-green-800">
                          {layerItem.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* জুম কন্ট্রোল */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-green-700">
                      জুম স্তর
                    </span>
                    <span className="font-bold text-green-900">
                      {zoomLevel}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                      className="p-2 bg-white border-2 border-green-200 rounded-lg hover:bg-green-50"
                    >
                      <ZoomOut className="h-5 w-5 text-green-600" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                        className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600"
                      />
                    </div>
                    <button
                      onClick={() =>
                        setZoomLevel(Math.min(200, zoomLevel + 10))
                      }
                      className="p-2 bg-white border-2 border-green-200 rounded-lg hover:bg-green-50"
                    >
                      <ZoomIn className="h-5 w-5 text-green-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* নির্বাচিত জেলা তথ্য */}
            {নির্বাচিত_জেলা && (
              <div className="bangladeshi-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 ${
                      ঝুঁকি_রঙ[নির্বাচিত_জেলা.risk as keyof typeof ঝুঁকি_রঙ]
                    } rounded-lg`}
                  >
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 text-lg">
                      {নির্বাচিত_জেলা.name}
                    </h3>
                    <p
                      className={`text-sm font-medium ${
                        নির্বাচিত_জেলা.risk === "অতি উচ্চ"
                          ? "text-red-700"
                          : নির্বাচিত_জেলা.risk === "উচ্চ"
                          ? "text-orange-700"
                          : নির্বাচিত_জেলা.risk === "মধ্যম"
                          ? "text-amber-700"
                          : "text-emerald-700"
                      }`}
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
                <Legend className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-green-900">ঝুঁকি নির্দেশিকা</h3>
              </div>
              <div className="space-y-2">
                {[
                  {
                    level: "নিম্ন",
                    color: "bg-emerald-500",
                    desc: "স্বাভাবিক অবস্থা",
                  },
                  {
                    level: "মধ্যম",
                    color: "bg-amber-500",
                    desc: "সতর্কতা প্রয়োজন",
                  },
                  {
                    level: "উচ্চ",
                    color: "bg-orange-500",
                    desc: "জরুরি ব্যবস্থা প্রয়োজন",
                  },
                  {
                    level: "অতি উচ্চ",
                    color: "bg-red-600",
                    desc: "তাৎক্ষণিক ব্যবস্থা প্রয়োজন",
                  },
                ].map((item) => (
                  <div key={item.level} className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${item.color} rounded`}></div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-green-800">
                        {item.level}
                      </span>
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

              {/* মানচিত্র কন্টেইনার */}
              <div className="relative bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl border-4 border-green-300 h-[600px] overflow-hidden">
                {/* সিমুলেটেড মানচিত্র */}
                <div className="absolute inset-0 water-wave opacity-20"></div>

                {/* বাংলাদেশের আউটলাইন */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 border-2 border-green-500 rounded-3xl"></div>

                {/* নদীসমূহ */}
                <div className="absolute top-1/4 left-1/4 w-1/2 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-60"></div>
                <div className="absolute top-2/3 left-1/3 w-1/3 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-60"></div>

                {/* জেলা পয়েন্টস */}
                {বাংলাদেশের_জেলাসমূহ.map((জেলা, index) => {
                  // জেলার অবস্থান সিমুলেট করা
                  const top = 20 + Math.random() * 60;
                  const left = 20 + Math.random() * 60;

                  return (
                    <button
                      key={জেলা.name}
                      onClick={() => setSelectedDistrict(জেলা.name)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                        selectedDistrict === জেলা.name ? "z-10" : "z-0"
                      }`}
                    >
                      <div className="relative">
                        <div
                          className={`absolute inset-0 ${
                            ঝুঁকি_রঙ[জেলা.risk as keyof typeof ঝুঁকি_রঙ]
                          } rounded-full blur opacity-30 ${
                            selectedDistrict === জেলা.name ? "animate-ping" : ""
                          }`}
                        ></div>
                        <div
                          className={`relative w-8 h-8 ${
                            ঝুঁকি_রঙ[জেলা.risk as keyof typeof ঝুঁকি_রঙ]
                          } rounded-full border-4 ${
                            ঝুঁকি_বর্ডার[জেলা.risk as keyof typeof ঝুঁকি_বর্ডার]
                          } flex items-center justify-center`}
                        >
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        {selectedDistrict === জেলা.name && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-lg border border-green-200 whitespace-nowrap">
                            <span className="text-sm font-medium text-green-900">
                              {জেলা.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* বৃষ্টিপাত অ্যানিমেশন */}
                {layer === "বৃষ্টিপাত" && (
                  <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-8 bg-gradient-to-b from-blue-400 to-transparent opacity-40 animate-bounce"
                        style={{
                          left: `${10 + Math.random() * 80}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>

              {/* মানচিত্র কন্ট্রোল */}
              <div className="flex flex-wrap gap-4 mt-6">
                <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>মানচিত্র ডাউনলোড</span>
                </button>
                <button className="px-4 py-2 bg-white border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-50">
                  প্রিন্ট করুন
                </button>
                <button className="px-4 py-2 bg-white border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-50">
                  শেয়ার করুন
                </button>
                <button className="px-4 py-2 bg-white border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-50">
                  সম্পূর্ণ স্ক্রিন
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
                      className={`p-3 rounded-lg border-2 ${
                        selectedDistrict === জেলা.name
                          ? "border-green-500 bg-green-50"
                          : "border-green-200"
                      } hover:bg-green-50 transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-green-800 font-medium">
                          {জেলা.name}
                        </span>
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
    </div>
  );
}
