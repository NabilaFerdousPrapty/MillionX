"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
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

interface AIChatResponse {
  status: string;
  response: {
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
  };
}

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: string;
  windSpeed: number;
  condition: string;
  forecast: string[];
}

const API_BASE = "http://127.0.0.1:8000";

export default function AdvisoryCenterPage() {
  const [selectedTopic, setSelectedTopic] = useState("বন্যা_প্রস্তুতি");
  const [searchQuery, setSearchQuery] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoAdvisory | null>(
    null
  );
  const [notification, setNotification] = useState("");
  const [copiedText, setCopiedText] = useState("");
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const [likedVideos, setLikedVideos] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState("সকল");
  const [aiResponse, setAiResponse] = useState<AIChatResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [askAiQuestion, setAskAiQuestion] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<
    Array<{ type: "user" | "ai"; content: string; timestamp: Date }>
  >([]);
  const [isListening, setIsListening] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [showFollowUps, setShowFollowUps] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const aiChatRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const streamControllerRef = useRef<AbortController | null>(null);

  // Initial data
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
          setAskAiQuestion(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          showNotification("ভয়েস রিকগনিশনে সমস্যা হয়েছে");
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // DeepSeek AI Integration with Streaming Support
  const askAI = async (question: string, useStreaming = false) => {
    if (!question.trim()) {
      showNotification("অনুগ্রহ করে কিছু লিখুন");
      return;
    }

    setIsAiLoading(true);
    if (useStreaming) {
      setIsStreaming(true);
      setStreamedText("");
    }

    const timestamp = new Date();
    setAiChatHistory((prev) => [
      ...prev,
      { type: "user", content: question, timestamp },
    ]);

    try {
      if (useStreaming) {
        // Streaming request
        streamControllerRef.current = new AbortController();

        const response = await fetch(
          `${API_BASE}/chat/stream?question=${encodeURIComponent(question)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "text/event-stream",
            },
            signal: streamControllerRef.current.signal,
          }
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
                  setAiChatHistory((prev) => [
                    ...prev,
                    {
                      type: "ai",
                      content: accumulatedAnswer,
                      timestamp: new Date(),
                    },
                  ]);
                  setStreamedText("");
                  break;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    accumulatedAnswer += parsed.content;
                    setStreamedText(accumulatedAnswer);
                  }
                  if (parsed.done) {
                    setIsStreaming(false);
                    setAiChatHistory((prev) => [
                      ...prev,
                      {
                        type: "ai",
                        content: accumulatedAnswer,
                        timestamp: new Date(),
                      },
                    ]);
                    setStreamedText("");
                    break;
                  }
                } catch (e) {
                  console.log("Non-JSON data:", data);
                }
              }
            }
          }
        }
      } else {
        // Normal request
        const response = await fetch(`${API_BASE}/chat/farmer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            location: location,
            stream: false,
          }),
        });

        const data = await response.json();

        if (data.status === "success") {
          setAiResponse(data);
          setAiChatHistory((prev) => [
            ...prev,
            {
              type: "ai",
              content: data.response.answer,
              timestamp: new Date(),
            },
          ]);
          setShowFollowUps(true);
          showNotification("AI পরামর্শ প্রস্তুত!");
        } else {
          throw new Error("Failed to get AI response");
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      showNotification("AI পরামর্শ পাওয়া যায়নি। আবার চেষ্টা করুন।");

      // Fallback response
      const fallbackResponse: AIChatResponse = {
        status: "success",
        response: {
          question,
          topic: "agriculture",
          answer: `🤖 **আপনার প্রশ্নের উত্তর:**\n\n${question} সম্পর্কে আমার পরামর্শ হলো:\n\n১. স্থানীয় কৃষি অফিসের সাথে যোগাযোগ করুন\n২. অভিজ্ঞ কৃষকের পরামর্শ নিন\n৩. আমাদের ভিডিও গ্যালারি থেকে সংশ্লিষ্ট ভিডিও দেখুন\n\nআরও নির্দিষ্ট প্রশ্ন করুন: "ধান চাষের খরচ কত?", "বন্যার সময় ফসল বাচাবো কিভাবে?"`,
          confidence: 75,
          sources: ["বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট"],
          follow_up_questions: [
            "ধান চাষের খরচ কত?",
            "বন্যার সময় ফসল বাচাবো কিভাবে?",
            "কৃষি ঋণ পেতে কি করতে হবে?",
          ],
        },
      };

      setAiResponse(fallbackResponse);
      setAiChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          content: fallbackResponse.response.answer,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsAiLoading(false);
      setIsStreaming(false);
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

  // Stop streaming
  const stopStreaming = () => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      setIsStreaming(false);
      if (streamedText) {
        setAiChatHistory((prev) => [
          ...prev,
          { type: "ai", content: streamedText, timestamp: new Date() },
        ]);
      }
      setStreamedText("");
    }
  };

  // Search function with AI enhancement
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
            item.details.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ),
      ...ভিডিও_পরামর্শ.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
      ...ডকুমেন্ট_পরামর্শ.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    ];

    if (results.length === 0) {
      showNotification(
        `"${searchQuery}" এর জন্য কোন ফলাফল পাওয়া যায়নি। AI এর সাহায্য নিন।`
      );
      // Auto-ask AI if no results found
      await askAI(searchQuery);
    } else {
      showNotification(`${results.length} টি ফলাফল পাওয়া গেছে`);

      // Also ask AI for general advice
      if (
        searchQuery.includes("কীভাবে") ||
        searchQuery.includes("কিভাবে") ||
        searchQuery.includes("উপায়")
      ) {
        setTimeout(() => {
          askAI(searchQuery);
        }, 1000);
      }
    }
  };

  // Play video function
  const playVideo = (video: VideoAdvisory) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  // Close video modal
  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
    if (videoRef.current) {
      videoRef.current.pause();
    }
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

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 2000);
      showNotification(`${label} কপি করা হয়েছে`);
    });
  };

  // Share content
  const shareContent = (title: string, type: string) => {
    const shareText = `JolBondhu পরামর্শ: ${title}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: `${type} - JolBondhu`,
        text: shareText,
        url: shareUrl,
      });
    } else {
      copyToClipboard(`${shareText}\n${shareUrl}`, "লিঙ্ক");
    }
  };

  // Save item
  const toggleSaveItem = (id: number) => {
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );

    const action = savedItems.includes(id) ? "আনসেভ" : "সেভ";
    showNotification(`সফলভাবে ${action} করা হয়েছে`);
  };

  // Like video
  const toggleLikeVideo = (id: number) => {
    setLikedVideos((prev) =>
      prev.includes(id)
        ? prev.filter((videoId) => videoId !== id)
        : [...prev, id]
    );
  };

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  // Contact expert
  const contactExpert = (expert: ExpertAdvisory) => {
    if (expert.available) {
      const confirmCall = window.confirm(
        `${expert.name} কে কল করবেন?\n\nনম্বর: ${expert.contact}\n\nক্লিক করুন 'ঠিক আছে' কল করার জন্য।`
      );

      if (confirmCall) {
        window.open(`tel:${expert.contact}`, "_blank");
      }
    } else {
      showNotification(`${expert.name} বর্তমানে ব্যস্ত আছেন। পরে চেষ্টা করুন।`);
    }
  };

  // Join live session
  const joinLiveSession = () => {
    const sessionLink = "https://meet.google.com/bng-farmers";
    window.open(sessionLink, "_blank", "noopener,noreferrer");
    showNotification("লাইভ সেশনে যোগদান করা হচ্ছে...");
  };

  // Filter content based on active filter
  const getFilteredContent = () => {
    switch (activeFilter) {
      case "ভিডিও":
        return ভিডিও_পরামর্শ;
      case "পিডিএফ":
        return ডকুমেন্ট_পরামর্শ;
      case "লাইভ":
        return ["আসন্ন লাইভ সেশন: বন্যা পরবর্তী ফসল পরিচর্যা"];
      case "প্রশিক্ষণ":
        return ["আসন্ন প্রশিক্ষণ: জৈব কৃষি পদ্ধতি"];
      default:
        return [...ভিডিও_পরামর্শ, ...ডকুমেন্ট_পরামর্শ];
    }
  };

  // Clear AI response
  const clearAIResponse = () => {
    setAiResponse(null);
    setAiChatHistory([]);
    setAskAiQuestion("");
    setShowFollowUps(false);
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
                    ✕
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

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleLikeVideo(selectedVideo.id)}
                      className={`p-2 rounded-lg ${
                        likedVideos.includes(selectedVideo.id)
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Heart className="h-5 w-5" />
                    </button>
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
          </div>
        )}

        {/* হেডার */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white mb-6">
            <Bot className="h-6 w-6" />
            <span className="text-lg font-semibold">AI পরামর্শ কেন্দ্র</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
            AI সহ অভিজ্ঞ বিশেষজ্ঞদের পরামর্শ
          </h1>
          <p className="text-green-700 text-lg max-w-3xl mx-auto">
            DeepSeek AI এর সাথে বন্যা মোকাবেলা থেকে শুরু করে ফসল রক্ষার সকল
            কৌশল। ভিডিও, পিডিএফ এবং AI পরামর্শের মাধ্যমে শিখুন।
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
                    askAI("আজকের আবহাওয়ায় কী ফসলের যত্ন নেব?", true)
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

        {/* AI Chat Assistant Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-900">
                JolBondhu AI Assistant
              </h2>
              <p className="text-blue-700">বিনামূল্যে কৃষি পরামর্শ পান</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600">অনলাইন</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl border border-blue-200 h-96 overflow-hidden flex flex-col">
                {/* Chat Messages */}
                <div ref={aiChatRef} className="flex-1 overflow-y-auto p-4">
                  {aiChatHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-blue-600">
                        আপনার কৃষি সম্পর্কিত প্রশ্ন করুন
                      </p>
                      <p className="text-sm text-blue-500 mt-2">
                        যেমন: "ধান চাষের খরচ কত?"
                      </p>
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() => startListening()}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2 mx-auto"
                        >
                          <Mic className="h-4 w-4" />
                          ভয়েস ইনপুট
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiChatHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${
                            msg.type === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              msg.type === "user"
                                ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-br-none"
                                : "bg-blue-50 text-blue-900 rounded-bl-none border border-blue-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {msg.type === "user" ? (
                                  <>
                                    <span className="text-xs opacity-80">
                                      আপনি
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Bot className="h-3 w-3 text-blue-600" />
                                    <span className="text-xs opacity-80">
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
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Streaming Response */}
                      {isStreaming && streamedText && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] bg-blue-50 rounded-2xl rounded-bl-none px-4 py-3 border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Bot className="h-3 w-3 text-blue-600" />
                              <span className="text-xs opacity-80">
                                JolBondhu AI
                              </span>
                              <div className="flex gap-1">
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                              </div>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              {streamedText.split("\n").map((line, i) => (
                                <p key={i} className={i > 0 ? "mt-2" : ""}>
                                  {line}
                                </p>
                              ))}
                            </div>
                            <button
                              onClick={stopStreaming}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                            >
                              থামান
                            </button>
                          </div>
                        </div>
                      )}

                      {isAiLoading && !isStreaming && (
                        <div className="flex justify-start">
                          <div className="bg-blue-50 rounded-2xl rounded-bl-none px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                              <span className="text-sm text-blue-600">
                                চিন্তা করছি...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-blue-200 bg-white">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      askAI(askAiQuestion);
                    }}
                    className="flex gap-2"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={askAiQuestion}
                        onChange={(e) => setAskAiQuestion(e.target.value)}
                        placeholder="আপনার প্রশ্ন লিখুন বা ভয়েস ব্যবহার করুন..."
                        className="w-full px-4 py-3 pr-24 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isAiLoading}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <button
                          type="button"
                          onClick={isListening ? stopListening : startListening}
                          className={`p-2 rounded ${
                            isListening
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {isListening ? (
                            <MicOff className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => askAI(askAiQuestion, true)}
                          disabled={isAiLoading || !askAiQuestion.trim()}
                          className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          <Zap className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isAiLoading || !askAiQuestion.trim()}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isAiLoading && !isStreaming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">প্রেরণ করুন</span>
                    </button>
                  </form>

                  {/* Follow-up Questions */}
                  {showFollowUps &&
                    aiResponse?.response.follow_up_questions && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-sm text-blue-600 mb-2">
                          সংশ্লিষ্ট প্রশ্ন:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {aiResponse.response.follow_up_questions
                            .slice(0, 3)
                            .map((q, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setAskAiQuestion(q);
                                  askAI(q);
                                }}
                                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                              >
                                {q}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* AI Quick Actions */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3">দ্রুত প্রশ্ন</h3>
                <div className="space-y-2">
                  {[
                    "ধান চাষের খরচ কত?",
                    "বন্যার সময় ফসল বাচাবো কিভাবে?",
                    "সার প্রয়োগের নিয়ম কি?",
                    "কৃষি ঋণ কিভাবে পাব?",
                  ].map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAskAiQuestion(question);
                        askAI(question);
                      }}
                      className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {aiResponse && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-green-900">AI বিশ্লেষণ</h3>
                    <button
                      onClick={clearAIResponse}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                  <div className="text-sm text-green-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      <span>আস্থার হার: {aiResponse.response.confidence}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-3 w-3" />
                      <span className="text-xs">
                        সূত্র:{" "}
                        {aiResponse.response.sources.slice(0, 2).join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs">
                        টোকেন:{" "}
                        {aiResponse.response.metadata?.tokens_used || "N/A"}
                      </span>
                    </div>
                    <button
                      onClick={() => askAI(aiResponse.response.question, true)}
                      className="w-full mt-2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      রিয়েল-টাইম আপডেট
                    </button>
                  </div>
                </div>
              )}

              {/* Location Services */}
              <div className="bg-white p-4 rounded-xl border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3">
                  অবস্থান পরিষেবা
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            setLocation(`lat:${lat},lon:${lon}`);
                            showNotification("অবস্থান সেট করা হয়েছে");
                            askAI("আমার এলাকার জন্য ফসল পরামর্শ দিন");
                          },
                          (error) => {
                            console.error("Geolocation error:", error);
                            showNotification("অবস্থান পাওয়া যায়নি");
                          }
                        );
                      }
                    }}
                    className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    আমার এলাকার আবহাওয়া
                  </button>
                  <button
                    onClick={() => fetchWeatherData()}
                    className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors flex items-center gap-2"
                  >
                    <CloudRain className="h-4 w-4" />
                    আবহাওয়া আপডেট
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of your existing UI remains the same */}
        {/* ... [Rest of your existing UI code] ... */}

        {/* সার্চ বার */}
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
          {/* বাম কলাম - বিষয় নির্বাচন */}
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

              {/* ফিল্টার অপশন */}
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
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ডান কলাম - বিষয়বস্তু */}
          <div className="lg:col-span-2 space-y-8">
            {/* নির্বাচিত বিষয়ের বিস্তারিত */}
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
                      askAI(
                        `${নির্বাচিত_বিষয়.title} সম্পর্কে বিস্তারিত জানতে চাই`
                      )
                    }
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-colors flex items-center gap-2"
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
                            <p className="text-sm text-green-600 mt-1 line-clamp-2">
                              {item.details}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => askAI(item.title)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-blue-600 hover:text-blue-700"
                        >
                          <Bot className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* বিশেষজ্ঞ পরামর্শ */}
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
                          onClick={() => askAI(expert.advice)}
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

            {/* ভিডিও গ্যালারি */}
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
                      "_blank"
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
                            onClick={() => askAI(video.title)}
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

            {/* ডকুমেন্ট ডাউনলোড */}
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
                          askAI(`${doc.title} সম্পর্কে বিস্তারিত জানতে চাই`)
                        }
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                      >
                        <Bot className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* লাইভ সেশন */}
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
                    onClick={() => askAI("জৈব কৃষি পদ্ধতি সম্পর্কে জানতে চাই")}
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
                      "_blank"
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
                  onClick={() => askAI("আপনার পরামর্শ চাই", true)}
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
