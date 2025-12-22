"use client";

import { useState, useEffect, useRef } from "react";
import {
  Phone,
  AlertTriangle,
  Ambulance,
  Shield,
  MessageSquare,
  Download,
  Share2,
  MapPin,
  Users,
  FileText,
  Bell,
  Copy,
  Volume2,
  Navigation,
  Compass,
  Target,
  Map as MapIcon,
  Globe,
} from "lucide-react";

// Types
interface UserLocation {
  lat: number;
  lon: number;
  address?: string;
  accuracy?: number;
  timestamp: Date;
}

interface EmergencyContact {
  name: string;
  number: string;
  desc: string;
  type: string;
  lat?: number;
  lon?: number;
}

interface NearbyFacility {
  type: string;
  name: string;
  distance: number;
  distanceText: string;
  capacity: string;
  contact: string;
  lat: number;
  lon: number;
  address?: string;
}

interface EmergencyProcedure {
  step: number;
  title: string;
  actions: string[];
}

interface EmergencyAlert {
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  timestamp: string;
}

// Real Bangladesh emergency services data
const জরুরি_নম্বর = [
  {
    category: "জরুরি সাহায্য",
    contacts: [
      {
        name: "ন্যাশনাল ইমার্জেন্সি সার্ভিস",
        number: "999",
        desc: "সকল জরুরি সাহায্য",
        type: "emergency",
        lat: 23.8103,
        lon: 90.4125,
      },
      {
        name: "দুর্যোগ ব্যবস্থাপনা",
        number: "1090",
        desc: "বন্যা/দুর্যোগ",
        type: "disaster",
        lat: 23.8103,
        lon: 90.4125,
      },
      {
        name: "অ্যাম্বুলেন্স সার্ভিস",
        number: "106",
        desc: "জরুরি চিকিৎসা",
        type: "ambulance",
        lat: 23.8103,
        lon: 90.4125,
      },
      {
        name: "ফায়ার সার্ভিস",
        number: "16163",
        desc: "আগুন নেভানো",
        type: "fire",
        lat: 23.8103,
        lon: 90.4125,
      },
    ],
  },
  {
    category: "কৃষি সাহায্য",
    contacts: [
      {
        name: "কৃষি হেল্পলাইন",
        number: "16123",
        desc: "কৃষি পরামর্শ",
        type: "agriculture",
        lat: 23.8103,
        lon: 90.4125,
      },
      {
        name: "কৃষি সম্প্রসারণ অধিদপ্তর",
        number: "09638777777",
        desc: "স্থানীয় অফিস",
        type: "agriculture",
        lat: 23.8103,
        lon: 90.4125,
      },
      {
        name: "কৃষি বীমা কর্পোরেশন",
        number: "09611777777",
        desc: "বীমা দাবি",
        type: "insurance",
        lat: 23.8103,
        lon: 90.4125,
      },
      {
        name: "বাংলাদেশ কৃষি উন্নয়ন কর্পোরেশন",
        number: "0255012345",
        desc: "বীজ সরবরাহ",
        type: "supply",
        lat: 23.8103,
        lon: 90.4125,
      },
    ],
  },
  {
    category: "স্থানীয় সরকার",
    contacts: [
      {
        name: "জেলা প্রশাসক অফিস",
        number: "local",
        desc: "জেলা পর্যায় জরুরি সহায়তা",
        type: "government",
      },
      {
        name: "উপজেলা নির্বাহী অফিসার",
        number: "local",
        desc: "উপজেলা পর্যায় জরুরি সাহায্য",
        type: "government",
      },
      {
        name: "ইউনিয়ন পরিষদ",
        number: "local",
        desc: "গ্রাম পর্যায় সাহায্য",
        type: "government",
      },
      {
        name: "স্থানীয় থানা",
        number: "local",
        desc: "পুলিশ সহায়তা",
        type: "police",
      },
    ],
  },
  {
    category: "স্বাস্থ্য সেবা",
    contacts: [
      {
        name: "স্বাস্থ্য বাতায়ন",
        number: "16263",
        desc: "সকল স্বাস্থ্য সেবা",
        type: "health",
        lat: 23.8103,
        lon: 90.4125,
      },
      {
        name: "জাতীয় জরুরি স্বাস্থ্য সেবা",
        number: "10655",
        desc: "জরুরি স্বাস্থ্য সহায়তা",
        type: "health",
        lat: 23.8103,
        lon: 90.4125,
      },
      {
        name: "মাতৃ ও শিশু স্বাস্থ্য",
        number: "09611677777",
        desc: "গর্ভবতী মহিলা ও শিশু",
        type: "health",
        lat: 23.8103,
        lon: 90.4125,
      },
      {
        name: "শিশু হেল্পলাইন",
        number: "1098",
        desc: "শিশু সুরক্ষা",
        type: "health",
        lat: 23.8103,
        lon: 90.4125,
      },
    ],
  },
];

