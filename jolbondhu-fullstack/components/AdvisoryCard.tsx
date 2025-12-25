"use client";

import { AlertCircle, Sprout, Shield, Package, Phone } from "lucide-react";

const recommendations = [
  {
    icon: AlertCircle,
    title: "জরুরি পদক্ষেপ",
    color: "bg-red-50 text-red-700",
    items: [
      "আগামী ২-৩ দিন চারা রোপণ কার্যক্রম স্থগিত রাখুন",
      "সম্ভব হলে পরিপক্ক ফসল দ্রুত সংগ্রহ করুন",
      "সংরক্ষিত ধান বা শস্য উঁচু স্থানে নিরাপদ রাখুন",
    ],
  },
  {
    icon: Shield,
    title: "ফসল সুরক্ষা",
    color: "bg-blue-50 text-blue-700",
    items: [
      "দণ্ডায়মান ফসলের জন্য সিলিকন-ভিত্তিক অ্যান্টি-স্ট্রেস সার ব্যবহার করুন",
      "সবজি চাষের জন্য ভাসমান বীজতলা পদ্ধতি অনুসরণ করুন",
      "জমির সীমানার চারপাশে পানি নিষ্কাশন নালা তৈরি করুন",
    ],
  },
  {
    icon: Sprout,
    title: "বন্যা পরবর্তী পুনরুদ্ধার",
    color: "bg-emerald-50 text-emerald-700",
    items: [
      "পানি নেমে যাওয়ার সাথে সাথে জমি থেকে পলি ও আবর্জনা পরিষ্কার করুন",
      "মাটির গঠন ঠিক করতে পরিমাণমতো জিপসাম সার প্রয়োগ করুন",
      "প্রয়োজনে দ্রুত বর্ধনশীল বা স্বল্পমেয়াদী জাতের ফসল পুনরায় বপন করুন",
    ],
  },
  {
    icon: Package,
    title: "উপকরণ ব্যবস্থাপনা",
    color: "bg-amber-50 text-amber-700",
    items: [
      "সার ও কীটনাশক সবসময় জলরোধী পাত্রে বা বস্তায় রাখুন",
      "গবাদি পশুদের দ্রুত নিকটস্থ উঁচু আশ্রয়কেন্দ্রে সরিয়ে নিন",
      "কৃষি যন্ত্রপাতি ও সেচ সরঞ্জাম নিরাপদ স্থানে মজুত করুন",
    ],
  },
];

export default function AdvisoryCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Sprout className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          কৃষি পরামর্শ (ফার্ম অ্যাডভাইজরি)
        </h2>
      </div>

      {/* Current Context */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-900">
            <p>
              <span className="font-bold">বর্তমান ফসল:</span> বোরো ধান
              <span className="ml-1 text-xs bg-blue-200 px-2 py-0.5 rounded-full">
                (চারা রোপণ পর্যায়)
              </span>
            </p>
            <p>
              <span className="font-bold">বর্তমান মৌসুম:</span> রবি মৌসুম
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {recommendations.map((category, index) => (
          <div
            key={index}
            className="group border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${category.color}`}>
                <category.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-900">{category.title}</h3>
            </div>
            <ul className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="flex items-start gap-2 group-hover:translate-x-1 transition-transform"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 " />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h4 className="font-bold text-red-800">জরুরি যোগাযোগ</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Phone className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                কৃষি সম্প্রসারণ অধিদপ্তর
              </p>
              <p className="text-sm font-bold text-gray-800">০১৭XX-XXXXXX</p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-red-200 pt-3 sm:pt-0 sm:pl-6">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Phone className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                দুর্যোগ ব্যবস্থাপনা কল সেন্টার
              </p>
              <p className="text-sm font-bold text-gray-800 ">
                ১০৯০ (টোল ফ্রি)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
