"use client";

import { useState, useEffect } from "react";
import {
  Video,
  Play,
  Clock,
  Users,
  Download,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Filter,
  Search,
  Award,
  Star,
  Share2,
} from "lucide-react";

// Video Categories
const প্রশিক্ষণ_ক্যাটেগরি = [
  { id: "সকল", label: "সকল ভিডিও", count: 156 },
  { id: "বন্যা_প্রস্তুতি", label: "বন্যা প্রস্তুতি", count: 34 },
  { id: "ফসল_পরিচর্যা", label: "ফসল পরিচর্যা", count: 45 },
  { id: "রোগ_ব্যবস্থাপনা", label: "রোগ ব্যবস্থাপনা", count: 28 },
  { id: "আধুনিক_কৃষি", label: "আধুনিক কৃষি", count: 22 },
  { id: "সরকারি_সহায়তা", label: "সরকারি সহায়তা", count: 27 },
];

// FIXED: Using highly popular videos from Channel i / Deepto TV that usually allow embedding
const ভিডিও_তালিকা = [
  {
    id: 1,
    // Channel i: Floating Bed Cultivation (Baira Chash)
    youtubeId: "no6MJ5rdkx4",
    title: "বন্যা কবলিত এলাকায় ভাসমান বা বেড়া পদ্ধতিতে চাষাবাদ",
    duration: "১৫:৩০",
    views: "১২৫,৭৮৯",
    likes: "৫,৪৫৬",
    category: "বন্যা_প্রস্তুতি",
    instructor: "শাইখ সিরাজ (হৃদয়ে মাটি ও মানুষ)",
    level: "শুরু",
  },
  {
    id: 2,
    // Deepto Krishi: Cattle Safety
    youtubeId: "iR5nxvGUKQk",
    title: "বন্যার সময় গবাদিপশু সুরক্ষা ও খাদ্য ব্যবস্থাপনা",
    duration: "১২:১৫",
    views: "৩৪,৫৬৭",
    likes: "১,৮৯০",
    category: "ফসল_পরিচর্যা",
    instructor: "দীপ্ত কৃষি",
    level: "মধ্যম",
  },
  {
    id: 3,
    // Vermicompost Tutorial (Generic Popular)

    youtubeId: "SbM8P1CC7Ew",
    title: "জৈব সার তৈরির পদ্ধতি | দুর্গন্ধহীন কম্পোস্ট সার তৈরি",
    duration: "১৮:৪৫",
    views: "৭৮,৯০১",
    likes: "৩,৪৫৬",
    category: "আধুনিক_কৃষি",
    instructor: "শাইখ সিরাজ",
    level: "শুরু",
  },
  {
    id: 4,
    // Modern Farming / Soil (Channel i)
    youtubeId: "k_RiNPKJNdE",
    title: "আধুনিক কৃষি ও মাটি ব্যবস্থাপনা",
    duration: "২২:১০",
    views: "২৩,৪৫৬",
    likes: "১,২৩৪",
    category: "ফসল_পরিচর্যা",
    instructor: "কৃষি সম্প্রসারণ অধিদপ্তর",
    level: "উন্নত",
  },
  {
    id: 5,
    // Biofloc / Govt Help (Generic)
    youtubeId: "TAGKEWH74NQ",
    title: "আধুনিক প্রযুক্তিতে মাছ উৎপাদনের নতুন দিগন্ত",
    duration: "২০:৩০",
    views: "৪৫,৬৭৮",
    likes: "২,৩৪৫",
    category: "সরকারি_সহায়তা",
    instructor: "মৎস্য অধিদপ্তর",
    level: "মধ্যম",
  },
  {
    id: 6,
    // Rice Disease (Deepto)
    youtubeId: "DuRnMy-obfQ",
    title: "ধানের ব্লাস্ট রোগ ও তার প্রতিকার",
    duration: "১০:১৫",
    views: "৬৭,৮৯০",
    likes: "৩,৬৭৮",
    category: "রোগ_ব্যবস্থাপনা",
    instructor: "ড. সুমাইয়া আক্তার",
    level: "উন্নত",
  },
];

const বিশেষ_কোর্স = [
  {
    title: "বন্যা মোকাবেলা বিশেষজ্ঞ কোর্স",
    duration: "১২ ঘন্টা",
    modules: 8,
    students: 2345,
    certificate: true,
  },
  {
    title: "জৈব কৃষি মাস্টারক্লাস",
    duration: "১৫ ঘন্টা",
    modules: 10,
    students: 1890,
    certificate: true,
  },
  {
    title: "আধুনিক সেচ পদ্ধতি",
    duration: "৮ ঘন্টা",
    modules: 6,
    students: 1567,
    certificate: false,
  },
];