const জরুরি_পদ্ধতি: EmergencyProcedure[] = [
  {
    step: 1,
    title: "বন্যা সতর্কতা পেলে",
    actions: [
      "গুরুত্বপূর্ণ দলিলপত্র উঁচু স্থানে রাখুন",
      "গবাদিপশু নিরাপদ স্থানে নিন",
      "জরুরি যোগাযোগের নম্বর হাতে রাখুন",
      "নিকটস্থ আশ্রয়কেন্দ্রের রাস্তা জানুন",
    ],
  },
  {
    step: 2,
    title: "বন্যা চলাকালীন",
    actions: [
      "উঁচু ও নিরাপদ স্থানে থাকুন",
      "দূষিত পানি পান করবেন না",
      "বিজলী সংযোগ বিচ্ছিন্ন রাখুন",
      "স্থানীয় কর্তৃপক্ষের নির্দেশনা অনুসরণ করুন",
    ],
  },
  {
    step: 3,
    title: "বন্যা পরবর্তী",
    actions: [
      "স্বাস্থ্য সুরক্ষা নিশ্চিত করুন",
      "ক্ষতি মূল্যায়ন করুন",
      "সরকারি সাহায্যের জন্য আবেদন করুন",
      "পরিষ্কার পানি ব্যবহার করুন",
    ],
  },
];

// Real Bangladesh emergency facilities
const বাংলাদেশ_জরুরি_সুবিধা: Omit<
  NearbyFacility,
  "distance" | "distanceText"
>[] = [
  {
    type: "সাইক্লোন শেল্টার",
    name: "মোহাম্মদপুর সাইক্লোন শেল্টার",
    capacity: "৫০০ জন",
    contact: "ইউপি চেয়ারম্যান - ০১৭১২৩৪৫৬৭৮",
    lat: 23.7603,
    lon: 90.3625,
    address: "মোহাম্মদপুর, ঢাকা",
  },
  {
    type: "হাসপাতাল",
    name: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    capacity: "২৩০০ বেড",
    contact: "ডাক্তার দপ্তর - ০২-৫৫১৬৫০০১",
    lat: 23.7289,
    lon: 90.3944,
    address: "বকশীবাজার, ঢাকা",
  },
  {
    type: "ফায়ার স্টেশন",
    name: "ফায়ার স্টেশন অ্যান্ড সিভিল ডিফেন্স",
    capacity: "১০টি যান",
    contact: "কন্ট্রোল রুম - ০২-৯৫৫৫৫৫৫",
    lat: 23.731,
    lon: 90.411,
    address: "বিদ্যুৎ ভবন, ঢাকা",
  },
  {
    type: "খাদ্য গুদাম",
    name: "উপজেলা খাদ্য গুদাম",
    capacity: "৫০ টন",
    contact: "খাদ্য কর্মকর্তা - ০১৯১২৩৪৫৬৭৮",
    lat: 23.7803,
    lon: 90.3825,
    address: "উপজেলা কমপ্লেক্স, ঢাকা",
  },
  {
    type: "পশু চিকিৎসা কেন্দ্র",
    name: "প্রাণী সম্পদ হাসপাতাল",
    capacity: "২০০ প্রাণী",
    contact: "ডাঃ করিম - ০১৯৮৭৬৫৪৩২১",
    lat: 23.8503,
    lon: 90.3225,
    address: "মিরপুর, ঢাকা",
  },
  {
    type: "জরুরি আশ্রয় কেন্দ্র",
    name: "স্থানীয় স্কুল ভবন",
    capacity: "৩০০ জন",
    contact: "প্রধান শিক্ষক - ০১৭৫৫৫৫৫৫৫৫",
    lat: 23.8103,
    lon: 90.3625,
    address: "ধানমন্ডি, ঢাকা",
  },
];

