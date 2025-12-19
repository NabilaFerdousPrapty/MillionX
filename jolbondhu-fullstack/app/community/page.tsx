"use client";

import { useState } from "react";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Share2,
  Send,
  Filter,
  TrendingUp,
  Award,
  Coffee,
  MapPin,
  Calendar,
  BookOpen,
  Video,
} from "lucide-react";

const কৃষক_তথ্য = [
  {
    id: 1,
    name: "মোঃ রফিকুল ইসলাম",
    location: "সিরাজগঞ্জ সদর",
    crops: ["ধান", "গম", "আলু"],
    experience: "১৫ বছর",
    posts: 42,
    likes: 256,
    avatar:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200",
  },
  {
    id: 2,
    name: "আয়েশা বেগম",
    location: "বেলকুচি",
    crops: ["সবজি", "ফল"],
    experience: "৮ বছর",
    posts: 28,
    likes: 189,
    avatar:
      "https://images.unsplash.com/photo-1593104547480-1ae5e5d16a5c?w=200",
  },
  {
    id: 3,
    name: "করিম উদ্দিন",
    location: "কামারখন্দ",
    crops: ["ধান", "পাট"],
    experience: "২২ বছর",
    posts: 67,
    likes: 421,
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200",
  },
  {
    id: 4,
    name: "সালমা খাতুন",
    location: "রায়গঞ্জ",
    crops: ["মসলা", "ফুল"],
    experience: "১২ বছর",
    posts: 35,
    likes: 234,
    avatar:
      "https://images.unsplash.com/photo-1594824434340-7e7dfc37cabb?w=200",
  },
];

const সম্প্রদায়_পোস্ট = [
  {
    id: 1,
    farmer: "মোঃ রফিকুল ইসলাম",
    time: "২ ঘন্টা আগে",
    content:
      "আজ আমার ধানের ক্ষেতে বন্যার পানি উঠেছে। কোন বিশেষজ্ঞ বলতে পারবেন কিভাবে ক্ষতি কমাতে পারি?",
    likes: 24,
    comments: 8,
    shares: 3,
    tags: ["বন্যা", "ধান", "জরুরি"],
  },
  {
    id: 2,
    farmer: "আয়েশা বেগম",
    time: "৫ ঘন্টা আগে",
    content:
      "বন্যার পর সবজি চাষের জন্য বিশেষ পদ্ধতি শেয়ার করছি। আমার ৫ বিঘা জমিতে সফলভাবে প্রয়োগ করেছি।",
    likes: 45,
    comments: 12,
    shares: 7,
    tags: ["সবজি_চাষ", "বন্যা_পরবর্তী", "সফলতা"],
  },
  {
    id: 3,
    farmer: "করিম উদ্দিন",
    time: "১ দিন আগে",
    content:
      "জলবন্ধুর পূর্বাভাসের জন্য ধন্যবাদ। সময়মতো ফসল তুলতে পেরে ২ লক্ষ টাকার ক্ষতি থেকে রক্ষা পেয়েছি।",
    likes: 89,
    comments: 23,
    shares: 15,
    tags: ["সাফল্য", "প্রশংসা", "ফসল_রক্ষা"],
  },
  {
    id: 4,
    farmer: "সালমা খাতুন",
    time: "২ দিন আগে",
    content:
      "কে জানে বন্যার সময় টমেটো চাষের বিশেষ যত্ন সম্পর্কে? আমার ৩ বিঘা জমির টমেটো বাঁচাতে সাহায্য করুন।",
    likes: 18,
    comments: 6,
    shares: 2,
    tags: ["টমেটো", "সাহায্য", "বিশেষ_যত্ন"],
  },
];

const ইভেন্ট_তালিকা = [
  {
    title: "বন্যা মোকাবেলা কর্মশালা",
    date: "১৫ জুলাই",
    time: "সকাল ১০:০০",
    location: "সিরাজগঞ্জ সদর",
    participants: 45,
  },
  {
    title: "জৈব কৃষি প্রদর্শনী",
    date: "২০ জুলাই",
    time: "বিকাল ৩:০০",
    location: "বেলকুচি",
    participants: 32,
  },
  {
    title: "কৃষক সম্মেলন ২০২৪",
    date: "২৫ জুলাই",
    time: "সকাল ৯:০০",
    location: "কামারখন্দ",
    participants: 120,
  },
];