export default function TrainingPage() {
  const [selectedCategory, setSelectedCategory] = useState("সকল");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [origin, setOrigin] = useState("");

  // Set origin on mount to fix hydration mismatch and provide correct origin to YouTube
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const নির্বাচিত_ভিডিও = ভিডিও_তালিকা.find((v) => v.id === selectedVideo);

  const filteredVideos = ভিডিও_তালিকা.filter((video) => {
    const matchesCategory =
      selectedCategory === "সকল" || video.category === selectedCategory;
    const matchesSearch = video.title.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleVideoSelect = (id) => {
    setSelectedVideo(id);
    setIsPlaying(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-purple-50 font-bangla">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full text-white mb-6 shadow-lg shadow-violet-200">
            <Video className="h-6 w-6" />
            <span className="text-lg font-semibold">প্রশিক্ষণ ভিডিও</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-violet-900 mb-4">
            আপনার দক্ষতা বৃদ্ধির জন্য বিনামূল্যে কোর্স
          </h1>
          <p className="text-violet-700 text-lg max-w-3xl mx-auto">
            অভিজ্ঞ কৃষিবিদদের সরাসরি ক্লাস, ব্যবহারিক ভিডিও টিউটোরিয়াল এবং
            সার্টিফিকেট কোর্সের মাধ্যমে নিজের দক্ষতা বৃদ্ধি করুন।
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Player */}
          <div className="lg:col-span-2">
            <div className="bangladeshi-card bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="aspect-video bg-black relative">
                {isPlaying && নির্বাচিত_ভিডিও ? (
                  /* FIXED: Added 'origin' to src to allow localhost playback */
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${নির্বাচিত_ভিডিও.youtubeId}?autoplay=1&origin=${origin}`}
                    title={নির্বাচিত_ভিডিও.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  // Thumbnail View
                  <div className="relative w-full h-full group cursor-pointer">
                    <img
                      src={`https://img.youtube.com/vi/${নির্বাচিত_ভিডিও?.youtubeId}/maxresdefault.jpg`}
                      onError={(e) => {
                        // Fallback image if maxres doesn't exist
                        e.target.src = `https://img.youtube.com/vi/${নির্বাচিত_ভিডিও?.youtubeId}/hqdefault.jpg`;
                      }}
                      alt={নির্বাচিত_ভিডিও?.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div
                        onClick={() => setIsPlaying(true)}
                        className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg"
                      >
                        <Play className="h-10 w-10 text-violet-600 ml-1 fill-current" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded backdrop-blur-sm">
                      {নির্বাচিত_ভিডিও?.duration}
                    </div>
                  </div>
                )}
              </div>

              {নির্বাচিত_ভিডিও && (
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-violet-900 mb-2">
                        {নির্বাচিত_ভিডিও.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-violet-700">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {নির্বাচিত_ভিডিও.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {নির্বাচিত_ভিডিও.likes}
                        </span>
                        <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
                          {নির্বাচিত_ভিডিও.level}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-violet-600 hover:bg-violet-50 rounded-full transition-colors">
                        <Share2 className="h-6 w-6" />
                      </button>
                      <button className="p-2 text-violet-600 hover:bg-violet-50 rounded-full transition-colors">
                        <Bookmark className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6 pt-4 border-t border-violet-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {নির্বাচিত_ভিডিও.instructor.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-violet-900">
                          {নির্বাচিত_ভিডিও.instructor}
                        </p>
                        <p className="text-sm text-violet-700">প্রশিক্ষক</p>
                      </div>
                    </div>
                    <button className="ml-auto px-6 py-2 bg-violet-100 text-violet-700 hover:bg-violet-200 font-medium rounded-lg transition-colors">
                      ফলো করুন
                    </button>
                  </div>

                  <div className="bg-violet-50 p-5 rounded-xl border border-violet-100">
                    <h4 className="font-bold text-violet-900 mb-2">
                      কোর্স বিবরণ
                    </h4>
                    <p className="text-violet-700 leading-relaxed">
                      এই ভিডিওতে আপনি শিখবেন কিভাবে আধুনিক পদ্ধতিতে কৃষি কাজ
                      পরিচালনা করতে হয়। বিশেষজ্ঞ নির্দেশনায় প্রতিটি ধাপ
                      বিস্তারিতভাবে আলোচনা করা হয়েছে।
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Special Courses */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-bold text-amber-900">
                  সার্টিফিকেট কোর্স
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {বিশেষ_কোর্স.map((course, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-amber-900 leading-tight">
                        {course.title}
                      </h3>
                      {course.certificate && (
                        <Star className="h-5 w-5 text-amber-500 fill-current flex-shrink-0" />
                      )}
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-2 text-sm text-amber-800">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-amber-800">
                        <Bookmark className="h-4 w-4" />
                        <span>{course.modules} টি মডিউল</span>
                      </div>
                    </div>

                    <button className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-700 transition-all">
                      কোর্সে যোগ দিন
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-violet-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="কোর্স বা বিষয় খুঁজুন..."
                  className="w-full pl-10 pr-4 py-3 bg-violet-50 border border-violet-100 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none text-violet-900 placeholder-violet-400 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-violet-600" />
                  <h3 className="font-medium text-violet-900">ক্যাটেগরি</h3>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {প্রশিক্ষণ_ক্যাটেগরি.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all ${
                        selectedCategory === category.id
                          ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                          : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                      }`}
                    >
                      <span>{category.label}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          selectedCategory === category.id
                            ? "bg-white/20"
                            : "bg-violet-200"
                        }`}
                      >
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Video List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-violet-900">সম্পর্কিত ভিডিও</h3>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoSelect(video.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all hover:shadow-md ${
                      selectedVideo === video.id
                        ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                        : "border-gray-100 hover:border-violet-200 bg-white"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/default.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                          {video.duration}
                        </div>
                        {selectedVideo === video.id && isPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-medium text-sm mb-1 line-clamp-2 ${
                            selectedVideo === video.id
                              ? "text-violet-700"
                              : "text-gray-800"
                          }`}
                        >
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{video.views} বার দেখা</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Session */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-6 w-6 text-red-600" />
                <h3 className="font-bold text-red-900">লাইভ সেশন</h3>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="font-bold text-red-600 text-sm">
                    লাইভ চলছে
                  </span>
                </div>

                <h4 className="font-bold text-red-900 mb-2">
                  বন্যা পূর্বাভাস বিশ্লেষণ
                </h4>
                <div className="flex items-center justify-between text-xs text-red-700 mb-4 font-medium">
                  <span>👥 ২৩৪ জন দেখছেন</span>
                </div>

                <button className="w-full py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 shadow-md shadow-red-200">
                  এখনই যোগ দিন
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
