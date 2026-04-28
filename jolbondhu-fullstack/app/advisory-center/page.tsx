"use client";

import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  Video,
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Users,
  Shield,
  Play,
  Clock,
  Eye,
  FileDown,
  Bell,
  Share2,
  Copy,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Heart,
  Phone,
  Bot,
  Lightbulb,
  Sparkles,
  Loader2,
  Mic,
  MicOff,
  Send,
  Zap,
  TrendingUp,
  Globe,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { PiPlant } from "react-icons/pi";

interface AdvisoryTopic {
  id: string;
  title: string;
  icon: any;
  color: string;
  items: {
    title: string;
    details: string;
  }[];
}

interface VideoAdvisory {
  id: number;
  title: string;
  duration: string;
  views: string;
  youtubeId: string;
  description: string;
}

interface DocumentAdvisory {
  id: number;
  title: string;
  size: string;
  pages: number;
  downloads: number;
  url: string;
  category: string;
}

interface ExpertAdvisory {
  name: string;
  designation: string;
  advice: string;
  contact: string;
  available: boolean;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: string;
  windSpeed: number;
  condition: string;
  forecast: string[];
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

const API_BASE = "http://127.0.0.1:8000";

export default function AdvisoryCenterPage() {
  const [selectedTopic, setSelectedTopic] = useState("বন্যা_প্রস্তুতি");
  const [searchQuery, setSearchQuery] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoAdvisory | null>(
    null,
  );
  const [notification, setNotification] = useState("");
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const [likedVideos, setLikedVideos] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState("সকল");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [openRouterStatus, setOpenRouterStatus] = useState<boolean>(false);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "বন্যার সময় ফসল বাঁচানোর উপায় কি?",
    "ধান চাষের সঠিক পদ্ধতি জানতে চাই",
    "কৃষি ঋণ পেতে কি কি প্রয়োজন?",
    "বর্তমান বাজারে ফসলের দাম কেমন?",
    "জৈব সার তৈরির পদ্ধতি কি?",
  ]);
  const [showSuggested, setShowSuggested] = useState(true);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const streamControllerRef = useRef<AbortController | null>(null);

  // Advisory Data
  const পরামর্শ_বিষয়সমূহ: AdvisoryTopic[] = [
    {
      id: "বন্যা_প্রস্তুতি",
      title: "বন্যা পূর্ব প্রস্তুতি",
      icon: Shield,
      color: "from-blue-500 to-cyan-600",
      items: [
        {
          title: "ফসল রক্ষার জরুরি পদক্ষেপ",
          details:
            "ধানের ক্ষেত উঁচু স্থানে তৈরি করুন। বীজতলা নিরাপদে সংরক্ষণ করুন। সেচ ব্যবস্থা চেক করুন।",
        },
        {
          title: "গবাদিপশু সুরক্ষা",
          details:
            "গবাদিপশু নিরাপদ স্থানে নিন। খাদ্য ও পানির ব্যবস্থা রাখুন। জরুরি চিকিৎসা সরঞ্জাম প্রস্তুত রাখুন।",
        },
        {
          title: "বীজ ও সার সংরক্ষণ",
          details:
            "বায়ুরোধী পাত্রে বীজ সংরক্ষণ করুন। সার উঁচু ও শুকনো স্থানে রাখুন। প্লাস্টিকের ব্যাগ ব্যবহার করুন।",
        },
        {
          title: "কৃষি যন্ত্রপাতি সুরক্ষা",
          details:
            "যন্ত্রপাতি উঁচু স্থানে রাখুন। তেল ও গ্রিজ দিয়ে সংরক্ষণ করুন। বৈদ্যুতিক সরঞ্জাম নিরাপদ স্থানে রাখুন।",
        },
      ],
    },
    {
      id: "ফসল_পরিচর্যা",
      title: "বন্যার সময় ফসল পরিচর্যা",
      icon: PiPlant,
      color: "from-green-500 to-emerald-600",
      items: [
        {
          title: "ধানের বিশেষ যত্ন",
          details:
            "অতিরিক্ত পানি নিষ্কাশনের ব্যবস্থা করুন। প্রয়োজনীয় সাপোর্ট দিয়ে গাছ ঠেকিয়ে রাখুন।",
        },
        {
          title: "সবজি চাষ পদ্ধতি",
          details:
            "উঁচু বেড তৈরি করুন। ড্রেনেজ ব্যবস্থা নিশ্চিত করুন। পলিথিন দিয়ে আচ্ছাদন করুন।",
        },
        {
          title: "ফল গাছ রক্ষা",
          details:
            "গাছের গোড়া উঁচু করে দিন। অতিরিক্ত ডালপালা ছাঁটাই করুন। খুঁটি দিয়ে সাপোর্ট দিন।",
        },
        {
          title: "মাটির পরিচর্যা",
          details:
            "জৈব সার প্রয়োগ করুন। মাটির ক্ষয়রোধ করুন। পিএইচ ব্যালেন্স বজায় রাখুন।",
        },
      ],
    },
    {
      id: "বন্যা_পরবর্তী",
      title: "বন্যা পরবর্তী ব্যবস্থাপনা",
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-600",
      items: [
        {
          title: "ক্ষতি মূল্যায়ন",
          details:
            "ফসলের ক্ষতি পরিমাপ করুন। যন্ত্রপাতির অবস্থা চেক করুন। গবাদিপশুর স্বাস্থ্য পরীক্ষা করুন।",
        },
        {
          title: "পুনরায় চাষাবাদ",
          details:
            "ক্ষেত পরিষ্কার করুন। দ্রুত বর্ধনশীল ফসল নির্বাচন করুন। সময়মতো বপন করুন।",
        },
        {
          title: "মাটির উন্নয়ন",
          details:
            "জৈব সার প্রয়োগ করুন। চুন প্রয়োগ করে মাটি উন্নয়ন করুন। জমি সমতল করুন।",
        },
        {
          title: "সরকারি সাহায্য",
          details:
            "স্থানীয় কৃষি অফিসে যোগাযোগ করুন। ক্ষতি মূল্যায়ন রিপোর্ট তৈরি করুন। আবেদন ফর্ম পূরণ করুন।",
        },
      ],
    },
    {
      id: "রোগ_ব্যবস্থাপনা",
      title: "রোগ ও পোকামাকড় ব্যবস্থাপনা",
      icon: AlertTriangle,
      color: "from-amber-500 to-yellow-600",
      items: [
        {
          title: "সাধারণ রোগ চেনা",
          details:
            "ফসলের পাতা ও কাণ্ড পর্যবেক্ষণ করুন। রোগের লক্ষণ চিনুন। প্রাথমিক চিকিৎসা জানুন।",
        },
        {
          title: "জৈবিক নিয়ন্ত্রণ",
          details:
            "প্রাকৃতিক শত্রু ব্যবহার করুন। ফেরোমন ফাঁদ স্থাপন করুন। উপকারী কীট সংরক্ষণ করুন।",
        },
        {
          title: "রাসায়নিক স্প্রে",
          details:
            "নির্দেশিকা মোতাবেক স্প্রে করুন। সুরক্ষা সরঞ্জাম ব্যবহার করুন। সময়মতো প্রয়োগ করুন।",
        },
        {
          title: "প্রতিরোধক ব্যবস্থা",
          details:
            "সুষম সার প্রয়োগ করুন। সঠিক দূরত্বে চারা রোপণ করুন। সেচ ব্যবস্থা নিয়ন্ত্রণ করুন।",
        },
      ],
    },
  ];

  const ভিডিও_পরামর্শ: VideoAdvisory[] = [
    {
      id: 1,
      title: "ধান ক্ষেত বন্যা থেকে রক্ষার উপায়",
      duration: "১৫:৩০",
      views: "২৫,৪৩২",
      youtubeId: "C9WQ7E_6J-k",
      description: "ধান ক্ষেত বন্যা থেকে রক্ষার আধুনিক ও ঐতিহ্যবাহী পদ্ধতি।",
    },
    {
      id: 2,
      title: "বন্যার সময় গবাদিপশু রক্ষা",
      duration: "১২:১৫",
      views: "১৮,৭৬৫",
      youtubeId: "eCzaDKYgedc",
      description: "গবাদিপশুর জন্য নিরাপদ আশ্রয় ও খাদ্য ব্যবস্থাপনা।",
    },
    {
      id: 3,
      title: "সবজি চাষে বিশেষ যত্ন",
      duration: "২০:১০",
      views: "৩২,১১০",
      youtubeId: "_fLOhZccnUg",
      description: "বন্যা মৌসুমে সবজি চাষের বিশেষ কৌশল ও পরিচর্যা।",
    },
    {
      id: 4,
      title: "বন্যা পরবর্তী মাটি পরীক্ষা",
      duration: "১৮:৪৫",
      views: "২২,৩৪৫",
      youtubeId: "_fLOhZccnUg",
      description: "বন্যার পর মাটির স্বাস্থ্য পরীক্ষা ও উন্নয়ন পদ্ধতি।",
    },
  ];

  const ডকুমেন্ট_পরামর্শ: DocumentAdvisory[] = [
    {
      id: 1,
      title: "বন্যা মোকাবেলা গাইডলাইন ২০২৪",
      size: "২.৫ MB",
      pages: 24,
      downloads: 15432,
      url: "/documents/flood-management-guide-2024.pdf",
      category: "সরকারি গাইড",
    },
    {
      id: 2,
      title: "ফসল রক্ষায় জরুরি পদক্ষেপ",
      size: "১.৮ MB",
      pages: 18,
      downloads: 12456,
      url: "/documents/crop-protection-emergency.pdf",
      category: "পরামর্শ",
    },
    {
      id: 3,
      title: "কৃষি বীমা দাবি প্রক্রিয়া",
      size: "৩.২ MB",
      pages: 32,
      downloads: 8765,
      url: "/documents/agriculture-insurance-claim.pdf",
      category: "আর্থিক",
    },
    {
      id: 4,
      title: "সরকারি সাহায্য আবেদন পদ্ধতি",
      size: "২.১ MB",
      pages: 21,
      downloads: 15678,
      url: "/documents/government-aid-application.pdf",
      category: "সরকারি",
    },
  ];

  const বিশেষজ্ঞ_পরামর্শ: ExpertAdvisory[] = [
    {
      name: "ড. মোঃ আলী হোসেন",
      designation: "কৃষি বিশেষজ্ঞ, বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট",
      advice:
        "বন্যার আগে ধানের ক্ষেত থেকে পানি নিষ্কাশনের ব্যবস্থা করুন। জমিতে অতিরিক্ত সেচ দেবেন না। বীজতলা উঁচু জায়গায় তৈরি করুন।",
      contact: "০১৭১২৩৪৫৬৭৮",
      available: true,
    },
    {
      name: "প্রফেসর মোঃ করিম উদ্দিন",
      designation: "মৃত্তিকা বিজ্ঞানী, কৃষি বিশ্ববিদ্যালয়",
      advice:
        "বন্যার পর মাটিতে চুন প্রয়োগ করুন। জৈব সার ব্যবহার করে মাটির স্বাস্থ্য ফিরিয়ে আনুন।",
      contact: "০১৯৮৭৬৫৪৩২১",
      available: false,
    },
    {
      name: "ড. সেলিনা আক্তার",
      designation: "ফসল রোগ বিশেষজ্ঞ",
      advice:
        "বন্যার পর ফসলের রোগ প্রতিরোধে জৈব কীটনাশক ব্যবহার করুন। নিয়মিত ক্ষেত পরিদর্শন করুন।",
      contact: "০১৫৫৫৫৫৫৫৫৫",
      available: true,
    },
  ];

  const নির্বাচিত_বিষয় = পরামর্শ_বিষয়সমূহ.find((t) => t.id === selectedTopic);

  // Check OpenRouter status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) {
          const data = await res.json();
          setOpenRouterStatus(data.openrouter_available || false);
        }
      } catch (e) {
        console.error("Could not fetch status");
      }
    };
    checkStatus();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "bn-BD";
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setCurrentQuestion(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
          showNotification("ভয়েস রিকগনিশনে সমস্যা হয়েছে");
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Fetch weather data
  const fetchWeatherData = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setWeatherData({
            temperature: 28 + Math.random() * 5,
            humidity: 65 + Math.random() * 15,
            rainfall: `${(10 + Math.random() * 40).toFixed(1)} mm`,
            windSpeed: 5 + Math.random() * 10,
            condition: "মেঘলা",
            forecast: ["আংশিক মেঘলা", "বৃষ্টির সম্ভাবনা", "রোদ"],
          });
          setLocation(`লাট: ${lat.toFixed(2)}, লং: ${lon.toFixed(2)}`);
          showNotification("আবহাওয়া তথ্য আপডেট করা হয়েছে");
        },
        (error) => {
          console.error("Geolocation error:", error);
          showNotification("অবস্থান পাওয়া যায়নি");
        },
      );
    } else {
      showNotification("জিওলোকেশন সমর্থিত নয়");
    }
  };

  // Send message to backend (which uses OpenRouter)
  const sendMessageToAI = async (message: string, useStreaming = true) => {
    if (!message.trim()) {
      showNotification("অনুগ্রহ করে কিছু লিখুন");
      return;
    }

    // Add user message
    const userMessageId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMessageId,
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setCurrentQuestion("");
    setShowSuggested(false);
    setIsChatLoading(true);

    try {
      if (useStreaming) {
        // Streaming request
        setIsStreaming(true);
        streamControllerRef.current = new AbortController();

        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage: ChatMessage = {
          id: aiMessageId,
          type: "ai",
          content: "",
          timestamp: new Date(),
          isLoading: true,
        };
        setChatMessages((prev) => [...prev, aiMessage]);
        setStreamingMessageId(aiMessageId);

        const response = await fetch(
          `${API_BASE}/chat/stream?question=${encodeURIComponent(message)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "text/event-stream",
            },
            signal: streamControllerRef.current.signal,
          },
        );

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let accumulatedAnswer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.substring(6);
                if (data === "[DONE]") {
                  setIsStreaming(false);
                  setStreamingMessageId(null);
                  setChatMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? {
                            ...msg,
                            content: accumulatedAnswer,
                            isLoading: false,
                          }
                        : msg,
                    ),
                  );
                  break;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    accumulatedAnswer += parsed.content;
                    setChatMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiMessageId
                          ? {
                              ...msg,
                              content: accumulatedAnswer,
                              isLoading: true,
                            }
                          : msg,
                      ),
                    );
                  }
                  if (parsed.done) {
                    setIsStreaming(false);
                    setStreamingMessageId(null);
                    setChatMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiMessageId
                          ? {
                              ...msg,
                              content: accumulatedAnswer,
                              isLoading: false,
                            }
                          : msg,
                      ),
                    );
                    break;
                  }
                } catch (e) {
                  // Non-JSON data, ignore
                }
              }
            }
          }
        }
      } else {
        // Non-streaming request
        const response = await fetch(`${API_BASE}/chat/farmer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: message,
            location: location
              ? {
                  lat: parseFloat(location.split(",")[0].split(":")[1]),
                  lon: parseFloat(location.split(",")[1].split(":")[1]),
                }
              : null,
            stream: false,
          }),
        });

        const data = await response.json();

        if (data.status === "success") {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: data.response.answer,
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, aiMessage]);

          if (data.response.follow_up_questions) {
            setSuggestedQuestions(
              data.response.follow_up_questions.slice(0, 5),
            );
          }

          showNotification("AI পরামর্শ প্রস্তুত!");
        } else {
          throw new Error("Failed to get AI response");
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      showNotification("AI পরামর্শ পাওয়া যায়নি। আবার চেষ্টা করুন।");

      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `🤖 **আপনার প্রশ্নের উত্তর:**\n\n"${message}" সম্পর্কে আমার পরামর্শ হলো:\n\n১. স্থানীয় কৃষি অফিসের সাথে যোগাযোগ করুন (হটলাইন: ১৬১২৩)\n২. অভিজ্ঞ কৃষকের পরামর্শ নিন\n৩. আমাদের ভিডিও গ্যালারি থেকে সংশ্লিষ্ট ভিডিও দেখুন\n\nআরও নির্দিষ্ট প্রশ্ন করুন:\n- "ধান চাষের খরচ কত?"\n- "বন্যার সময় ফসল বাঁচানোর উপায় কি?"\n- "কৃষি ঋণ পেতে কি কি প্রয়োজন?"`,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsChatLoading(false);
      setIsStreaming(false);
      setStreamingMessageId(null);
    }
  };

  // Stop streaming
  const stopStreaming = () => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingMessageId(null);
      showNotification("স্ট্রিমিং বন্ধ করা হয়েছে");
    }
  };

  // Voice input handler
  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      showNotification("শুনছি... কথা বলুন");
    } else {
      showNotification("ভয়েস ইনপুট সমর্থিত নয়");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    setChatMessages([]);
    setShowSuggested(true);
    showNotification("চ্যাট ইতিহাস মুছে ফেলা হয়েছে");
  };

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  // Search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showNotification("অনুগ্রহ করে কিছু লিখুন");
      return;
    }

    const results = [
      ...পরামর্শ_বিষয়সমূহ.flatMap((topic) =>
        topic.items.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.details.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      ),
      ...ভিডিও_পরামর্শ.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
      ...ডকুমেন্ট_পরামর্শ.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    ];

    if (results.length === 0) {
      showNotification(
        `"${searchQuery}" এর জন্য কোন ফলাফল পাওয়া যায়নি। AI এর সাহায্য নিন।`,
      );
      setIsChatOpen(true);
      setIsChatMinimized(false);
      sendMessageToAI(searchQuery);
    } else {
      showNotification(`${results.length} টি ফলাফল পাওয়া গেছে`);
    }
  };

  // Play video function
  const playVideo = (video: VideoAdvisory) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  // Download document
  const downloadDocument = (doc: DocumentAdvisory) => {
    showNotification(`${doc.title} ডাউনলোড শুরু হয়েছে`);
    const blob = new Blob([`This is ${doc.title}`], {
      type: "application/pdf",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showNotification(`${doc.title} সফলভাবে ডাউনলোড হয়েছে`);
  };

  // Share content
  const shareContent = (title: string, type: string) => {
    const shareText = `JolBondhu পরামর্শ: ${title}`;
    if (navigator.share) {
      navigator.share({
        title: `${type} - JolBondhu`,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      showNotification("লিঙ্ক কপি করা হয়েছে");
    }
  };

  // Toggle save item
  const toggleSaveItem = (id: number) => {
    setSavedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
    const action = savedItems.includes(id) ? "আনসেভ" : "সেভ";
    showNotification(`সফলভাবে ${action} করা হয়েছে`);
  };

  // Toggle like video
  const toggleLikeVideo = (id: number) => {
    setLikedVideos((prev) =>
      prev.includes(id)
        ? prev.filter((videoId) => videoId !== id)
        : [...prev, id],
    );
  };

  // Contact expert
  const contactExpert = (expert: ExpertAdvisory) => {
    if (expert.available) {
      window.open(`tel:${expert.contact}`, "_blank");
    } else {
      showNotification(`${expert.name} বর্তমানে ব্যস্ত আছেন। পরে চেষ্টা করুন।`);
    }
  };

  // Join live session
  const joinLiveSession = () => {
    window.open("https://meet.google.com/bng-farmers", "_blank");
    showNotification("লাইভ সেশনে যোগদান করা হচ্ছে...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Notification */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>{notification}</span>
            </div>
          </div>
        )}

        {/* Video Modal */}
        {showVideoModal && selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
            <div className="bg-white rounded-xl w-full max-w-4xl mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedVideo.title}
                  </h3>
                  <button
                    onClick={closeVideoModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-600">
                    <p>{selectedVideo.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {selectedVideo.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedVideo.duration}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => shareContent(selectedVideo.title, "ভিডিও")}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Chatbot Button */}
        <button
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            setIsChatMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          {isChatOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <div className="relative">
              <Bot className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
            </div>
          )}
        </button>

        {/* AI Chatbot Modal */}
        {isChatOpen && (
          <div
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-green-200 transition-all duration-300 ${
              isChatMinimized
                ? "bottom-24 right-6 w-80 h-14 overflow-hidden"
                : "bottom-24 right-6 w-[95%] sm:w-[450px] h-[650px]"
            }`}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-white" />
                  <div>
                    <h3 className="font-bold text-white">JolBondhu AI</h3>
                    <p className="text-xs text-green-100">
                      {openRouterStatus
                        ? "🤖 DeepSeek (Free)"
                        : "📚 অফলাইন মোড"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsChatMinimized(!isChatMinimized)}
                    className="text-white hover:text-green-100"
                  >
                    {isChatMinimized ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-white hover:text-green-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {!isChatMinimized && (
                <p className="text-xs text-green-100 mt-1">
                  কৃষি বিশেষজ্ঞ AI - যেকোনো প্রশ্ন করুন (বিনামূল্যে)
                </p>
              )}
            </div>

            {!isChatMinimized && (
              <>
                {/* Chat Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 h-[460px] bg-gradient-to-b from-green-50 to-white"
                >
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <p className="text-green-600 font-medium">
                        👋 স্বাগতম! আমি JolBondhu AI
                      </p>
                      <p className="text-sm text-green-500 mt-2">
                        আপনার কৃষি ও বন্যা সম্পর্কিত প্রশ্ন করতে পারেন
                      </p>
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() =>
                            sendMessageToAI(
                              "বন্যার সময় ফসল বাঁচানোর উপায় কি?",
                            )
                          }
                          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                        >
                          বন্যার সময় ফসল বাঁচানোর উপায়?
                        </button>
                        <button
                          onClick={() => sendMessageToAI("ধান চাষের খরচ কত?")}
                          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors ml-2"
                        >
                          ধান চাষের খরচ কত?
                        </button>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                            msg.type === "user"
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none border border-green-200 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {msg.type === "user" ? (
                                <span className="text-xs opacity-80">আপনি</span>
                              ) : (
                                <>
                                  <Bot className="h-3 w-3 text-green-600" />
                                  <span className="text-xs text-green-600">
                                    JolBondhu AI
                                  </span>
                                </>
                              )}
                            </div>
                            <span className="text-xs opacity-70">
                              {msg.timestamp.toLocaleTimeString("bn-BD", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            {msg.content.split("\n").map((line, i) => (
                              <p key={i} className={i > 0 ? "mt-2" : ""}>
                                {line}
                              </p>
                            ))}
                            {msg.isLoading && (
                              <div className="flex gap-1 mt-2">
                                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse delay-150"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {isChatLoading && !isStreaming && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-green-200">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
                          <span className="text-sm text-green-600">
                            চিন্তা করছি...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Questions */}
                {showSuggested && chatMessages.length < 2 && (
                  <div className="px-4 py-2 border-t border-green-200 bg-white">
                    <p className="text-xs text-green-600 mb-2">
                      সাজেস্টেড প্রশ্ন:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.slice(0, 3).map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessageToAI(q)}
                          className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="p-4 border-t border-green-200 bg-white rounded-b-2xl">
                  {isStreaming && (
                    <div className="mb-2 flex justify-end">
                      <button
                        onClick={stopStreaming}
                        className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        স্ট্রিমিং বন্ধ করুন
                      </button>
                    </div>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessageToAI(currentQuestion);
                    }}
                    className="flex gap-2"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        placeholder="আপনার প্রশ্ন লিখুন..."
                        className="w-full px-4 py-2 pr-20 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isChatLoading}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <button
                          type="button"
                          onClick={isListening ? stopListening : startListening}
                          className={`p-1 rounded ${
                            isListening
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {isListening ? (
                            <MicOff className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isChatLoading || !currentQuestion.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isChatLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">প্রেরণ</span>
                    </button>
                  </form>
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={clearChatHistory}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      চ্যাট মুছুন
                    </button>
                    <button
                      onClick={fetchWeatherData}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      আবহাওয়া দেখুন
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white mb-6">
            <Bot className="h-6 w-6" />
            <span className="text-lg font-semibold">AI পরামর্শ কেন্দ্র</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
            AI সহ অভিজ্ঞ বিশেষজ্ঞদের পরামর্শ
          </h1>
          <p className="text-green-700 text-lg max-w-3xl mx-auto">
            {openRouterStatus
              ? "DeepSeek AI এর সাথে বন্যা মোকাবেলা থেকে শুরু করে ফসল রক্ষার সকল কৌশল। ভিডিও, পিডিএফ এবং AI পরামর্শের মাধ্যমে শিখুন।"
              : "কৃষি বিশেষজ্ঞ AI-এর সাথে বন্যা মোকাবেলা থেকে শুরু করে ফসল রক্ষার সকল কৌশল। ভিডিও, পিডিএফ এবং AI পরামর্শের মাধ্যমে শিখুন।"}
          </p>
        </div>

        {/* Weather Widget */}
        {weatherData && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CloudRain className="h-8 w-8" />
                  <div>
                    <h3 className="font-bold text-lg">আজকের আবহাওয়া</h3>
                    <p className="text-sm opacity-90">
                      {location ? location : "আপনার এলাকা"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    <span className="text-2xl font-bold">
                      {weatherData.temperature}°C
                    </span>
                  </div>
                  <p className="text-sm">{weatherData.condition}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4 text-center">
                <div className="flex flex-col items-center">
                  <Droplets className="h-5 w-5 mb-1" />
                  <span className="text-sm">আর্দ্রতা</span>
                  <span className="font-bold">{weatherData.humidity}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <CloudRain className="h-5 w-5 mb-1" />
                  <span className="text-sm">বৃষ্টিপাত</span>
                  <span className="font-bold">{weatherData.rainfall}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Wind className="h-5 w-5 mb-1" />
                  <span className="text-sm">বাতাস</span>
                  <span className="font-bold">
                    {weatherData.windSpeed} km/h
                  </span>
                </div>
                <button
                  onClick={() =>
                    sendMessageToAI("আজকের আবহাওয়ায় কী ফসলের যত্ন নেব?")
                  }
                  className="bg-white/20 hover:bg-white/30 rounded-lg p-2 flex flex-col items-center justify-center transition-colors"
                >
                  <Bot className="h-5 w-5 mb-1" />
                  <span className="text-sm">AI পরামর্শ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="কোন পরামর্শ খুঁজছেন? যেমন: 'ধান রক্ষা', 'গবাদিপশু', 'বীজ সংরক্ষণ'"
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-green-200 rounded-2xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-green-800 placeholder-green-400"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors"
            >
              খুঁজুন
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Topic Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-bold text-green-900">
                  পরামর্শের বিষয়
                </h2>
              </div>

              <div className="space-y-3">
                {পরামর্শ_বিষয়সমূহ.map((বিষয়) => {
                  const আইকন = বিষয়.icon;
                  const নির্বাচিত = selectedTopic === বিষয়.id;

                  return (
                    <button
                      key={বিষয়.id}
                      onClick={() => setSelectedTopic(বিষয়.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        নির্বাচিত
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-green-200 hover:border-green-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 bg-gradient-to-br ${বিষয়.color} rounded-lg`}
                        >
                          <আইকন className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-green-900">
                            {বিষয়.title}
                          </h3>
                          <p className="text-sm text-green-600">
                            {বিষয়.items.length} টি পরামর্শ
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Filter Options */}
              <div className="mt-8 pt-6 border-t border-green-200">
                <h3 className="font-medium text-green-800 mb-3">
                  ফিল্টার করুন
                </h3>
                <div className="space-y-2">
                  {["সকল", "ভিডিও", "পিডিএফ", "লাইভ", "প্রশিক্ষণ"].map(
                    (filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                          activeFilter === filter
                            ? "bg-green-100 text-green-700 font-medium"
                            : "text-green-700 hover:bg-green-50"
                        }`}
                      >
                        {filter}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Selected Topic Details */}
            {নির্বাচিত_বিষয় && (
              <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 bg-gradient-to-br ${নির্বাচিত_বিষয়.color} rounded-xl`}
                    >
                      <নির্বাচিত_বিষয়.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-green-900">
                        {নির্বাচিত_বিষয়.title}
                      </h2>
                      <p className="text-green-700">
                        বিস্তারিত পরামর্শ ও নির্দেশিকা
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      sendMessageToAI(
                        `${নির্বাচিত_বিষয়.title} সম্পর্কে বিস্তারিত জানতে চাই`,
                      )
                    }
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <Bot className="h-4 w-4" />
                    <span>AI কে জিজ্ঞাসা করুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {নির্বাচিত_বিষয়.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 hover:border-green-300 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg group-hover:bg-green-100 transition-colors">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-900">
                              {item.title}
                            </h4>
                            <p className="text-sm text-green-600 mt-1">
                              {item.details}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => sendMessageToAI(item.title)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-green-600 hover:text-green-700"
                        >
                          <Bot className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expert Advice */}
                <div className="space-y-4">
                  <h4 className="font-bold text-green-900 mb-2">
                    বিশেষজ্ঞ পরামর্শ
                  </h4>
                  {বিশেষজ্ঞ_পরামর্শ.map((expert, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-bold text-blue-800">
                            {expert.name}
                          </h5>
                          <p className="text-blue-600 text-sm">
                            {expert.designation}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            expert.available
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {expert.available ? "সহজলভ্য" : "ব্যস্ত"}
                        </span>
                      </div>
                      <p className="text-blue-700 text-sm mb-3">
                        "{expert.advice}"
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => contactExpert(expert)}
                          disabled={!expert.available}
                          className={`text-sm px-3 py-1 rounded-lg ${
                            expert.available
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          কল করুন
                        </button>
                        <button
                          onClick={() => sendMessageToAI(expert.advice)}
                          className="text-sm px-3 py-1 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                        >
                          AI কে জিজ্ঞাসা করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Gallery */}
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Video className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-bold text-green-900">
                    ভিডিও পরামর্শ
                  </h2>
                </div>
                <button
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/results?search_query=bangladesh+agriculture+flood",
                      "_blank",
                    )
                  }
                  className="text-green-600 hover:text-green-700 flex items-center gap-2"
                >
                  <span>আরও ভিডিও</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ভিডিও_পরামর্শ.map((video) => (
                  <div
                    key={video.id}
                    className="bg-gradient-to-br from-white to-green-50 rounded-xl border border-green-200 overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div
                      className="relative h-48 bg-gradient-to-br from-green-200 to-emerald-300 cursor-pointer"
                      onClick={() => playVideo(video)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="h-8 w-8 text-green-600 ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLikeVideo(video.id);
                          }}
                          className="p-1 bg-white/80 rounded"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              likedVideos.includes(video.id)
                                ? "text-red-500 fill-red-500"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-green-900 mb-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-green-600 mb-3">
                        {video.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-green-600">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {video.views}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => playVideo(video)}
                            className="text-green-600 hover:text-green-700 flex items-center gap-1"
                          >
                            <Play className="h-4 w-4" />
                            দেখুন
                          </button>
                          <button
                            onClick={() => sendMessageToAI(video.title)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Bot className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Downloads */}
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-bold text-green-900">
                    ডাউনলোডযোগ্য গাইড
                  </h2>
                </div>
                <button
                  onClick={() =>
                    window.open("https://www.dae.gov.bd/publications", "_blank")
                  }
                  className="text-green-600 hover:text-green-700 flex items-center gap-2"
                >
                  <span>সকল ডকুমেন্ট</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {ডকুমেন্ট_পরামর্শ.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-300 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-lg group-hover:bg-green-50 transition-colors">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-green-900">
                            {doc.title}
                          </h4>
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                            {doc.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-green-600">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {doc.pages} পৃষ্ঠা
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {doc.downloads.toLocaleString()} ডাউনলোড
                          </span>
                          <span className="flex items-center gap-1">
                            <FileDown className="h-3 w-3" />
                            {doc.size}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadDocument(doc)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                      >
                        <Download className="h-4 w-4" />
                        <span>ডাউনলোড</span>
                      </button>
                      <button
                        onClick={() =>
                          sendMessageToAI(
                            `${doc.title} সম্পর্কে বিস্তারিত জানতে চাই`,
                          )
                        }
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                      >
                        <Bot className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Sessions */}
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-bold text-green-900">
                    আসন্ন লাইভ সেশন
                  </h2>
                </div>
                <button className="text-green-600 hover:text-green-700 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>সকল রিমাইন্ডার</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-bold text-amber-900">
                        আজ, সন্ধ্যা ৭:০০ টা
                      </p>
                      <p className="text-sm text-amber-700">
                        বন্যা পরবর্তী ফসল পরিচর্যা
                      </p>
                    </div>
                  </div>
                  <p className="text-amber-800 mb-4">
                    বিশেষজ্ঞ কৃষিবিদের সাথে সরাসরি প্রশ্নোত্তর সেশন
                  </p>
                  <button
                    onClick={joinLiveSession}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
                  >
                    🔴 লাইভ দেখতে ক্লিক করুন
                  </button>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-bold text-purple-900">
                        কাল, সকাল ১০:০০ টা
                      </p>
                      <p className="text-sm text-purple-700">জৈব কৃষি পদ্ধতি</p>
                    </div>
                  </div>
                  <p className="text-purple-800 mb-4">
                    জৈব সার ও কীটনাশক ব্যবহারের বিশেষ সেশন
                  </p>
                  <button
                    onClick={() =>
                      sendMessageToAI("জৈব কৃষি পদ্ধতি সম্পর্কে জানতে চাই")
                    }
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                  >
                    🤖 AI কে জিজ্ঞাসা করুন
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => window.open("tel:16123", "_blank")}
                  className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex flex-col items-center"
                >
                  <Phone className="h-6 w-6 mb-1" />
                  <span className="text-sm">কৃষি হেল্পলাইন</span>
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/@bangladeshagriculture",
                      "_blank",
                    )
                  }
                  className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex flex-col items-center"
                >
                  <Video className="h-6 w-6 mb-1" />
                  <span className="text-sm">ইউটিউব চ্যানেল</span>
                </button>
                <button
                  onClick={() =>
                    window.open("https://www.dae.gov.bd", "_blank")
                  }
                  className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex flex-col items-center"
                >
                  <BookOpen className="h-6 w-6 mb-1" />
                  <span className="text-sm">সরকারি ওয়েবসাইট</span>
                </button>
                <button
                  onClick={() => sendMessageToAI("আপনার পরামর্শ চাই", true)}
                  className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex flex-col items-center"
                >
                  <Bot className="h-6 w-6 mb-1" />
                  <span className="text-sm">AI পরামর্শ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
