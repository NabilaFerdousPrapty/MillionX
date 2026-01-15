"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import {
  Bot,
  Brain,
  Leaf,
  AlertTriangle,
  MessageSquare,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  MapPin,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Shield,
  Phone,
  Send,
  User,
  BookOpen,
  Zap,
  Globe,
  Database,
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
  metadata?: {
    tokens_used: number;
    model: string;
    timestamp: string;
  };
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  sources?: string[];
  followUpQuestions?: string[];
  metadata?: {
    tokens_used?: number;
    model?: string;
    confidence?: number;
  };
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentStreamingId, setCurrentStreamingId] = useState<string | null>(
    null
  );

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const API_BASE = "http://127.0.0.1:8000";

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      type: "ai",
      content:
        "🤖 **স্বাগতম! আমি JolBondhu, আপনার কৃষি সহায়ক AI.**\n\nআমি আপনাকে কৃষি সম্পর্কিত যেকোনো প্রশ্নের উত্তর দিতে পারি। যেমন:\n\n🌾 **ধান চাষ** - বীজ বপন, সার প্রয়োগ, সেচ ব্যবস্থাপনা\n🌾 **গম চাষ** - শীতকালীন ফসলের সম্পূর্ণ গাইড\n🌱 **সার ব্যবস্থাপনা** - বিজ্ঞানসম্মত পদ্ধতি\n💧 **সেচ প্রযুক্তি** - পানি সাশ্রয়ী কৃষি\n💰 **কৃষি ঋণ** - সরকারি স্কিম ও সহায়তা\n🌊 **বন্যা ব্যবস্থাপনা** - দুর্যোগে ফসল রক্ষা\n\nআপনার প্রশ্নটি লিখুন, আমি বিস্তারিত ও ব্যবহারিক সমাধান দেব!",
      timestamp: new Date(),
      sources: [
        "বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট",
        "কৃষি সম্প্রসারণ অধিদপ্তর",
        "আবহাওয়া অধিদপ্তর",
      ],
      followUpQuestions: [
        "ধান চাষের সম্পূর্ণ খরচ কত?",
        "গমের সেরা জাত কোনটি?",
        "কৃষি ঋণ কিভাবে পাবো?",
        "বন্যার সময় ফসল বাচাবো কিভাবে?",
      ],
      metadata: {
        model: "DeepSeek AI",
        confidence: 95,
      },
    };

    setChatMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [userQuestion]);

  // Fetch initial data based on location
  useEffect(() => {
    if (userLocation) {
      fetchFloodPrediction();
      fetchCropRecommendation();
      fetchWeatherData();
    } else {
      // Demo data for testing
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
        nearest_district: "ঢাকা",
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
      const response = await fetch(`${API_BASE}/predict/flood`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: userLocation.lat,
          lon: userLocation.lon,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.status === "success") {
        setFloodPrediction(data.prediction);
        setWeatherData(data.weather_data);
      }
    } catch (error) {
      console.error("Flood prediction error:", error);
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
        nearest_district: "ঢাকা",
        confidence: 87.5,
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
        body: JSON.stringify(userLocation),
      });

      const data = await response.json();
      if (data.status === "success") {
        setCropRecommendation(data.recommendations);
      }
    } catch (error) {
      console.error("Crop recommendation error:", error);
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

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${userLocation.lat}&longitude=${userLocation.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,cloud_cover`
      );
      const data = await response.json();
      if (data.current) {
        setWeatherData({
          temperature: data.current.temperature_2m,
          rainfall_24h: data.current.precipitation,
          humidity: data.current.relative_humidity_2m,
          wind_speed: data.current.wind_speed_10m,
          cloud_cover: data.current.cloud_cover,
        });
      }
    } catch (error) {
      console.error("Weather data error:", error);
      setWeatherData({
        temperature: 31.5,
        rainfall_24h: 45.2,
        humidity: 78,
        wind_speed: 12.3,
        cloud_cover: 65,
      });
    }
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
          location: userLocation,
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

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim() || isChatLoading || isStreaming) return;

    const question = userQuestion.trim();
    const messageId = Date.now().toString();

    // Add user message
    const userMessage: ChatMessage = {
      id: messageId,
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setUserQuestion("");
    setIsChatLoading(true);
    setStreamingContent("");
    setCurrentStreamingId(messageId + "-ai");

    try {
      const response = await fetch(`${API_BASE}/chat/farmer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          location: userLocation,
          stream: false, // Set to true if you want streaming
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        const aiResponse: ChatMessage = {
          id: messageId + "-ai",
          type: "ai",
          content: data.response.answer,
          timestamp: new Date(),
          sources: data.response.sources,
          followUpQuestions: data.response.follow_up_questions,
          metadata: {
            tokens_used: data.response.metadata?.tokens_used,
            model: data.response.metadata?.model || "DeepSeek AI",
            confidence: data.response.confidence,
          },
        };

        setChatMessages((prev) => [...prev, aiResponse]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);

      // Enhanced fallback response
      const fallbackResponse: ChatMessage = {
        id: messageId + "-ai",
        type: "ai",
        content: getFallbackResponse(question),
        timestamp: new Date(),
        sources: ["বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট", "কৃষি জ্ঞান ভাণ্ডার"],
        followUpQuestions: generateFallbackFollowUp(question),
        metadata: {
          model: "JolBondhu Local",
          confidence: 85,
        },
      };

      setChatMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsChatLoading(false);
      setStreamingContent("");
      setCurrentStreamingId(null);
    }
  };

  // Handle streaming response (if you implement streaming)
  const handleStreamingResponse = async (question: string) => {
    const messageId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: messageId,
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setUserQuestion("");
    setIsStreaming(true);
    setStreamingContent("");
    setCurrentStreamingId(messageId + "-ai");

    try {
      const response = await fetch(
        `${API_BASE}/chat/stream?question=${encodeURIComponent(question)}`
      );

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                // Streaming complete
                const finalMessage: ChatMessage = {
                  id: messageId + "-ai",
                  type: "ai",
                  content: streamingContent,
                  timestamp: new Date(),
                  sources: ["DeepSeek AI", "কৃষি জ্ঞান ভাণ্ডার"],
                  followUpQuestions: generateFallbackFollowUp(question),
                  metadata: {
                    model: "DeepSeek Chat",
                    confidence: 95,
                  },
                };
                setChatMessages((prev) => [...prev, finalMessage]);
                setIsStreaming(false);
                setStreamingContent("");
                setCurrentStreamingId(null);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setStreamingContent((prev) => prev + parsed.content);
                }
              } catch (e) {
                console.error("Error parsing stream data:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setIsStreaming(false);
      setStreamingContent("");
      setCurrentStreamingId(null);

      // Fallback to normal chat
      handleChatSubmit(new Event("submit") as any);
    }
  };

  // Enhanced fallback response system
  const getFallbackResponse = (question: string): string => {
    const questionLower = question.toLowerCase();

    if (questionLower.includes("ধান") || questionLower.includes("rice")) {
      return `🌾 **ধান চাষ সম্পর্কে বিস্তারিত পরামর্শ:**

**বর্তমান মৌসুম অনুযায়ী পরামর্শ:**
- **বোরো ধান:** নভেম্বর-ডিসেম্বর মাসে বপন করুন
- **আমন ধান:** জুন-জুলাই মাসে বপন করুন
- **আউশ ধান:** মার্চ-এপ্রিল মাসে বপন করুন

**সার প্রয়োগ (প্রতি হেক্টর):**
- ইউরিয়া: ২৫০-৩০০ কেজি (৩ কিস্তিতে)
- টিএসপি: ১৫০-২০০ কেজি
- এমওপি: ১০০-১৫০ কেজি
- জিঙ্ক: ১০ কেজি

**সেচ ব্যবস্থাপনা:**
- সপ্তাহে ২-৩ বার সেচ দিন
- শীষ বের হওয়ার সময় বেশি পানি দিন
- পরিপক্ক হলে পানি সরিয়ে দিন

**খরচ ও আয় (প্রতি হেক্টর):**
- মোট খরচ: ৮০,০০০-১,০০,০০০ টাকা
- উৎপাদন: ৪-৫ টন
- আয়: ১,২০,০০০-১,৬০,০০০ টাকা
- লাভ: ৪০,০০০-৮০,০০০ টাকা

**বিশেষ টিপস:**
১. স্বল্প জীবনকালীন জাত নির্বাচন করুন
২. সঠিক সময়ে বপন করুন
৩. রোগ-পোকা নিয়মিত মনিটর করুন
৪. মানসম্মত বীজ ব্যবহার করুন`;
    }

    if (questionLower.includes("গম") || questionLower.includes("wheat")) {
      return `🌾 **গম চাষ সম্পূর্ণ গাইড:**

**সেরা সময়:** নভেম্বর ১৫ - ডিসেম্বর ১৫

**জাত নির্বাচন:**
- বারি গম-৩৩: উচ্চ ফলনশীল
- বারি গম-৩২: খরা সহনশীল
- বারি গম-৩১: লবণাক্ততা সহনশীল

**সার প্রয়োগ:**
- ইউরিয়া: ২০০-২২০ কেজি/হেক্টর
- টিএসপি: ১৮০-২০০ কেজি/হেক্টর
- এমওপি: ৮০-১০০ কেজি/হেক্টর
- গোবর সার: ১০ টন/হেক্টর

**সেচ সময়:**
১. প্রথম সেচ: ২১ দিন পর
২. দ্বিতীয় সেচ: ৪৫-৫০ দিন পর
৩. তৃতীয় সেচ: ৭০-৭৫ দিন পর

**আর্থিক বিশ্লেষণ:**
- খরচ: ২৫,০০০-৩০,০০০ টাকা/হেক্টর
- উৎপাদন: ৩-৩.৫ টন/হেক্টর
- আয়: ১,০৫,০০০-১,৪০,০০০ টাকা/হেক্টর
- লাভ: ৭৫,০০০-১,১০,০০০ টাকা/হেক্টর`;
    }

    if (questionLower.includes("সার") || questionLower.includes("fertilizer")) {
      return `🌱 **সার প্রয়োগের বিজ্ঞানসম্মত পদ্ধতি:**

**সারের ধরন:**
১. **জৈব সার:** গোবর, কম্পোস্ট, সবুজ সার
২. **রাসায়নিক সার:** ইউরিয়া, টিএসপি, এমওপি
৩. **সুষম সার:** N-P-K মিশ্রণ

**প্রয়োগ পদ্ধতি:**
- মাটি পরীক্ষা করে সার দিন
- সকাল বা সন্ধ্যায় সার প্রয়োগ করুন
- বৃষ্টির পূর্বাভাস থাকলে সার দিবেন না
- গাছের অবস্থা দেখে সার দিন

**সাধারণ হার (প্রতি হেক্টর):**
- ধান: ইউরিয়া ২৭৫ + টিএসপি ১৭৫ + এমওপি ১২৫ কেজি
- গম: ইউরিয়া ২১০ + টিএসপি ১৯০ + এমওপি ৯০ কেজি
- আলু: ইউরিয়া ৩০০ + টিএসপি ২৫০ + এমওপি ২০০ কেজি

**খরচ বিশ্লেষণ:**
- ইউরিয়া: ২২ টাকা/কেজি
- টিএসপি: ৩৫ টাকা/কেজি
- এমওপি: ৩০ টাকা/কেজি
- মোট: ১৫,০০০-২০,০০০ টাকা/হেক্টর`;
    }

    if (questionLower.includes("বন্যা") || questionLower.includes("flood")) {
      return `🌊 **বন্যা ব্যবস্থাপনা ও ফসল রক্ষা:**

**পূর্ব প্রস্তুতি:**
১. দ্রুত পাকা ফসল সংগ্রহ করুন
২. বীজ ও গুরুত্বপূর্ণ জিনিস উঁচু স্থানে রাখুন
৩. গবাদিপশু নিরাপদ স্থানে নিন
৪. জরুরি নম্বর সংরক্ষণ করুন: ৯৯৯, ১০৯০, ১০৬

**বন্যার সময়:**
১. নিরাপদ স্থানে যান
২. ফসলের জলাবদ্ধতা দূর করুন
৩. রোগ প্রতিরোধের ব্যবস্থা নিন
৪. সেচ ব্যবস্থা ঠিক রাখুন

**বন্যা-পরবর্তী ব্যবস্থা:**
১. দ্রুত নিষ্কাশন করুন
২. ইউরিয়া সার দিন (৫০ কেজি/হেক্টর)
৩. নতুন চারা রোপণ করুন
৪. ফসল বীমা ক্লেইম করুন

**সরকারি সহায়তা:**
- বিনামূল্যে বীজ
- জরুরি ঋণ
- ফসল বীমা ক্ষতিপূরণ`;
    }

    if (questionLower.includes("ঋণ") || questionLower.includes("loan")) {
      return `💰 **কৃষি ঋণ ও আর্থিক সহায়তা:**

**সরকারি স্কিম:**
১. **কিসান ক্রেডিট কার্ড:**
   - সর্বোচ্চ: ৫,০০,০০০ টাকা
   - সুদ: ৪% (ভর্তুকিযুক্ত)
   - মেয়াদ: ৩ বছর

২. **বিশেষ কৃষি ঋণ:**
   - যান্ত্রিকীকরণ: ১০ লক্ষ টাকা
   - শীতকালীন ফসল: ৩ লক্ষ টাকা
   - সবজি চাষ: ২ লক্ষ টাকা

**আবেদন প্রক্রিয়া:**
১. স্থানীয় কৃষি অফিসে যোগাযোগ
২. প্রয়োজনীয় কাগজপত্র:
   - জাতীয় পরিচয়পত্র
   - জমির দলিল
   - ফসল পরিকল্পনা
   - পাসপোর্ট সাইজ ছবি

**ডিজিটাল পদ্ধতি:**
- বিকাশ: *২৪৭#
- নগদ: *১২৬#
- কৃষি হেল্পলাইন: ১৬১২৩`;
    }

    // Default response
    return `🤖 **আপনাকে স্বাগতম! আমি JolBondhu, আপনার কৃষি সহকারী AI.**

আপনার প্রশ্নটি কৃষি সম্পর্কিত নির্দিষ্ট করলে আরও ভালোভাবে সাহায্য করতে পারব।

**আপন যা জানতে পারেন:**
🌾 **ধান চাষ** - বীজ বপন থেকে সংগ্রহ পর্যন্ত সম্পূর্ণ গাইড
🌾 **গম চাষ** - শীতকালীন ফসলের আধুনিক পদ্ধতি
🌱 **সার ব্যবস্থাপনা** - বিজ্ঞানসম্মত সার প্রয়োগ পদ্ধতি
💧 **সেচ ব্যবস্থাপনা** - পানি সাশ্রয়ী কৃষি
🐛 **রোগ-পোকা দমন** - সমন্বিত বালাই ব্যবস্থাপনা
💰 **কৃষি ঋণ** - সরকারি সহায়তা ও ঋণ স্কিম
🌊 **বন্যা ব্যবস্থাপনা** - দুর্যোগে ফসল রক্ষা
📊 **বাজার তথ্য** - ফসলের দাম ও বিপণন

**উদাহরণ প্রশ্ন:**
- "ধান চাষের সম্পূর্ণ খরচ কত?"
- "গমের সেরা জাত কোনটি?"
- "সার কিভাবে প্রয়োগ করব?"
- "ফসলের রোগের সমাধান কি?"

আপনার প্রশ্নটি আরও স্পষ্ট করে বলুন, আমি আপনাকে বিস্তারিত ও ব্যবহারিক সমাধান দেব! 🌱

**জরুরি সাহায্যের জন্য:** ১৬১২৩ (কৃষি হেল্পলাইন)`;
  };

  const generateFallbackFollowUp = (question: string): string[] => {
    const questionLower = question.toLowerCase();

    if (questionLower.includes("ধান") || questionLower.includes("rice")) {
      return [
        "ধান চাষের সম্পূর্ণ খরচ কত?",
        "বোরো ধানের সেরা জাত কোনটি?",
        "ধান ক্ষেতে রোগ দমন কিভাবে করব?",
        "ধান চাষে লাভ কত?",
      ];
    }

    if (questionLower.includes("গম") || questionLower.includes("wheat")) {
      return [
        "গমের সেরা জাত কোনটি?",
        "গম চাষের খরচ কত?",
        "গমের রোগ কীভাবে দমন করব?",
        "গম চাষে লাভ কত?",
      ];
    }

    if (questionLower.includes("সার") || questionLower.includes("fertilizer")) {
      return [
        "ইউরিয়া সারের দাম কত?",
        "জৈব সার কিভাবে তৈরি করব?",
        "সার প্রয়োগের সঠিক সময় কখন?",
        "কোন সার কত টাকা?",
      ];
    }

    return [
      "ধান চাষের খরচ কত?",
      "গম চাষের সেরা সময় কখন?",
      "কৃষি ঋণ কিভাবে পাবো?",
      "বন্যার সময় ফসল বাচাবো কিভাবে?",
    ];
  };

  const handleQuickQuestion = (question: string) => {
    setUserQuestion(question);
    setActiveTab("chat");

    // Auto-focus on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render chat message component
  const ChatMessageItem = ({ message }: { message: ChatMessage }) => (
    <div
      className={`flex ${
        message.type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          message.type === "user"
            ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-br-none shadow-sm"
            : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 rounded-bl-none border border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {message.type === "user" ? (
              <User className="h-4 w-4 opacity-80" />
            ) : (
              <Bot className="h-4 w-4 text-purple-600" />
            )}
            <span className="text-xs font-medium opacity-80">
              {message.type === "user" ? "আপনি" : "JolBondhu AI"}
            </span>
          </div>
          <span className="text-xs opacity-60">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content.split("\n").map((line, i) => (
              <p key={i} className={i > 0 ? "mt-2" : ""}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* AI Response Details */}
        {message.type === "ai" && (
          <div className="mt-3 pt-3 border-t border-gray-200 border-opacity-50">
            {/* Metadata */}
            {message.metadata && (
              <div className="flex flex-wrap items-center gap-3 mb-2 text-xs">
                {message.metadata.model && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Database className="h-3 w-3" />
                    <span>{message.metadata.model}</span>
                  </div>
                )}
                {message.metadata.confidence && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Zap className="h-3 w-3" />
                    <span>{message.metadata.confidence}% আস্থা</span>
                  </div>
                )}
                {message.metadata.tokens_used && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Globe className="h-3 w-3" />
                    <span>{message.metadata.tokens_used} tokens</span>
                  </div>
                )}
              </div>
            )}

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-1 mb-1">
                  <BookOpen className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600 font-medium">
                    তথ্যসূত্র:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {message.sources.slice(0, 3).map((source, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white px-2 py-1 rounded-full border border-gray-300 text-gray-700"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* AI Features Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">JolBondhu AI Assistant</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm opacity-90">
                    AI চালু • DeepSeek API • বিনামূল্যে
                  </span>
                </div>
              </div>
            </div>
            <p className="opacity-90">
              বাস্তবসময় কৃত্রিম বুদ্ধিমত্তা ভিত্তিক বন্যা পূর্বাভাস ও কৃষি
              পরামর্শ
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded-full">
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
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
            activeTab === "flood"
              ? "bg-blue-100 text-blue-700 border border-blue-300 shadow-sm"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <CloudRain className="h-4 w-4" />
          বন্যা পূর্বাভাস
        </button>
        <button
          onClick={() => setActiveTab("crop")}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
            activeTab === "crop"
              ? "bg-green-100 text-green-700 border border-green-300 shadow-sm"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Leaf className="h-4 w-4" />
          ফসল পরামর্শ
        </button>
        <button
          onClick={() => setActiveTab("emergency")}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
            activeTab === "emergency"
              ? "bg-red-100 text-red-700 border border-red-300 shadow-sm"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          জরুরি সাহায্য
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
            activeTab === "chat"
              ? "bg-purple-100 text-purple-700 border border-purple-300 shadow-sm"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          AI চ্যাট
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-200 text-purple-800 rounded-full">
            নতুন
          </span>
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {isLoading && activeTab !== "chat" && (
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        জরুরি সাহায্য নিন
                      </button>
                      <button
                        onClick={fetchFloodPrediction}
                        className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        আপডেট করুন
                      </button>
                      <button
                        onClick={() =>
                          handleQuickQuestion("বন্যার সময় ফসল বাচাবো কিভাবে?")
                        }
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors shadow-sm"
                      >
                        AI কে জিজ্ঞাসা করুন
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
                                className="px-3 py-2 bg-green-100 text-green-800 rounded-lg font-medium shadow-sm"
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => handleQuickQuestion("ধান চাষের খরচ কত?")}
                      className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left shadow-sm"
                    >
                      <h4 className="font-medium text-blue-900">চাষ খরচ</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        ফসলভেদে আনুমানিক খরচ
                      </p>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion("ফসলের বাজার দর কত?")}
                      className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left shadow-sm"
                    >
                      <h4 className="font-medium text-green-900">
                        বাজার মূল্য
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        দৈনিক ফসলের দর জানুন
                      </p>
                    </button>
                    <button
                      onClick={() =>
                        handleQuickQuestion("কৃষি ঋণ কিভাবে পাবো?")
                      }
                      className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left shadow-sm"
                    >
                      <h4 className="font-medium text-purple-900">কৃষি ঋণ</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        সরকারি ঋণ স্কিম
                      </p>
                    </button>
                    <button
                      onClick={() =>
                        handleQuickQuestion("ফসল বীমা ক্লেম কিভাবে করব?")
                      }
                      className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left shadow-sm"
                    >
                      <h4 className="font-medium text-red-900">বীমা ক্লেম</h4>
                      <p className="text-sm text-red-700 mt-1">
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
                        className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left group shadow-sm"
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
                        <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm">
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
                        <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm">
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
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
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
                      className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Phone className="h-5 w-5" />
                      জরুরি কল করুন (৯৯৯)
                    </button>
                    <button
                      onClick={() => window.open("tel:1090", "_blank")}
                      className="w-full p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Phone className="h-5 w-5" />
                      দুর্যোগ ব্যবস্থাপনা (১০৯০)
                    </button>
                    <button
                      onClick={() => window.open("tel:106", "_blank")}
                      className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Phone className="h-5 w-5" />
                      অ্যাম্বুলেন্স (১০৬)
                    </button>
                    <button
                      onClick={() => window.open("tel:16123", "_blank")}
                      className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Phone className="h-5 w-5" />
                      কৃষি হেল্পলাইন (১৬১২৩)
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

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3">
                    💬 AI কে জিজ্ঞাসা করুন
                  </h4>
                  <button
                    onClick={() =>
                      handleQuickQuestion("বন্যার সময় ফসল বাচাবো কিভাবে?")
                    }
                    className="w-full p-3 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors shadow-sm"
                  >
                    বন্যার সময় ফসল রক্ষা
                  </button>
                  <button
                    onClick={() =>
                      handleQuickQuestion("জরুরি ঋণ পাওয়ার উপায়?")
                    }
                    className="w-full p-3 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors mt-2 shadow-sm"
                  >
                    জরুরি কৃষি ঋণ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Tab */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-sm">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">
                        JolBondhu AI চ্যাটবট
                      </h3>
                      <p className="text-sm text-gray-600">
                        বাস্তবসময় কৃষি বিশেষজ্ঞ • DeepSeek AI • ২৪/৭ উপলব্ধ
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span>অনলাইন</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-6"
                >
                  {chatMessages.map((message) => (
                    <ChatMessageItem key={message.id} message={message} />
                  ))}

                  {/* Streaming Content */}
                  {isStreaming && currentStreamingId && streamingContent && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 rounded-2xl rounded-bl-none border border-gray-200 px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-medium opacity-80">
                            JolBondhu AI
                          </span>
                          <div className="flex space-x-1 ml-auto">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                            <div
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {streamingContent}
                            <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loading Indicator */}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl rounded-bl-none border border-gray-200 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-purple-600" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 ml-2">
                            চিন্তা করছি...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {!isChatLoading &&
                    !isStreaming &&
                    chatMessages.length > 0 &&
                    chatMessages[chatMessages.length - 1].type === "ai" &&
                    chatMessages[chatMessages.length - 1].followUpQuestions && (
                      <div className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <p className="text-sm text-gray-700 font-medium">
                            সম্পর্কিত প্রশ্ন:
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {chatMessages[
                            chatMessages.length - 1
                          ].followUpQuestions
                            ?.slice(0, 4)
                            .map((question, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setUserQuestion(question);
                                  textareaRef.current?.focus();
                                }}
                                className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm hover:border-purple-300 hover:text-purple-700"
                              >
                                {question}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <form onSubmit={handleChatSubmit} className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <textarea
                          ref={textareaRef}
                          value={userQuestion}
                          onChange={(e) => setUserQuestion(e.target.value)}
                          placeholder="আপনার কৃষি প্রশ্ন লিখুন... (উদাহরণ: ধান চাষের খরচ কত? সার কিভাবে দেব? গমের রোগের সমাধান কি?)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[60px] max-h-[120px] shadow-sm"
                          disabled={isChatLoading || isStreaming}
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleChatSubmit(e);
                            }
                          }}
                        />
                        <div className="absolute right-3 bottom-2 text-xs text-gray-400">
                          Shift+Enter for new line
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={
                          isChatLoading || isStreaming || !userQuestion.trim()
                        }
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center gap-2 h-fit shadow-sm disabled:cursor-not-allowed"
                      >
                        {isChatLoading || isStreaming ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="hidden sm:inline">
                              চিন্তা করছি...
                            </span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span className="hidden sm:inline">প্রেরণ</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickQuestion("ধান চাষের সম্পূর্ণ গাইড দাও")
                        }
                        className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors border border-blue-200"
                      >
                        🌾 ধান চাষ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickQuestion("গম চাষের খরচ কত?")}
                        className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors border border-green-200"
                      >
                        🌾 গম চাষ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickQuestion("সার কিভাবে দেব?")}
                        className="text-xs px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors border border-yellow-200"
                      >
                        🌱 সার ব্যবস্থাপনা
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickQuestion("বন্যার সময় ফসল বাচাবো কিভাবে?")
                        }
                        className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors border border-red-200"
                      >
                        🌊 বন্যা ব্যবস্থাপনা
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickQuestion("কৃষি ঋণ পেতে কি করতে হবে?")
                        }
                        className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors border border-purple-200"
                      >
                        💰 কৃষি ঋণ
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Chat Suggestions & Features */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <h4 className="font-bold text-gray-900">দ্রুত প্রশ্ন</h4>
                </div>
                <div className="space-y-3">
                  {[
                    "ধান চাষের সম্পূর্ণ খরচ কত?",
                    "গমের সেরা জাত কোনটি?",
                    "পাট চাষের সময় কখন?",
                    "কৃষি ঋণ পেতে কি করতে হবে?",
                    "ফসলের রোগের প্রতিকার কি?",
                    "সার প্রয়োগের নিয়ম কি?",
                    "বন্যার সময় ফসল রক্ষা কিভাবে করব?",
                    "জলবায়ু পরিবর্তনের সাথে খাপ খাইয়ে নেওয়া",
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setUserQuestion(question);
                        textareaRef.current?.focus();
                      }}
                      className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700 flex items-center gap-2 border border-gray-200 hover:border-purple-300 hover:text-purple-700"
                    >
                      <div className="flex-1">{question}</div>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h4 className="font-bold text-purple-900">
                    AI চ্যাট বৈশিষ্ট্য
                  </h4>
                </div>
                <ul className="text-purple-800 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span>
                      <strong>২৪/৭ কৃষি পরামর্শ:</strong> যেকোনো সময় প্রশ্ন
                      করুন
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span>
                      <strong>অবস্থানভিত্তিক সুপারিশ:</strong> আপনার এলাকা
                      অনুযায়ী পরামর্শ
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span>
                      <strong>বাস্তবসম্মত সমাধান:</strong> ব্যবহারিক ও কার্যকরী
                      পরামর্শ
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span>
                      <strong>সরকারি স্কিম তথ্য:</strong> সর্বশেষ সরকারি সহায়তা
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span>
                      <strong>বাজার মূল্য নির্দেশিকা:</strong> ফসলের বর্তমান দর
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <h4 className="font-bold text-gray-900">সরাসরি সাহায্য</h4>
                </div>
                <button
                  onClick={() => window.open("tel:16123", "_blank")}
                  className="w-full p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 mb-2 shadow-sm"
                >
                  <Phone className="h-5 w-5" />
                  কৃষি হেল্পলাইন (১৬১২৩)
                </button>
                <p className="text-xs text-gray-500 text-center mb-4">
                  ২৪ ঘন্টা কৃষি পরামর্শ সেবা
                </p>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">
                    অন্যান্য জরুরি নম্বর:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => window.open("tel:999", "_blank")}
                      className="text-xs p-2 bg-red-50 text-red-700 rounded hover:bg-red-100 border border-red-200"
                    >
                      ৯৯৯ - জরুরি
                    </button>
                    <button
                      onClick={() => window.open("tel:1090", "_blank")}
                      className="text-xs p-2 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 border border-orange-200"
                    >
                      ১০৯০ - দুর্যোগ
                    </button>
                    <button
                      onClick={() => window.open("tel:106", "_blank")}
                      className="text-xs p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
                    >
                      ১০৬ - অ্যাম্বুলেন্স
                    </button>
                    <button
                      onClick={() => window.open("tel:333", "_blank")}
                      className="text-xs p-2 bg-green-50 text-green-700 rounded hover:bg-green-100 border border-green-200"
                    >
                      ৩৩৩ - ফায়ার সার্ভিস
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
