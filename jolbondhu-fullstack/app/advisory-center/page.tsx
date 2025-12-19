"use client";

import { useState } from "react";
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
} from "lucide-react";
import { PiPlant } from "react-icons/pi";

const পরামর্শ_বিষয়সমূহ = [
  {
    id: "বন্যা_প্রস্তুতি",
    title: "বন্যা পূর্ব প্রস্তুতি",
    icon: Shield,
    color: "from-blue-500 to-cyan-600",
    items: [
      "ফসল রক্ষার জরুরি পদক্ষেপ",
      "গবাদিপশু সুরক্ষা",
      "বীজ ও সার সংরক্ষণ",
      "কৃষি যন্ত্রপাতি সুরক্ষা",
    ],
  },
  {
    id: "ফসল_পরিচর্যা",
    title: "বন্যার সময় ফসল পরিচর্যা",
    icon: PiPlant,
    color: "from-green-500 to-emerald-600",
    items: [
      "ধানের বিশেষ যত্ন",
      "সবজি চাষ পদ্ধতি",
      "ফল গাছ রক্ষা",
      "মাটির পরিচর্যা",
    ],
  },
  {
    id: "বন্যা_পরবর্তী",
    title: "বন্যা পরবর্তী ব্যবস্থাপনা",
    icon: CheckCircle,
    color: "from-emerald-500 to-teal-600",
    items: [
      "ক্ষতি মূল্যায়ন",
      "পুনরায় চাষাবাদ",
      "মাটির উন্নয়ন",
      "সরকারি সাহায্য",
    ],
  },
  {
    id: "রোগ_ব্যবস্থাপনা",
    title: "রোগ ও পোকামাকড় ব্যবস্থাপনা",
    icon: AlertTriangle,
    color: "from-amber-500 to-yellow-600",
    items: [
      "সাধারণ রোগ চেনা",
      "জৈবিক নিয়ন্ত্রণ",
      "রাসায়নিক স্প্রে",
      "প্রতিরোধক ব্যবস্থা",
    ],
  },
];

const ভিডিও_পরামর্শ = [
  {
    id: 1,
    title: "ধান ক্ষেত বন্যা থেকে রক্ষার উপায়",
    duration: "১৫:৩০",
    views: "২৫,৪৩২",
    thumbnail:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
  },
  {
    id: 2,
    title: "বন্যার সময় গবাদিপশু রক্ষা",
    duration: "১২:১৫",
    views: "১৮,৭৬৫",
    thumbnail:
      "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w-400",
  },
  {
    id: 3,
    title: "সবজি চাষে বিশেষ যত্ন",
    duration: "২০:১০",
    views: "৩২,১১০",
    thumbnail:
      "https://images.unsplash.com/photo-1591213953507-5a5c6c332b0d?w=400",
  },
  {
    id: 4,
    title: "বন্যা পরবর্তী মাটি পরীক্ষা",
    duration: "১৮:৪৫",
    views: "২২,৩৪৫",
    thumbnail:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400",
  },
];

const ডকুমেন্ট_পরামর্শ = [
  {
    title: "বন্যা মোকাবেলা গাইডলাইন ২০২৪",
    size: "২.৫ MB",
    pages: 24,
    downloads: 15432,
  },
  {
    title: "ফসল রক্ষায় জরুরি পদক্ষেপ",
    size: "১.৮ MB",
    pages: 18,
    downloads: 12456,
  },
  {
    title: "কৃষি বীমা দাবি প্রক্রিয়া",
    size: "৩.২ MB",
    pages: 32,
    downloads: 8765,
  },
  {
    title: "সরকারি সাহায্য আবেদন পদ্ধতি",
    size: "২.১ MB",
    pages: 21,
    downloads: 15678,
  },
];

export default function AdvisoryCenterPage() {
  const [selectedTopic, setSelectedTopic] = useState("বন্যা_প্রস্তুতি");
  const [searchQuery, setSearchQuery] = useState("");

  const নির্বাচিত_বিষয় = পরামর্শ_বিষয়সমূহ.find((t) => t.id === selectedTopic);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
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
              placeholder="কোন পরামর্শ খুঁজছেন? যেমন: 'ধান রক্ষা', 'গবাদিপশু', 'বীজ সংরক্ষণ'"
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-green-200 rounded-2xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-green-800 placeholder-green-400"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg">
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
                          ? "border-green-500 bg-green-50"
                          : "border-green-200 hover:border-green-300"
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
                        className="w-full px-4 py-2 text-left text-green-700 hover:bg-green-50 rounded-lg"
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
              <div className="bangladeshi-card p-6">
                <div className="flex items-center gap-3 mb-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {নির্বাচিত_বিষয়.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900">{item}</h4>
                          <p className="text-sm text-green-600 mt-1">
                            বিস্তারিত জানতে ক্লিক করুন
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <h4 className="font-bold text-blue-800">
                      বিশেষজ্ঞ পরামর্শ
                    </h4>
                  </div>
                  <p className="text-blue-700">
                    "বন্যার আগে ধানের ক্ষেত থেকে পানি নিষ্কাশনের ব্যবস্থা করুন।
                    জমিতে অতিরিক্ত সেচ দেবেন না। বীজতলা উঁচু জায়গায় তৈরি
                    করুন।"
                  </p>
                  <p className="text-blue-600 text-sm mt-2">
                    - ড. মোঃ আলী হোসেন, কৃষি বিশেষজ্ঞ
                  </p>
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
                <button className="text-green-600 hover:text-green-700 flex items-center gap-2">
                  <span>সকল ভিডিও</span>
                  <span>→</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ভিডিও_পরামর্শ.map((video) => (
                  <div
                    key={video.id}
                    className="bg-gradient-to-br from-white to-green-50 rounded-xl border border-green-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-green-200 to-emerald-300">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-green-600 ml-1"></div>
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-green-900 mb-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-green-600">
                        <span>👁 {video.views} দেখেছেন</span>
                        <button className="text-green-600 hover:text-green-700">
                          ▶ দেখুন
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ডকুমেন্ট ডাউনলোড */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-green-900">
                  ডাউনলোডযোগ্য গাইড
                </h2>
              </div>

              <div className="space-y-4">
                {ডকুমেন্ট_পরামর্শ.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-lg">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900">
                          {doc.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-green-600">
                          <span>📄 {doc.pages} পৃষ্ঠা</span>
                          <span>
                            📊 {doc.downloads.toLocaleString()} ডাউনলোড
                          </span>
                          <span>💾 {doc.size}</span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700">
                      <Download className="h-4 w-4" />
                      <span>ডাউনলোড</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* লাইভ সেশন */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-green-900">
                  আসন্ন লাইভ সেশন
                </h2>
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
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-medium">
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
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium">
                    ⏰ রিমাইন্ডার সেট করুন
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
