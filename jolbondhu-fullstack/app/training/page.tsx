"use client";

import { useState } from "react";
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
} from "lucide-react";

const প্রশিক্ষণ_ক্যাটেগরি = [
  { id: "সকল", label: "সকল ভিডিও", count: 156 },
  { id: "বন্যা_প্রস্তুতি", label: "বন্যা প্রস্তুতি", count: 34 },
  { id: "ফসল_পরিচর্যা", label: "ফসল পরিচর্যা", count: 45 },
  { id: "রোগ_ব্যবস্থাপনা", label: "রোগ ব্যবস্থাপনা", count: 28 },
  { id: "আধুনিক_কৃষি", label: "আধুনিক কৃষি", count: 22 },
  { id: "সরকারি_সহায়তা", label: "সরকারি সহায়তা", count: 27 },
];

const ভিডিও_তালিকা = [
  {
    id: 1,
    title: "ধান ক্ষেত বন্যা থেকে রক্ষার সম্পূর্ণ গাইড",
    duration: "২৫:৩০",
    views: "৫৬,৭৮৯",
    likes: "২,৪৫৬",
    category: "বন্যা_প্রস্তুতি",
    instructor: "ড. মোঃ আলী হোসেন",
    level: "শুরু",
    thumbnail:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
  },
  {
    id: 2,
    title: "বন্যার সময় গবাদিপশু সুরক্ষা পদ্ধতি",
    duration: "১৮:১৫",
    views: "৩৪,৫৬৭",
    likes: "১,৮৯০",
    category: "ফসল_পরিচর্যা",
    instructor: "ড. সুমাইয়া আক্তার",
    level: "মধ্যম",
    thumbnail:
      "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400",
  },
  {
    id: 3,
    title: "জৈব সার তৈরির সহজ পদ্ধতি",
    duration: "১৫:৪৫",
    views: "৭৮,৯০১",
    likes: "৩,৪৫৬",
    category: "আধুনিক_কৃষি",
    instructor: "প্রফেসর আব্দুল করিম",
    level: "শুরু",
    thumbnail:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400",
  },
  {
    id: 4,
    title: "বন্যা পরবর্তী মাটি পরীক্ষা ও উন্নয়ন",
    duration: "২২:১০",
    views: "২৩,৪৫৬",
    likes: "১,২৩৪",
    category: "ফসল_পরিচর্যা",
    instructor: "ড. মোঃ আলী হোসেন",
    level: "উন্নত",
    thumbnail:
      "https://images.unsplash.com/photo-1591213953507-5a5c6c332b0d?w=400",
  },
  {
    id: 5,
    title: "কৃষি বীমা দাবি করার সম্পূর্ণ প্রক্রিয়া",
    duration: "২০:৩০",
    views: "৪৫,৬৭৮",
    likes: "২,৩৪৫",
    category: "সরকারি_সহায়তা",
    instructor: "তানজিমা ইসলাম",
    level: "মধ্যম",
    thumbnail:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400",
  },
  {
    id: 6,
    title: "ধান রোগ চেনা ও প্রতিকার",
    duration: "৩০:১৫",
    views: "৬৭,৮৯০",
    likes: "৩,৬৭৮",
    category: "রোগ_ব্যবস্থাপনা",
    instructor: "ড. সুমাইয়া আক্তার",
    level: "উন্নত",
    thumbnail:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
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

  const নির্বাচিত_ভিডিও = ভিডিও_তালিকা.find((v) => v.id === selectedVideo);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* হেডার */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full text-white mb-6">
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
          {/* বাম কলাম - ভিডিও প্লেয়ার এবং বিস্তারিত */}
          <div className="lg:col-span-2">
            {/* ভিডিও প্লেয়ার */}
            <div className="bangladeshi-card p-6 mb-8">
              <div className="aspect-video bg-gradient-to-br from-violet-200 to-purple-300 rounded-2xl mb-6 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <Play className="h-12 w-12 text-violet-600 ml-2" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded">
                  {নির্বাচিত_ভিডিও?.duration}
                </div>
                <div className="absolute top-4 right-4 bg-violet-600 text-white text-xs px-2 py-1 rounded">
                  লাইভ
                </div>
              </div>

              {নির্বাচিত_ভিডিও && (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-violet-900 mb-2">
                        {নির্বাচিত_ভিডিও.title}
                      </h2>
                      <div className="flex items-center gap-4 text-violet-700">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {নির্বাচিত_ভিডিও.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {নির্বাচিত_ভিডিও.likes}
                        </span>
                        <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm">
                          {নির্বাচিত_ভিডিও.level}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 text-violet-600 hover:text-violet-700">
                      <Bookmark className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-violet-900">
                          {নির্বাচিত_ভিডিও.instructor}
                        </p>
                        <p className="text-sm text-violet-700">প্রশিক্ষক</p>
                      </div>
                    </div>
                    <button className="ml-auto px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg">
                      ফলো করুন
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200">
                    <h4 className="font-bold text-violet-900 mb-2">
                      কোর্স বিবরণ
                    </h4>
                    <p className="text-violet-700">
                      এই ভিডিওতে আপনি শিখবেন কিভাবে বন্যার সময় ধানের ক্ষেত
                      রক্ষা করতে হয়, কি ধরনের ব্যবস্থা নিতে হয় এবং বন্যা
                      পরবর্তী কি করণীয়।
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* বিশেষ কোর্স */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-bold text-amber-900">
                  সার্টিফিকেট কোর্স
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {বিশেষ_কোর্স.map((course, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-amber-900">
                        {course.title}
                      </h3>
                      {course.certificate && (
                        <Star className="h-5 w-5 text-amber-500 fill-current" />
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-amber-700">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-amber-700">
                        <Bookmark className="h-4 w-4" />
                        <span>{course.modules} টি মডিউল</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-amber-700">
                        <Users className="h-4 w-4" />
                        <span>{course.students} জন শিক্ষার্থী</span>
                      </div>
                    </div>

                    <button className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg">
                      কোর্সে যোগ দিন
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ডান কলাম - ভিডিও তালিকা */}
          <div className="space-y-6">
            {/* সার্চ এবং ফিল্টার */}
            <div className="bangladeshi-card p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-violet-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="কোর্স বা বিষয় খুঁজুন..."
                  className="w-full pl-10 pr-4 py-3 bg-violet-50 border-2 border-violet-200 rounded-xl focus:border-violet-500 outline-none text-violet-800 placeholder-violet-400"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-violet-600" />
                  <h3 className="font-medium text-violet-900">ক্যাটেগরি</h3>
                </div>

                <div className="space-y-2">
                  {প্রশিক্ষণ_ক্যাটেগরি.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg ${
                        selectedCategory === category.id
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                          : "bg-violet-100 text-violet-800 hover:bg-violet-200"
                      }`}
                    >
                      <span>{category.label}</span>
                      <span className="text-xs px-2 py-1 bg-white/20 rounded">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ভিডিও তালিকা */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-violet-900">সম্পর্কিত ভিডিও</h3>
                <button className="text-violet-600 hover:text-violet-700 text-sm">
                  সব দেখুন →
                </button>
              </div>

              <div className="space-y-4">
                {ভিডিও_তালিকা.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedVideo === video.id
                        ? "border-violet-500 bg-violet-50"
                        : "border-violet-200 hover:border-violet-300"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-16 bg-gradient-to-br from-violet-200 to-purple-300 rounded-lg"></div>
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                          {video.duration}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-violet-900 mb-1 line-clamp-2">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-violet-600">
                          <span>{video.views} দেখেছেন</span>
                          <span>{video.likes} লাইক</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-violet-100 text-violet-800 rounded">
                            {video.level}
                          </span>
                          <span className="text-xs text-violet-700">
                            {video.instructor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ডাউনলোড উপকরণ */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Download className="h-6 w-6 text-emerald-600" />
                <h3 className="font-bold text-emerald-900">ডাউনলোড উপকরণ</h3>
              </div>

              <div className="space-y-3">
                {[
                  { title: "কোর্স নোটস PDF", size: "২.৩ MB" },
                  { title: "প্রাকটিস শিট", size: "১.৮ MB" },
                  { title: "পরীক্ষার প্রশ্ন", size: "১.২ MB" },
                  { title: "সার্টিফিকেট নমুনা", size: "০.৯ MB" },
                ].map((material, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <Download className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-900">
                          {material.title}
                        </p>
                        <p className="text-xs text-emerald-700">
                          {material.size}
                        </p>
                      </div>
                    </div>
                    <button className="text-emerald-600 hover:text-emerald-700">
                      ডাউনলোড
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* লাইভ সেশন */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-6 w-6 text-red-600" />
                <h3 className="font-bold text-red-900">আজকের লাইভ সেশন</h3>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-red-800">লাইভ চলছে</span>
                </div>

                <h4 className="font-bold text-red-900 mb-2">
                  বন্যা পূর্বাভাস বিশ্লেষণ
                </h4>
                <p className="text-sm text-red-700 mb-4">
                  বিশেষজ্ঞের সাথে সরাসরি আলোচনা
                </p>

                <div className="flex items-center justify-between text-sm text-red-700 mb-4">
                  <span>👥 ২৩৪ জন অনলাইনে</span>
                  <span>⏰ ১:৩০ ঘন্টা চলছে</span>
                </div>

                <button className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg">
                  🔴 এখনই যোগ দিন
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
