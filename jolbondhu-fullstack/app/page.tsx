"use client";

import { useEffect, useState } from "react";
import {
  CloudRain,
  Shield,
  Leaf,
  AlertTriangle,
  Phone,
  MessageSquare,
  Download,
  Share2,
  Bell,
  Clock,
  Users,
  BarChart3,
  MapPin,
  Loader2,
  RefreshCw,
} from "lucide-react";
import LocationSelector from "@/components/LocationSelector";
import RiskCard from "@/components/RiskCard";
import WeatherCard from "@/components/WeatherCard";
import AdvisoryCard from "@/components/AdvisoryCard";
import CropSelector from "@/components/CropSelector";
import AIFeatures from "./components/AIFeatures";

// Function to get location name from coordinates using reverse geocoding
const getLocationName = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=ae2f97df1a45e8f8eb5d0be9feeeffb1`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      // Try to get district/city name
      return data[0]?.name || "অজানা অবস্থান";
    }
    return "অজানা অবস্থান";
  } catch (error) {
    return "অজানা অবস্থান";
  }
};

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
    district?: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState<{
    lat: number;
    lon: number;
    district: string;
  } | null>(null);

  // Get user's real location
  useEffect(() => {
    const getRealLocation = async () => {
      setLocationLoading(true);
      setLocationError(null);

      // Check if geolocation is available
      if (!navigator.geolocation) {
        setLocationError("ব্রাউজারটি অবস্থান সেবা সমর্থন করে না");
        setDefaultLocation();
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            });
          }
        );

        // Get location name from coordinates
        const locationName = await getLocationName(
          position.coords.latitude,
          position.coords.longitude
        );

        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          district: locationName,
        });
      } catch (error) {
        // Try to get location from IP as fallback
        try {
          const ipResponse = await fetch("https://ipapi.co/json/");
          const ipData = await ipResponse.json();

          if (ipData && ipData.latitude && ipData.longitude) {
            const locationName = await getLocationName(
              ipData.latitude,
              ipData.longitude
            );

            setUserLocation({
              lat: ipData.latitude,
              lon: ipData.longitude,
              district:
                locationName || ipData.city || ipData.region || "অজানা অবস্থান",
            });
            setLocationError(
              "GPS অবস্থান পাওয়া যায়নি। আইপি অবস্থান ব্যবহার করা হচ্ছে।"
            );
          } else {
            throw new Error("IP location not available");
          }
        } catch (ipError) {
          // Final fallback to Dhaka
          setLocationError(
            "আপনার অবস্থান শনাক্ত করা যায়নি। ঢাকার জন্য পূর্বাভাস দেখানো হচ্ছে।"
          );
          setDefaultLocation();
        }
      } finally {
        setLocationLoading(false);
      }
    };

    const setDefaultLocation = () => {
      setUserLocation({
        lat: 23.8103,
        lon: 90.4125,
        district: "ঢাকা, বাংলাদেশ",
      });
    };

    getRealLocation();
  }, []);

  // Handle location selection from LocationSelector
  const handleLocationSelect = async (location: {
    lat: number;
    lon: number;
    district: string;
  }) => {
    setManualLocation(location);
    setUserLocation({
      lat: location.lat,
      lon: location.lon,
      district: location.district,
    });
  };

  // Refresh location
  const refreshLocation = async () => {
    setManualLocation(null);
    setUserLocation(null);
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("ব্রাউজারটি অবস্থান সেবা সমর্থন করে না");
      setDefaultFallback();
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        }
      );

      // Get location name from coordinates
      const locationName = await getLocationName(
        position.coords.latitude,
        position.coords.longitude
      );

      setUserLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        district: locationName,
      });
    } catch (error) {
      setLocationError("অবস্থান রিফ্রেশ করতে সমস্যা হয়েছে");
      setDefaultFallback();
    } finally {
      setLocationLoading(false);
    }
  };

  const setDefaultFallback = () => {
    // Fallback to Dhaka
    setUserLocation({
      lat: 23.8103,
      lon: 90.4125,
      district: "ঢাকা, বাংলাদেশ",
    });
  };

  return (
    <div className="space-y-6 py-4">
      {/* হিরো সেকশন */}
      <section className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 opacity-90"></div>
        <div className="absolute inset-0 rice-field-bg"></div>

        <div className="relative px-4 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white">
                <Shield className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {locationLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      অবস্থান শনাক্ত করা হচ্ছে...
                    </span>
                  ) : userLocation?.district ? (
                    `আপনার অবস্থান: ${userLocation.district}`
                  ) : (
                    "বাংলাদেশের কৃষকের বিশ্বস্ত সঙ্গী"
                  )}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                <span className="block">ফসল রক্ষায়</span>
                <span className="block text-yellow-300">
                  রিয়েল-টাইম বন্যা পূর্বাভাস
                </span>
              </h1>

              <p className="text-base text-white/90">
                জলবন্ধু আপনার ফসল ও গবাদিপশুকে বন্যার হাত থেকে রক্ষা করতে
                রিয়েল-টাইম পূর্বাভাস ও ব্যবহারিক পরামর্শ প্রদান করে।
                {locationError && (
                  <span className="block text-yellow-300 text-xs mt-1.5">
                    {locationError}
                  </span>
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="farmer-button flex items-center justify-center gap-2 py-3 px-6 text-sm">
                  <CloudRain className="h-5 w-5" />
                  <span className="font-semibold">
                    {locationLoading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        প্রস্তুত হচ্ছে...
                      </span>
                    ) : (
                      "বিনামূল্যে শুরু করুন"
                    )}
                  </span>
                </button>
                <button
                  onClick={refreshLocation}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/30 hover:bg-white/30 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>অবস্থান রিফ্রেশ</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white">
                    <Bell className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">
                      অন্যান্য এলাকার সতর্কতা
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      area: "সিরাজগঞ্জ সদর",
                      risk: "উচ্চ",
                      time: "২ ঘন্টা আগে",
                    },
                    { area: "বেলকুচি", risk: "অতি উচ্চ", time: "১ ঘন্টা আগে" },
                    { area: "কামারখন্দ", risk: "মধ্যম", time: "৩ ঘন্টা আগে" },
                    { area: "রায়গঞ্জ", risk: "নিম্ন", time: "৪ ঘন্টা আগে" },
                  ].map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        alert.risk === "অতি উচ্চ"
                          ? "bg-red-500/20"
                          : alert.risk === "উচ্চ"
                          ? "bg-orange-500/20"
                          : "bg-yellow-500/20"
                      } backdrop-blur-sm`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              alert.risk === "অতি উচ্চ"
                                ? "text-red-300"
                                : alert.risk === "উচ্চ"
                                ? "text-orange-300"
                                : "text-yellow-300"
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {alert.area}
                            </p>
                            <p className="text-xs text-white/80">
                              {alert.time}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            alert.risk === "অতি উচ্চ"
                              ? "bg-red-500 text-white"
                              : alert.risk === "উচ্চ"
                              ? "bg-orange-500 text-white"
                              : "bg-yellow-500 text-white"
                          }`}
                        >
                          {alert.risk} ঝুঁকি
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="text-center text-white/70 text-xs pt-1">
                    <p>
                      এগুলি অন্যান্য এলাকার সতর্কতা। আপনার এলাকার ঝুঁকি উপরে
                      দেখানো হয়েছে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* রিয়েল-টাইম বন্যা ঝুঁকি বিশ্লেষণ - Now at the top of left column */}
          <section>
            {locationLoading ? (
              <div className="bangladeshi-card p-6 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-3" />
                <p className="text-green-800 text-sm">
                  আপনার অবস্থান শনাক্ত করা হচ্ছে...
                </p>
                <p className="text-xs text-green-600 mt-1">
                  আপনার সঠিক অবস্থান ব্যবহার করে বন্যা ঝুঁকি বিশ্লেষণ করা হচ্ছে
                </p>
              </div>
            ) : userLocation ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    {manualLocation
                      ? "নির্বাচিত অবস্থানের বন্যা ঝুঁকি"
                      : "আপনার অবস্থানের বন্যা ঝুঁকি বিশ্লেষণ"}
                    {userLocation.district && (
                      <span className="text-base font-normal text-green-700">
                        ({userLocation.district})
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshLocation}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center gap-1.5 text-xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      অবস্থান রিফ্রেশ
                    </button>
                  </div>
                </div>
                <RiskCard
                  latitude={userLocation.lat}
                  longitude={userLocation.lon}
                />
                {manualLocation && (
                  <div className="text-center text-green-600 text-xs mt-2">
                    <p>
                      আপনি ম্যানুয়ালি অবস্থান নির্বাচন করেছেন। GPS অবস্থান ফিরে
                      পেতে উপরের "অবস্থান রিফ্রেশ" বাটনে ক্লিক করুন।
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </section>

          {/* দ্রুত তথ্য সেকশন - Moved to left column */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 text-center border border-green-200">
              <div className="inline-flex p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mb-2">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-xl font-bold text-green-900">২৫,০০০+</div>
              <div className="text-green-700 text-xs">কৃষক সংযুক্ত</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-4 text-center border border-blue-200">
              <div className="inline-flex p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg mb-2">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="text-xl font-bold text-blue-900">৯৫%</div>
              <div className="text-blue-700 text-xs">নির্ভুল পূর্বাভাস</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-4 text-center border border-amber-200">
              <div className="inline-flex p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg mb-2">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-xl font-bold text-amber-900">২৪/৭</div>
              <div className="text-amber-700 text-xs">মনিটরিং সক্রিয়</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-4 text-center border border-emerald-200">
              <div className="inline-flex p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mb-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-xl font-bold text-emerald-900">৮৫%</div>
              <div className="text-emerald-700 text-xs">ক্ষতি হ্রাস</div>
            </div>
          </section>

          {/* Advisory Card */}
          <AdvisoryCard />

          {/* AI Features */}
          <div className="mt-6">
            <AIFeatures userLocation={userLocation} />
          </div>

          {/* কৃষকগণের সাক্ষাৎকার */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-900 mb-1">
                    কৃষকদের মতামত
                  </h3>
                  <p className="text-amber-800 italic text-sm">
                    "জলবন্ধুর রিয়েল-টাইম পূর্বাভাসের কারণে আমার ৫ বিঘা ধান
                    রক্ষা পেয়েছে। সময়মতো ফসল তুলতে পেরে ৭০,০০০ টাকা ক্ষতি থেকে
                    রক্ষা পেয়েছি।"
                  </p>
                  <p className="text-amber-700 font-medium mt-2 text-xs">
                    - মোঃ রফিকুল ইসলাম, সিরাজগঞ্জ
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-blue-900 mb-1">
                    জরুরি সাহায্য
                  </h3>
                  <p className="text-blue-800 text-sm">
                    বন্যার সময় জরুরি সাহায্যের জন্য যোগাযোগ করুন:
                  </p>
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded">
                      <span className="text-blue-700 text-xs">
                        কৃষি সম্প্রসারণ
                      </span>
                      <span className="font-bold text-blue-900 text-xs">
                        ১৬১২৩
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded">
                      <span className="text-blue-700 text-xs">
                        দুর্যোগ ব্যবস্থাপনা
                      </span>
                      <span className="font-bold text-blue-900 text-xs">
                        ১০৯০
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-4">
          <LocationSelector onLocationSelect={handleLocationSelect} />
          <WeatherCard location={userLocation} />
          <CropSelector />
        </div>
      </div>

      {/* কীভাবে কাজ করে - Full width section */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
        <h2 className="text-xl md:text-2xl font-bold text-green-900 text-center mb-1">
          জলবন্ধু কিভাবে কাজ করে?
        </h2>
        <p className="text-green-700 text-center mb-6 text-sm">
          তিনটি সহজ ধাপে পান নির্ভুল বন্যা পূর্বাভাস
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              number: "১",
              icon: MapPin,
              title: "স্বয়ংক্রিয় অবস্থান",
              desc: "আপনার জিপিএস অবস্থান স্বয়ংক্রিয়ভাবে শনাক্ত হয়",
              color: "from-green-500 to-emerald-600",
            },
            {
              number: "২",
              icon: CloudRain,
              title: "রিয়েল-টাইম ডেটা",
              desc: "আবহাওয়া, নদী ও মাটির ডেটা বিশ্লেষণ করা হয়",
              color: "from-emerald-500 to-teal-600",
            },
            {
              number: "৩",
              icon: Shield,
              title: "ব্যক্তিগতকৃত পরামর্শ",
              desc: "আপনার অবস্থান ভিত্তিক সঠিক পরামর্শ পান",
              color: "from-teal-500 to-cyan-600",
            },
          ].map((step) => (
            <div key={step.number} className="relative">
              <div
                className={`absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br ${step.color} text-white rounded-xl flex items-center justify-center text-lg font-bold z-10`}
              >
                {step.number}
              </div>
              <div className="bg-white rounded-xl p-4 pt-8 border-2 border-green-200 h-full">
                <div
                  className={`inline-flex p-2 bg-gradient-to-br ${step.color} rounded-lg mb-3`}
                >
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-green-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-green-700 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* সিএনটি - Full width section */}
      <section className="text-center py-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white mb-4">
          <Shield className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">আপনার ফসল সুরক্ষিত করুন</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-3">
          {userLocation?.district
            ? `${userLocation.district}-এর জন্য সঠিক পূর্বাভাস`
            : "আজই শুরু করুন বিনামূল্যে"}
        </h2>

        <p className="text-green-700 max-w-2xl mx-auto mb-6 text-sm">
          জলবন্ধু আপনার সঠিক অবস্থান ব্যবহার করে রিয়েল-টাইম বন্যা ঝুঁকি
          বিশ্লেষণ প্রদান করে। বাংলাদেশের লক্ষাধিক কৃষকের বিশ্বস্ত সঙ্গী।
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button className="farmer-button flex items-center justify-center gap-2 py-3 px-6">
            <CloudRain className="h-5 w-5" />
            <span className="font-semibold">বিনামূল্যে রেজিস্টার করুন</span>
          </button>

          <div className="flex gap-2">
            <button className="p-3 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
              <Download className="h-4 w-4 text-green-600" />
            </button>
            <button className="p-3 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
              <Share2 className="h-4 w-4 text-green-600" />
            </button>
            <button className="p-3 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
              <Bell className="h-4 w-4 text-green-600" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
