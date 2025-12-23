"use client";

import { useState, useRef } from "react";
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
  Droplets,
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
} from "lucide-react";
import { PiPlant } from "react-icons/pi";

const পরামর্শ_বিষয়সমূহ = [
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

const ভিডিও_পরামর্শ = [
  {
    id: 1,
    title: "ধান ক্ষেত বন্যা থেকে রক্ষার উপায়",
    duration: "১৫:৩০",
    views: "২৫,৪৩২",
    youtubeId: "C9WQ7E_6J-k", // Bangladeshi farming video
    description: "ধান ক্ষেত বন্যা থেকে রক্ষার আধুনিক ও ঐতিহ্যবাহী পদ্ধতি।",
  },
  {
    id: 2,
    title: "বন্যার সময় গবাদিপশু রক্ষা",
    duration: "১২:১৫",
    views: "১৮,৭৬৫",
    youtubeId: "eCzaDKYgedc", // Placeholder
    description: "গবাদিপশুর জন্য নিরাপদ আশ্রয় ও খাদ্য ব্যবস্থাপনা।",
  },
  {
    id: 3,
    title: "সবজি চাষে বিশেষ যত্ন",
    duration: "২০:১০",
    views: "৩২,১১০",
    youtubeId: "_fLOhZccnUg", // Bangladeshi vegetable farming
    description: "বন্যা মৌসুমে সবজি চাষের বিশেষ কৌশল ও পরিচর্যা।",
  },
  {
    id: 4,
    title: "বন্যা পরবর্তী মাটি পরীক্ষা",
    duration: "১৮:৪৫",
    views: "২২,৩৪৫",
    youtubeId: "_fLOhZccnUg", // Placeholder
    description: "বন্যার পর মাটির স্বাস্থ্য পরীক্ষা ও উন্নয়ন পদ্ধতি।",
  },
];

const ডকুমেন্ট_পরামর্শ = [
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

const বিশেষজ্ঞ_পরামর্শ = [
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

export default function AdvisoryCenterPage() {
  const [selectedTopic, setSelectedTopic] = useState("বন্যা_প্রস্তুতি");
  const [searchQuery, setSearchQuery] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [notification, setNotification] = useState("");
  const [copiedText, setCopiedText] = useState("");
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const [likedVideos, setLikedVideos] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState("সকল");

  const videoRef = useRef<HTMLVideoElement>(null);

  const নির্বাচিত_বিষয় = পরামর্শ_বিষয়সমূহ.find((t) => t.id === selectedTopic);

  // Search function
  const handleSearch = () => {
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
      showNotification(`"${searchQuery}" এর জন্য কোন ফলাফল পাওয়া যায়নি`);
    } else {
      showNotification(`${results.length} টি ফলাফল পাওয়া গেছে`);
    }
  };

  // Play video function
  const playVideo = (video: any) => {
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
  const downloadDocument = (doc: any) => {
    showNotification(`${doc.title} ডাউনলোড শুরু হয়েছে`);

    // Create a blob and download link
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

    // Update download count (in real app, update in database)
    showNotification(`${doc.title} সফলভাবে ডাউনলোড হয়েছে`);
  };

  // Set reminder for live session
  const setReminder = (sessionName: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      showNotification(`${sessionName} এর জন্য রিমাইন্ডার সেট করা হয়েছে`);
    } else if (
      "Notification" in window &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showNotification(`${sessionName} এর জন্য রিমাইন্ডার সেট করা হয়েছে`);
        }
      });
    }
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
  const contactExpert = (expert: any) => {
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

  // View details of advisory item
  const viewAdvisoryDetails = (item: any) => {
    const details = `
      ${item.title}
      
      বিস্তারিত:
      ${item.details}
      
      পরামর্শ:
      ১. নিয়মিত মনিটরিং করুন
      ২. স্থানীয় কৃষি অফিসের সাথে যোগাযোগ রাখুন
      ৩. সময়মতো পদক্ষেপ নিন
    `;

    alert(details);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Notification */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right-4">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
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
                    ref={videoRef as any}
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
            <BookOpen className="h-6 w-6" />
            <span className="text-lg font-semibold">পরামর্শ কেন্দ্র</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
            অভিজ্ঞ কৃষক ও বিশেষজ্ঞদের পরামর্শ
          </h1>
          <p className="text-green-700 text-lg max-w-3xl mx-auto">
            বন্যা মোকাবেলা থেকে শুরু করে ফসল রক্ষার সকল কৌশল একত্রে। ভিডিও,
            পিডিএফ এবং লাইভ পরামর্শের মাধ্যমে শিখুন।
          </p>
        </div>

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
            <div className="bangladeshi-card p-6 sticky top-24">
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

              {/* Copied Notification */}
              {copiedText && (
                <div className="mt-4 p-2 bg-green-100 text-green-700 text-sm rounded-lg text-center">
                  ✓ {copiedText} কপি করা হয়েছে
                </div>
              )}
            </div>
          </div>

          {/* ডান কলাম - বিষয়বস্তু */}
          <div className="lg:col-span-2 space-y-8">
            {/* নির্বাচিত বিষয়ের বিস্তারিত */}
            {নির্বাচিত_বিষয় && (
              <div className="bangladeshi-card p-6">
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
                    onClick={() => shareContent(নির্বাচিত_বিষয়.title, "বিষয়")}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                  >
                    <Share2 className="h-5 w-5" />
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
                          onClick={() => toggleSaveItem(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <Bookmark
                            className={`h-4 w-4 ${
                              savedItems.includes(index)
                                ? "text-green-600 fill-green-600"
                                : "text-green-400"
                            }`}
                          />
                        </button>
                      </div>
                      <button
                        onClick={() => viewAdvisoryDetails(item)}
                        className="w-full mt-3 text-sm text-green-600 hover:text-green-700 text-center"
                      >
                        বিস্তারিত দেখুন →
                      </button>
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
                          onClick={() =>
                            copyToClipboard(expert.contact, "নম্বর")
                          }
                          className="text-sm px-3 py-1 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                        >
                          নম্বর কপি
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ভিডিও গ্যালারি */}
            <div className="bangladeshi-card p-6">
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
                            onClick={(e) => {
                              e.stopPropagation();
                              shareContent(video.title, "ভিডিও");
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ডকুমেন্ট ডাউনলোড */}
            <div className="bangladeshi-card p-6">
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
                        onClick={() => toggleSaveItem(doc.id)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg"
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            savedItems.includes(doc.id)
                              ? "text-green-600 fill-green-600"
                              : "text-green-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* লাইভ সেশন */}
            <div className="bangladeshi-card p-6">
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
                    onClick={() => setReminder("জৈব কৃষি পদ্ধতি সেশন")}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                  >
                    ⏰ রিমাইন্ডার সেট করুন
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
                  onClick={() =>
                    window.open(
                      "https://play.google.com/store/apps/details?id=com.badc.dam",
                      "_blank"
                    )
                  }
                  className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex flex-col items-center"
                >
                  <Download className="h-6 w-6 mb-1" />
                  <span className="text-sm">মোবাইল অ্যাপ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