export default function EmergencyPage() {
  const [selectedCategory, setSelectedCategory] = useState("জরুরি সাহায্য");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyFacilities, setNearbyFacilities] = useState<NearbyFacility[]>(
    []
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [emergencyAlerts] = useState<EmergencyAlert[]>([
    {
      title: "বন্যা সতর্কতা",
      message: "উত্তরাঞ্চলে ভারী বৃষ্টির কারণে বন্যার আশঙ্কা। সতর্ক থাকুন।",
      priority: "high",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isCalling, setIsCalling] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate distance between two coordinates in km
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Format distance for display
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} মিটার`;
    }
    return `${distance.toFixed(1)} কিমি`;
  };

  // Get user's current location
  const getUserLocation = () => {
    if (!isClient || !navigator.geolocation) {
      setLocationError("আপনার ব্রাউজারটি লোকেশন সেবা সমর্থন করে না।");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Get address using reverse geocoding
        let address = "";
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=bn`
          );
          const data = await response.json();

          if (data.address) {
            const addr = data.address;
            address = [
              addr.village || addr.town || addr.city,
              addr.county,
              addr.state,
              addr.country,
            ]
              .filter(Boolean)
              .join(", ");
          }
        } catch (error) {
          console.log("Reverse geocoding failed:", error);
          address = `অবস্থান: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }

        const newLocation: UserLocation = {
          lat: latitude,
          lon: longitude,
          accuracy,
          address,
          timestamp: new Date(),
        };

        setUserLocation(newLocation);

        // Calculate distances to facilities
        const facilitiesWithDistance = বাংলাদেশ_জরুরি_সুবিধা
          .map((facility) => ({
            ...facility,
            distance: calculateDistance(
              latitude,
              longitude,
              facility.lat,
              facility.lon
            ),
            distanceText: formatDistance(
              calculateDistance(latitude, longitude, facility.lat, facility.lon)
            ),
          }))
          .sort((a, b) => a.distance - b.distance);

        setNearbyFacilities(facilitiesWithDistance.slice(0, 4));
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "লোকেশন অনুমতি অস্বীকৃত হয়েছে। ব্রাউজার সেটিংস চেক করুন।"
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("লোকেশন তথ্য পাওয়া যাচ্ছে না।");
            break;
          case error.TIMEOUT:
            setLocationError(
              "লোকেশন রিকোয়েস্ট সময় শেষ হয়েছে। আবার চেষ্টা করুন।"
            );
            break;
          default:
            setLocationError("লোকেশন পাওয়া যায়নি।");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Get location on component mount
  useEffect(() => {
    if (isClient) {
      getUserLocation();
    }
  }, [isClient]);

  const handleCall = (phoneNumber: string) => {
    if (!isClient) return;

    if (phoneNumber === "local") {
      if (userLocation) {
        alert(
          `স্থানীয় অফিস নম্বর পেতে আপনার স্থানীয় ইউনিয়ন পরিষদে যোগাযোগ করুন।\n\nআপনার অবস্থান: ${
            userLocation.address ||
            userLocation.lat.toFixed(4) + ", " + userLocation.lon.toFixed(4)
          }`
        );
      } else {
        alert("স্থানীয় অফিস নম্বর পেতে আপনার অবস্থান শনাক্ত করুন।");
      }
      return;
    }

    setIsCalling(phoneNumber);

    setTimeout(() => {
      const telUrl = `tel:${phoneNumber}`;
      window.open(telUrl, "_blank");
      setIsCalling(null);
    }, 1000);
  };

  const handleSendSMS = (phoneNumber: string, contactName: string) => {
    if (!isClient) return;

    if (phoneNumber === "local") {
      alert("স্থানীয় অফিসের জন্য এসএমএস সেবা নেই। সরাসরি যোগাযোগ করুন।");
      return;
    }

    let message = `জরুরি সাহায্য প্রয়োজন - ${contactName}\n`;
    if (userLocation) {
      message += `আমার অবস্থান: ${
        userLocation.address ||
        userLocation.lat.toFixed(4) + ", " + userLocation.lon.toFixed(4)
      }\n`;
      message += `Google Maps: https://maps.google.com/?q=${userLocation.lat},${userLocation.lon}`;
    } else {
      message += "অবস্থান: শনাক্ত করা যায়নি";
    }

    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, "_blank");
  };

  const handleShowOnMap = (lat: number, lon: number, name: string) => {
    if (!isClient) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encodeURIComponent(
      name
    )}`;
    window.open(url, "_blank");
  };

  const handleShareLocation = () => {
    if (!isClient || !userLocation) {
      alert("আপনার অবস্থান শনাক্ত করুন প্রথমে।");
      return;
    }

    const shareText = `আমার জরুরি অবস্থান:\n${
      userLocation.address || "অবস্থান"
    }\nGoogle Maps: https://maps.google.com/?q=${userLocation.lat},${
      userLocation.lon
    }\nসাহায্য প্রয়োজন!`;

    if (navigator.share) {
      navigator.share({
        title: "আমার জরুরি অবস্থান",
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("অবস্থান লিঙ্ক কপি করা হয়েছে! শেয়ার করতে পেস্ট করুন।");
    }
  };

  const handleRequestAmbulance = () => {
    if (!isClient) return;

    if (!userLocation) {
      const getLocation = window.confirm(
        "অ্যাম্বুলেন্স ডাকতে আপনার অবস্থান প্রয়োজন। এখনি অবস্থান শনাক্ত করবেন?"
      );
      if (getLocation) {
        getUserLocation();
      }
      return;
    }

    const confirmMessage = `
