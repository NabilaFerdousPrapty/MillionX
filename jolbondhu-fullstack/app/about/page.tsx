"use client";

import {
  Target,
  Users,
  Shield,
  Globe,
  Award,
  TrendingUp,
  Heart,
  Star,
  BookOpen,
  Lightbulb,
  HandHeart,
  Coffee,
} from "lucide-react";

const টিম_সদস্য = [
  {
    name: "ড. মোঃ আলী হোসেন",
    role: "প্রধান কৃষি বিশেষজ্ঞ",
    experience: "২০+ বছর",
    specialization: "বন্যা ব্যবস্থাপনা",
  },
  {
    name: "ইঞ্জিনিয়ার সুমাইয়া আক্তার",
    role: "এআই গবেষক",
    experience: "৮ বছর",
    specialization: "ডেটা সায়েন্স",
  },
  {
    name: "প্রফেসর আব্দুল করিম",
    role: "জলবায়ু বিশেষজ্ঞ",
    experience: "১৫ বছর",
    specialization: "জলবায়ু পরিবর্তন",
  },
  {
    name: "তানজিমা ইসলাম",
    role: "কৃষক সমন্বয়কারী",
    experience: "১০ বছর",
    specialization: "সম্প্রদায় উন্নয়ন",
  },
];

const অংশীদার_সংস্থা = [
  { name: "বাংলাদেশ কৃষি মন্ত্রণালয়", logo: "🇧🇩" },
  { name: "বাংলাদেশ আবহাওয়া অধিদপ্তর", logo: "⛈️" },
  { name: "বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট", logo: "🔬" },
  { name: "বাংলাদেশ কৃষি উন্নয়ন কর্পোরেশন", logo: "🌾" },
  { name: "জাতিসংঘ উন্নয়ন কর্মসূচি", logo: "🌍" },
  { name: "বিশ্ব খাদ্য কর্মসূচি", logo: "🍚" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-12">
        {/* হিরো সেকশন */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full text-white mb-8">
            <Target className="h-6 w-6" />
            <span className="text-lg font-semibold">জলবন্ধু সম্পর্কে</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-teal-900 mb-6">
            বাংলাদেশের কৃষকের বিশ্বস্ত সঙ্গী
          </h1>

          <p className="text-xl text-teal-700 max-w-3xl mx-auto leading-relaxed">
            ২০১৯ সাল থেকে জলবন্ধু বাংলাদেশের কৃষকদের জন্য এআই প্রযুক্তিভিত্তিক
            বন্যা পূর্বাভাস ও ফসল সুরক্ষা পরামর্শ প্রদান করে আসছে। আমাদের লক্ষ্য
            প্রতিটি কৃষকের ফসলকে প্রকৃতির প্রতিকূলতা থেকে রক্ষা করা।
          </p>
        </div>

        {/* আমাদের মিশন */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-8 text-white">
            <div className="inline-flex p-3 bg-white/20 rounded-xl mb-6">
              <Target className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">আমাদের লক্ষ্য</h3>
            <p>
              বাংলাদেশের প্রতিটি কৃষকের কাছে সঠিক সময়ে সঠিক বন্যা পূর্বাভাস
              পৌঁছে দেওয়া এবং ফসল রক্ষার ব্যবহারিক পরামর্শ প্রদান করা।
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
            <div className="inline-flex p-3 bg-white/20 rounded-xl mb-6">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">আমাদের প্রতিশ্রুতি</h3>
            <p>
              ৯৫%+ নির্ভুলতার সাথে বন্যা পূর্বাভাস দেওয়া এবং প্রতি মৌসুমে
              কৃষকের ক্ষতি ৫০% পর্যন্ত কমানো।
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white">
            <div className="inline-flex p-3 bg-white/20 rounded-xl mb-6">
              <Globe className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">আমাদের প্রভাব</h3>
            <p>
              ৬৪ জেলার ২৫,০০০+ কৃষকের ফসল সুরক্ষা এবং প্রতি বছর ৫০০+ কোটি টাকার
              ফসল ক্ষতি রোধ।
            </p>
          </div>
        </div>

        {/* আমাদের গল্প */}
        <div className="bangladeshi-card p-8 mb-16">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-8 w-8 text-teal-600" />
            <h2 className="text-3xl font-bold text-teal-900">আমাদের যাত্রা</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-teal-700 text-lg mb-6 leading-relaxed">
                ২০১৯ সালের ভয়াবহ বন্যার সময় লক্ষাধিক কৃষক তাদের ফসল
                হারিয়েছিলেন। এই দুর্ভোগ দেখে কয়েকজন তরুণ কৃষিবিদ ও
                প্রযুক্তিবিদ মিলে জলবন্ধু তৈরি করার সিদ্ধান্ত নেন।
              </p>

              <p className="text-teal-700 text-lg mb-6 leading-relaxed">
                প্রথমে শুধুমাত্র সিরাজগঞ্জ জেলায় পরীক্ষামূলকভাবে শুরু করা এই
                সেবা এখন বাংলাদেশের ৬৪টি জেলায় প্রসারিত হয়েছে। আমরা প্রতিদিন
                ৫০,০০০+ কৃষককে সেবা প্রদান করছি।
              </p>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-900">৫ বছর</div>
                  <div className="text-teal-700">অভিজ্ঞতা</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-900">৬৪টি</div>
                  <div className="text-teal-700">জেলা</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-900">২৫K+</div>
                  <div className="text-teal-700">কৃষক</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-gradient-to-br from-teal-100 to-cyan-200 p-8 rounded-3xl border-4 border-white">
                <div className="text-center">
                  <Lightbulb className="h-16 w-16 text-teal-600 mx-auto mb-4" />
                  <p className="text-teal-900 text-lg italic">
                    "প্রতিটি ফসল রক্ষা মানে একটি পরিবারের খাদ্য নিরাপত্তা
                    নিশ্চিত করা"
                  </p>
                  <p className="text-teal-700 mt-4">- জলবন্ধু টিম</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* আমাদের টিম */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full text-white mb-6">
              <Users className="h-6 w-6" />
              <span className="text-lg font-semibold">আমাদের বিশেষজ্ঞ টিম</span>
            </div>
            <h2 className="text-3xl font-bold text-emerald-900 mb-4">
              যাদের হাতে গড়া জলবন্ধু
            </h2>
            <p className="text-emerald-700 max-w-2xl mx-auto">
              অভিজ্ঞ কৃষিবিদ, প্রযুক্তিবিদ এবং গবেষকদের সমন্বয়ে গঠিত আমাদের টিম
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {টিম_সদস্য.map((সদস্য, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200"
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-bold text-emerald-900 text-lg">
                    {সদস্য.name}
                  </h3>
                  <p className="text-emerald-700">{সদস্য.role}</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-sm text-emerald-600">অভিজ্ঞতা</p>
                    <p className="font-medium text-emerald-900">
                      {সদস্য.experience}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-sm text-emerald-600">
                      বিশেষায়িত ক্ষেত্র
                    </p>
                    <p className="font-medium text-emerald-900">
                      {সদস্য.specialization}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* অংশীদার */}
        <div className="bangladeshi-card p-8 mb-16">
          <div className="flex items-center gap-3 mb-8">
            <HandHeart className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-blue-900">আমাদের অংশীদার</h2>
          </div>

          <p className="text-blue-700 text-lg mb-8 max-w-3xl">
            জলবন্ধুর সাফল্যের পিছনে রয়েছে সরকারি ও বেসরকারি সংস্থার সহযোগিতা।
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {অংশীদার_সংস্থা.map((সংস্থা, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200 text-center"
              >
                <div className="text-3xl mb-3">{সংস্থা.logo}</div>
                <p className="text-sm text-blue-900 font-medium">
                  {সংস্থা.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ভবিষ্যৎ পরিকল্পনা */}
        <div className="bangladeshi-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <h2 className="text-3xl font-bold text-purple-900">
              ভবিষ্যৎ পরিকল্পনা
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-purple-800 mb-6">
                ২০২৫ সালের লক্ষ্য
              </h3>
              <ul className="space-y-4">
                {[
                  "১০০,০০০+ কৃষকের কাছে পৌঁছানো",
                  "এসএমএস সার্ভিস চালু করা",
                  "অফলাইন মোবাইল অ্যাপ চালু",
                  "কৃষি বীমা সাথে সংযুক্তি",
                  "আঞ্চলিক ভাষায় সেবা প্রদান",
                ].map((লক্ষ্য, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full"></div>
                    <span className="text-purple-700">{লক্ষ্য}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-purple-800 mb-6">
                দীর্ঘমেয়াদী স্বপ্ন
              </h3>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <Coffee className="h-6 w-6 text-purple-600" />
                  <h4 className="font-bold text-purple-900">আমাদের স্বপ্ন</h4>
                </div>
                <p className="text-purple-700">
                  আমরা স্বপ্ন দেখি এমন বাংলাদেশের যেখানে কোন কৃষক বন্যার কারণে
                  ফসল হারাবে না। যেখানে প্রতিটি কৃষক প্রযুক্তির সাহায্যে সঠিক
                  সিদ্ধান্ত নিতে পারবে এবং সফলভাবে ফসল উৎপাদন করতে পারবে।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* সিএনটি */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full text-white mb-6">
            <Heart className="h-6 w-6" />
            <span className="text-lg font-semibold">আমাদের সাথে যুক্ত হোন</span>
          </div>

          <h2 className="text-3xl font-bold text-teal-900 mb-4">
            একসাথে গড়ি স্মার্ট বাংলাদেশ
          </h2>

          <p className="text-teal-700 text-lg max-w-2xl mx-auto mb-8">
            জলবন্ধু কৃষকের জন্য, কৃষকের দ্বারা এবং কৃষকের সহায়তায় কাজ করে।
            আপনিও আমাদের এই যাত্রার অংশ হোন।
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold">
              স্বেচ্ছাসেবক হোন
            </button>
            <button className="px-8 py-3 bg-white border-2 border-teal-200 text-teal-700 rounded-xl font-semibold">
              অনুদান দিন
            </button>
            <button className="px-8 py-3 bg-white border-2 border-teal-200 text-teal-700 rounded-xl font-semibold">
              অংশীদার হোন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