export default function CommunityPage() {
  const [newPost, setNewPost] = useState("");
  const [activeFilter, setActiveFilter] = useState("সকল");

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* হেডার */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-white mb-6">
            <Users className="h-6 w-6" />
            <span className="text-lg font-semibold">কৃষক সম্প্রদায়</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
            একসাথে শেখা, একসাথে বেড়ে ওঠা
          </h1>
          <p className="text-amber-700 text-lg max-w-3xl mx-auto">
            বাংলাদেশের কৃষকদের নিজস্ব সামাজিক মাধ্যম। অভিজ্ঞতা শেয়ার করুন,
            সমস্যার সমাধান খুঁজুন, এবং সম্প্রদায়ের সাথে যুক্ত হন।
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* বাম কলাম - প্রোফাইল এবং ইভেন্ট */}
          <div className="lg:col-span-1 space-y-6">
            {/* আপনার প্রোফাইল */}
            <div className="bangladeshi-card p-6">
              <div className="text-center mb-6">
                <div className="inline-block relative mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mx-auto"></div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                    <span className="text-white font-bold">+</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-amber-900">
                  আপনার প্রোফাইল
                </h2>
                <p className="text-amber-700">অনুগ্রহ করে লগইন করুন</p>
              </div>

              <button className="w-full farmer-button flex items-center justify-center gap-2 py-3 mb-4">
                <Users className="h-5 w-5" />
                <span>লগইন / রেজিস্টার</span>
              </button>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-700">পোস্ট</span>
                  <span className="font-bold text-amber-900">০</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-700">অনুসরণকারী</span>
                  <span className="font-bold text-amber-900">০</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-700">লাইক</span>
                  <span className="font-bold text-amber-900">০</span>
                </div>
              </div>
            </div>

            {/* শীর্ষ কৃষক */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Award className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-amber-900">
                  এই মাসের শীর্ষ কৃষক
                </h3>
              </div>

              <div className="space-y-4">
                {কৃষক_তথ্য.slice(0, 3).map((কৃষক) => (
                  <div
                    key={কৃষক.id}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-900">
                        {কৃষক.name}
                      </h4>
                      <p className="text-xs text-amber-700">{কৃষক.location}</p>
                      <div className="flex gap-1 mt-1">
                        {কৃষক.crops.map((crop, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-white rounded"
                          >
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-900 font-bold">
                        {কৃষক.posts}
                      </div>
                      <div className="text-xs text-amber-700">পোস্ট</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* আসন্ন ইভেন্ট */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-green-900">আসন্ন ইভেন্ট</h3>
              </div>

              <div className="space-y-4">
                {ইভেন্ট_তালিকা.map((event, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-green-900">
                        {event.title}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        {event.participants} জন
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {event.date}, {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-lg">
                      যোগ দিন
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* সম্প্রদায় পরিসংখ্যান */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-blue-900">
                  সম্প্রদায় পরিসংখ্যান
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-900">১২,৪৫০</div>
                  <div className="text-sm text-blue-700">সক্রিয় কৃষক</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-900">
                    ৩৪,৫৬৭
                  </div>
                  <div className="text-sm text-purple-700">মোট পোস্ট</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-900">
                    ২,৩৪৫
                  </div>
                  <div className="text-sm text-emerald-700">সমস্যার সমাধান</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <div className="text-2xl font-bold text-amber-900">১৫৬</div>
                  <div className="text-sm text-amber-700">সফল কেস</div>
                </div>
              </div>
            </div>
          </div>

          {/* ডান কলাম - ফিড এবং ইন্টারঅ্যাকশন */}
          <div className="lg:col-span-2 space-y-6">
            {/* নতুন পোস্ট */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-bold text-amber-900">
                  আপনার অভিজ্ঞতা শেয়ার করুন
                </h2>
              </div>

              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="আপনার প্রশ্ন, অভিজ্ঞতা বা পরামর্শ শেয়ার করুন..."
                className="w-full h-32 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-amber-800 placeholder-amber-400"
              />

              <div className="flex flex-wrap gap-3 mt-4">
                {["বন্যা", "ফসল", "সমস্যা", "সফলতা", "প্রশ্ন"].map((tag) => (
                  <button
                    key={tag}
                    className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200"
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-3">
                  <button className="p-2 text-amber-600 hover:text-amber-700">
                    <BookOpen className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-amber-600 hover:text-amber-700">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-amber-600 hover:text-amber-700">
                    <MapPin className="h-5 w-5" />
                  </button>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg">
                  <Send className="h-4 w-4" />
                  <span>পোস্ট করুন</span>
                </button>
              </div>
            </div>

            {/* ফিল্টার বার */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("সকল")}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === "সকল"
                    ? "bg-amber-500 text-white"
                    : "bg-white text-amber-700 border border-amber-200"
                }`}
              >
                সকল
              </button>
              {[
                "জনপ্রিয়",
                "সাম্প্রতিক",
                "অমীমাংসিত",
                "সফলতা",
                "ভিডিও",
                "ছবি",
              ].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg ${
                    activeFilter === filter
                      ? "bg-amber-500 text-white"
                      : "bg-white text-amber-700 border border-amber-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
              <div className="ml-auto">
                <Filter className="h-5 w-5 text-amber-600" />
              </div>
            </div>

            {/* পোস্ট ফিড */}
            <div className="space-y-6">
              {সম্প্রদায়_পোস্ট.map((post) => (
                <div key={post.id} className="bangladeshi-card p-6">
                  {/* পোস্ট হেডার */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full"></div>
                      <div>
                        <h4 className="font-bold text-amber-900">
                          {post.farmer}
                        </h4>
                        <p className="text-sm text-amber-700">{post.time}</p>
                      </div>
                    </div>
                    <button className="p-2 text-amber-600 hover:text-amber-700">
                      ...
                    </button>
                  </div>

                  {/* পোস্ট কন্টেন্ট */}
                  <p className="text-amber-800 mb-4">{post.content}</p>

                  {/* ট্যাগস */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* ইন্টারঅ্যাকশন স্ট্যাটস */}
                  <div className="flex items-center justify-between text-sm text-amber-700 mb-4">
                    <div className="flex items-center gap-4">
                      <span>{post.likes} টি লাইক</span>
                      <span>{post.comments} টি মন্তব্য</span>
                      <span>{post.shares} শেয়ার</span>
                    </div>
                  </div>

                  {/* ইন্টারঅ্যাকশন বাটন */}
                  <div className="flex border-t border-amber-200 pt-4">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 text-amber-600 hover:text-amber-700">
                      <ThumbsUp className="h-5 w-5" />
                      <span>লাইক</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 text-amber-600 hover:text-amber-700">
                      <MessageSquare className="h-5 w-5" />
                      <span>মন্তব্য</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 text-amber-600 hover:text-amber-700">
                      <Share2 className="h-5 w-5" />
                      <span>শেয়ার</span>
                    </button>
                  </div>

                  {/* মন্তব্য সেকশন */}
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="মন্তব্য লিখুন..."
                        className="flex-1 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg outline-none"
                      />
                      <button className="px-4 py-2 bg-amber-500 text-white rounded-lg">
                        পাঠান
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* কফি চ্যাট */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Coffee className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-bold text-orange-900">
                  কফি চ্যাট - সরাসরি আলোচনা
                </h2>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-orange-900">
                      আজকের টপিক: বন্যা পরবর্তী মাটি উন্নয়ন
                    </p>
                    <p className="text-sm text-orange-700">
                      ২৩ জন অনলাইনে আছেন
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        i % 2 === 0 ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-2xl ${
                          i % 2 === 0
                            ? "bg-white text-orange-800"
                            : "bg-orange-500 text-white"
                        }`}
                      >
                        <p>বন্যার পর মাটিতে কি সার দিলে ভালো হবে?</p>
                        <p className="text-xs opacity-75 mt-1">২ মিনিট আগে</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="মেসেজ লিখুন..."
                    className="flex-1 px-4 py-2 bg-white border border-orange-200 rounded-lg"
                  />
                  <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg">
                    পাঠান
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