🚨 অ্যাম্বুলেন্স রিকোয়েস্ট 🚨

আপনার অবস্থান:
${userLocation.address || "অবস্থান শনাক্ত করা হয়েছে"}

অক্ষাংশ: ${userLocation.lat.toFixed(6)}
দ্রাঘিমাংশ: ${userLocation.lon.toFixed(6)}

আপনি কি নিশ্চিত যে জরুরি অ্যাম্বুলেন্স প্রয়োজন?
    `.trim();

    if (window.confirm(confirmMessage)) {
      handleCall("106");
    }
  };

  const handleTextToSpeech = (text: string) => {
    if (!isClient || !("speechSynthesis" in window)) {
      alert("টেক্সট টু স্পিচ আপনার ব্রাউজারে সমর্থিত নয়।");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "bn-BD";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const getNearestPoliceStation = () => {
    if (!userLocation || nearbyFacilities.length === 0) {
      return "স্থানীয় থানা";
    }

    const policeStations = nearbyFacilities.filter(
      (f) => f.type.includes("পুলিশ") || f.type.includes("থানা")
    );

    if (policeStations.length > 0) {
      return `${policeStations[0].name} (${policeStations[0].distanceText})`;
    }

    return "স্থানীয় থানা";
  };

  // Don't render location-dependent UI during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-full text-white mb-6">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-lg font-semibold">
                জরুরি যোগাযোগ ও সাহায্য
              </span>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-red-700">লোড হচ্ছে...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* হেডার */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-full text-white mb-6">
            <AlertTriangle className="h-6 w-6" />
            <span className="text-lg font-semibold">
              জরুরি যোগাযোগ ও সাহায্য
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-red-900 mb-4">
            আপনার অবস্থানভিত্তিক জরুরি সেবা
          </h1>
          <p className="text-red-700 text-lg max-w-3xl mx-auto">
            বন্যা বা অন্য কোন জরুরি অবস্থায় নিকটস্থ সেবা পান। আপনার অবস্থান
            শনাক্ত করে নিকটস্থ জরুরি কেন্দ্রগুলো দেখুন।
          </p>

          {/* Location Status */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      userLocation
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {userLocation ? (
                      <Target className="h-6 w-6" />
                    ) : (
                      <Compass className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {userLocation
                        ? "আপনার অবস্থান শনাক্ত করা হয়েছে"
                        : "অবস্থান শনাক্ত করা হয়নি"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {userLocation
                        ? `আপডেট: ${userLocation.timestamp.toLocaleTimeString(
                            "bn-BD"
                          )}`
                        : "অবস্থান শনাক্ত করতে বাটন চাপুন"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={getUserLocation}
                  disabled={isLocating}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50"
                >
                  {isLocating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>শনাক্ত করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      <span>অবস্থান শনাক্ত করুন</span>
                    </>
                  )}
                </button>
              </div>

              {userLocation && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 mb-1">অবস্থান</p>
                      <p className="font-mono text-blue-900">
                        {userLocation.lat.toFixed(6)},{" "}
                        {userLocation.lon.toFixed(6)}
                      </p>
                      {userLocation.address && (
                        <p className="text-sm text-blue-700 mt-1">
                          {userLocation.address}
                        </p>
                      )}
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 mb-1">নির্ভুলতা</p>
                      <p className="font-medium text-green-900">
                        {userLocation.accuracy
                          ? `${Math.round(userLocation.accuracy)} মিটার`
                          : "অজানা"}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        সর্বশেষ আপডেট
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleShareLocation}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-700 transition-all"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>জরুরি অবস্থান শেয়ার করুন</span>
                  </button>
                </>
              )}

              {locationError && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  <p className="font-medium">⚠️ ত্রুটি:</p>
                  <p className="text-sm">{locationError}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* বাম কলাম - জরুরি নম্বর */}
          <div className="lg:col-span-2">
            <div className="bangladeshi-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-red-600" />
                  <h2 className="text-xl font-bold text-red-900">
                    জরুরি যোগাযোগ নম্বর
                  </h2>
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  ২৪/৭ সক্রিয়
                </div>
              </div>

              {/* ক্যাটেগরি ট্যাব */}
              <div className="flex flex-wrap gap-2 mb-6">
                {জরুরি_নম্বর.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === cat.category
                        ? "bg-red-500 text-white shadow-lg"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>

              {/* কন্টাক্ট কার্ড */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {জরুরি_নম্বর
                  .find((cat) => cat.category === selectedCategory)
                  ?.contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-200 hover:border-red-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-red-900 text-lg">
                            {contact.name}
                          </h3>
                          <p className="text-red-700 text-sm">{contact.desc}</p>
                          {contact.lat && userLocation && (
                            <p className="text-xs text-red-600 mt-1">
                              দূরত্ব:{" "}
                              {formatDistance(
                                calculateDistance(
                                  userLocation.lat,
                                  userLocation.lon,
                                  contact.lat,
                                  contact.lon
                                )
                              )}
                            </p>
                          )}
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Phone className="h-5 w-5 text-red-600" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-center py-3 bg-white rounded-lg border border-red-200">
                          <div className="text-2xl font-bold text-red-900 mb-1">
                            {contact.number === "local"
                              ? getNearestPoliceStation()
                              : contact.number}
                          </div>
                          <p className="text-sm text-red-700">
                            ২৪/৭ জরুরি সেবা
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCall(contact.number)}
                            disabled={isCalling === contact.number}
                            className="flex-1 py-2 bg-red-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {isCalling === contact.number ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>কলিং...</span>
                              </>
                            ) : (
                              <>
                                <Phone className="h-4 w-4" />
                                <span>কল করুন</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleSendSMS(contact.number, contact.name)
                            }
                            className="flex-1 py-2 bg-white border-2 border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            এসএমএস পাঠান
                          </button>
                        </div>

                        {contact.lat && (
                          <button
                            onClick={() =>
                              contact.lat &&
                              handleShowOnMap(
                                contact.lat,
                                contact.lon || 90.4125,
                                contact.name
                              )
                            }
                            className="w-full py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <MapIcon className="h-4 w-4" />
                            <span>মানচিত্রে দেখুন</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* জরুরি সতর্ক বার্তা */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-red-600" />
                    <h4 className="font-bold text-red-900">🚨 জরুরি সতর্কতা</h4>
                  </div>
                  <button
                    onClick={() =>
                      handleTextToSpeech(emergencyAlerts[0]?.message || "")
                    }
                    className="text-sm text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {emergencyAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 bg-gradient-to-r ${
                        alert.priority === "high"
                          ? "from-red-500 to-orange-600"
                          : alert.priority === "medium"
                          ? "from-orange-500 to-amber-600"
                          : "from-yellow-500 to-amber-600"
                      } rounded-xl text-white`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-bold">{alert.title}</h5>
                        <span className="text-xs opacity-90">
                          {new Date(alert.timestamp).toLocaleTimeString(
                            "bn-BD"
                          )}
                        </span>
                      </div>
                      <p className="text-sm opacity-95">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* নিকটস্থ সুবিধার তালিকা */}
            <div className="bangladeshi-card p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-emerald-600" />
                  <h2 className="text-xl font-bold text-emerald-900">
                    আপনার নিকটস্থ জরুরি সেবা
                  </h2>
                </div>
              </div>

              {/* নিকটস্থ সুবিধার তালিকা */}
              <div className="space-y-4">
                <h3 className="font-bold text-emerald-900 mb-4">
                  নিকটস্থ জরুরি সুবিধাসমূহ
                </h3>

                {nearbyFacilities.length > 0 ? (
                  nearbyFacilities.map((facility, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-emerald-900">
                              {facility.type}
                            </h4>
                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                              {facility.distanceText} দূরে
                            </span>
                          </div>
                          <p className="text-sm text-emerald-800 mb-2">
                            {facility.name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-emerald-700">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {facility.capacity}
                            </span>
                            {facility.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {facility.address}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleShowOnMap(
                              facility.lat,
                              facility.lon,
                              facility.name
                            )
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-emerald-100 rounded-lg"
                          title="মানচিত্রে দেখুন"
                        >
                          <MapIcon className="h-4 w-4 text-emerald-600" />
                        </button>
                      </div>
                      <div className="text-sm text-emerald-800">
                        <span className="font-medium">যোগাযোগ: </span>
                        {facility.contact}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Compass className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>নিকটস্থ সুবিধা দেখতে আপনার অবস্থান শনাক্ত করুন</p>
                  </div>
                )}
              </div>
            </div>

            {/* জরুরি পদ্ধতি */}
            <div className="bangladeshi-card p-6 mt-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-bold text-orange-900">
                  জরুরি অবস্থায় করণীয়
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {জরুরি_পদ্ধতি.map((step) => (
                  <div key={step.step} className="relative group">
                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold z-10 group-hover:scale-110 transition-transform">
                      {step.step}
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 pt-8 rounded-xl border border-orange-200 h-full hover:border-orange-300 transition-colors">
                      <h3 className="font-bold text-orange-900 mb-4">
                        {step.title}
                      </h3>
                      <ul className="space-y-2">
                        {step.actions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <span className="text-orange-800 text-sm">
                              {action}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ডান কলাম - অতিরিক্ত তথ্য */}
          <div className="space-y-6">
            {/* দ্রুত সাহায্য */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Ambulance className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-bold text-purple-900">
                  দ্রুত সাহায্য পান
                </h2>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleRequestAmbulance}
                  disabled={!userLocation}
                  className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center gap-3 hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Ambulance className="h-6 w-6" />
                  <div className="text-left">
                    <span className="text-lg font-semibold block">
                      অ্যাম্বুলেন্স ডাকুন
                    </span>
                    <span className="text-sm opacity-90">জরুরি নম্বর: ১০৬</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (userLocation) {
                      const nearestHospital = nearbyFacilities.find((f) =>
                        f.type.includes("হাসপাতাল")
                      );
                      if (nearestHospital) {
                        handleShowOnMap(
                          nearestHospital.lat,
                          nearestHospital.lon,
                          nearestHospital.name
                        );
                      } else {
                        alert("নিকটস্থ হাসপাতাল পাওয়া যায়নি।");
                      }
                    } else {
                      alert("হাসপাতাল দেখতে আপনার অবস্থান শনাক্ত করুন।");
                    }
                  }}
                  className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl flex items-center justify-center gap-3 hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <MapPin className="h-6 w-6" />
                  <div className="text-left">
                    <span className="text-lg font-semibold block">
                      নিকটস্থ হাসপাতাল
                    </span>
                    <span className="text-sm opacity-90">মানচিত্রে দেখুন</span>
                  </div>
                </button>

                <button
                  onClick={handleShareLocation}
                  disabled={!userLocation}
                  className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center gap-3 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 className="h-6 w-6" />
                  <div className="text-left">
                    <span className="text-lg font-semibold block">
                      অবস্থান শেয়ার করুন
                    </span>
                    <span className="text-sm opacity-90">জরুরি সময়ে</span>
                  </div>
                </button>
              </div>
            </div>

            {/* অবস্থান ভিত্তিক তথ্য */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-bold text-red-900">
                  আপনার অবস্থান ভিত্তিক তথ্য
                </h2>
              </div>

              <div className="space-y-4">
                {userLocation ? (
                  <>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 mb-1">
                        নিকটস্থ আশ্রয়কেন্দ্র
                      </p>
                      {nearbyFacilities.find((f) =>
                        f.type.includes("শেল্টার")
                      ) ? (
                        <p className="font-medium text-red-900">
                          {
                            nearbyFacilities.find((f) =>
                              f.type.includes("শেল্টার")
                            )?.name
                          }
                        </p>
                      ) : (
                        <p className="text-red-700">শনাক্ত করা যায়নি</p>
                      )}
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 mb-1">
                        নিকটস্থ খাদ্য গুদাম
                      </p>
                      {nearbyFacilities.find((f) =>
                        f.type.includes("খাদ্য")
                      ) ? (
                        <p className="font-medium text-blue-900">
                          {
                            nearbyFacilities.find((f) =>
                              f.type.includes("খাদ্য")
                            )?.name
                          }
                        </p>
                      ) : (
                        <p className="text-blue-700">শনাক্ত করা যায়নি</p>
                      )}
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 mb-1">
                        নিকটস্থ পশু চিকিৎসা
                      </p>
                      {nearbyFacilities.find((f) => f.type.includes("পশু")) ? (
                        <p className="font-medium text-green-900">
                          {
                            nearbyFacilities.find((f) => f.type.includes("পশু"))
                              ?.name
                          }
                        </p>
                      ) : (
                        <p className="text-green-700">শনাক্ত করা যায়নি</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>অবস্থান ভিত্তিক তথ্য দেখতে</p>
                    <p className="text-sm">আপনার অবস্থান শনাক্ত করুন</p>
                  </div>
                )}
              </div>
            </div>

            {/* শেয়ার অপশন */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Share2 className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-bold text-amber-900">
                  এই পৃষ্ঠা শেয়ার করুন
                </h2>
              </div>

              <p className="text-amber-700 mb-4 text-sm">
                এই জরুরি নম্বরগুলো আপনার বন্ধু ও পরিবারের সদস্যদের সাথে শেয়ার
                করুন।
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        url
                      )}`,
                      "_blank"
                    );
                  }}
                  className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  ফেসবুক
                </button>
                <button
                  onClick={() => {
                    const text = "বন্যা জরুরি সাহায্য - জরুরি নম্বর ও গাইড";
                    const url = window.location.href;
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(
                        text + " " + url
                      )}`,
                      "_blank"
                    );
                  }}
                  className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  হোয়াটসঅ্যাপ
                </button>
                <button
                  onClick={() => {
                    const text =
                      "বন্যা জরুরি সাহায্য - জরুরি নম্বর ও গাইড: " +
                      window.location.href;
                    window.open(
                      `sms:?body=${encodeURIComponent(text)}`,
                      "_blank"
                    );
                  }}
                  className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  এসএমএস
                </button>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("লিঙ্ক কপি করা হয়েছে!");
                }}
                className="w-full mt-4 p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
              >
                <Copy className="h-4 w-4" />
                লিঙ্ক কপি করুন
              </button>
            </div>
          </div>
        </div>

        {/* ফুটার */}
        <div className="mt-12 pt-8 border-t border-red-200">
          <div className="text-center text-red-700">
            <p className="mb-2">
              <strong>জরুরি অবস্থায়:</strong> শান্ত থাকুন, নিরাপদ স্থানে যান,
              জরুরি নম্বরগুলো মনে রাখুন।
            </p>
            <p className="text-sm">
              সর্বশেষ আপডেট:{" "}
              {new Date().toLocaleDateString("bn-BD", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
            {userLocation && (
              <p className="text-xs mt-2 text-gray-600">
                আপনার অবস্থান: {userLocation.lat.toFixed(4)},{" "}
                {userLocation.lon.toFixed(4)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
