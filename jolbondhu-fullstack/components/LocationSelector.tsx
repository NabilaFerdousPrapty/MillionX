"use client";

import { useState } from "react";
import { MapPin, Navigation, Search, ChevronDown } from "lucide-react";

const বাংলাদেশের_জেলা = [
  "সিরাজগঞ্জ",
  "কুড়িগ্রাম",
  "গাইবান্ধা",
  "বগুড়া",
  "জামালপুর",
  "সুনামগঞ্জ",
  "সিলেট",
  "নেত্রকোণা",
  "কিশোরগঞ্জ",
  "মুন্সীগঞ্জ",
  "শরীয়তপুর",
  "রংপুর",
  "নীলফামারী",
  "লালমনিরহাট",
  "দিনাজপুর",
  "ঠাকুরগাঁও",
  "টাঙ্গাইল",
  "ময়মনসিংহ",
  "শেরপুর",
  "নরসিংদী",
  "নারায়ণগঞ্জ",
];

const উপজেলা = {
  সিরাজগঞ্জ: ["সিরাজগঞ্জ সদর", "বেলকুচি", "চৌহালী", "কামারখন্দ", "রায়গঞ্জ"],
  কুড়িগ্রাম: [
    "কুড়িগ্রাম সদর",
    "রাজারহাট",
    "উলিপুর",
    "নাগেশ্বরী",
    "ভুরুঙ্গামারী",
  ],
  গাইবান্ধা: [
    "গাইবান্ধা সদর",
    "গোবিন্দগঞ্জ",
    "পলাশবাড়ী",
    "সুন্দরগঞ্জ",
    "সাদুল্লাপুর",
  ],
  সুনামগঞ্জ: ["সুনামগঞ্জ সদর", "দিরাই", "জগন্নাথপুর", "তাহিরপুর", "ধর্মপাশা"],
  সিলেট: [
    "সিলেট সদর",
    "বিয়ানীবাজার",
    "গোলাপগঞ্জ",
    "কোম্পানীগঞ্জ",
    "ফেঞ্চুগঞ্জ",
  ],
};

export default function LocationSelector() {
  const [নির্বাচিত_জেলা, নির্বাচিত_জেলা_সেটকরো] = useState("সিরাজগঞ্জ");
  const [নির্বাচিত_উপজেলা, নির্বাচিত_উপজেলা_সেটকরো] = useState("সিরাজগঞ্জ সদর");
  const [জিপিএস_ব্যবহার, জিপিএস_ব্যবহার_সেটকরো] = useState(false);
  const [জিপিএস_স্থান, জিপিএস_স্থান_সেটকরো] = useState("");

  const জিপিএস_চালুকরো = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          জিপিএস_স্থান_সেটকরো(
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          );
          জিপিএস_ব্যবহার_সেটকরো(true);
        },
        (error) => {
          alert("আপনার অবস্থান পাওয়া যায়নি। জিপিএস চালু করুন।");
        }
      );
    }
  };

  return (
    <div className="bangladeshi-card p-6 rice-field-bg relative overflow-hidden">
      {/* পটভূমি ডিজাইন */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-300 opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200 to-cyan-300 opacity-10 rounded-full translate-y-8 -translate-x-8"></div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-800">
              আপনার স্থান নির্বাচন করুন
            </h2>
            <p className="text-green-600">
              সঠিক তথ্য পেতে আপনার এলাকা নির্বাচন করুন
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* জেলা নির্বাচন */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              জেলা নির্বাচন করুন
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              <select
                value={নির্বাচিত_জেলা}
                onChange={(e) => নির্বাচিত_জেলা_সেটকরো(e.target.value)}
                className="w-full px-4 py-4 pr-12 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white text-green-800 font-medium"
              >
                {বাংলাদেশের_জেলা.map((জেলা) => (
                  <option key={জেলা} value={জেলা} className="py-2">
                    {জেলা}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 pointer-events-none" />
            </div>
          </div>

          {/* উপজেলা নির্বাচন */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              উপজেলা/থানা নির্বাচন করুন
            </label>
            <select
              value={নির্বাচিত_উপজেলা}
              onChange={(e) => নির্বাচিত_উপজেলা_সেটকরো(e.target.value)}
              className="w-full px-4 py-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-green-800 font-medium"
            >
              {উপজেলা[নির্বাচিত_জেলা as keyof typeof উপজেলা]?.map((উপজেলা) => (
                <option key={উপজেলা} value={উপজেলা}>
                  {উপজেলা}
                </option>
              ))}
            </select>
          </div>

          {/* ইউনিয়ন বা গ্রাম */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              ইউনিয়ন/গ্রাম (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="আপনার ইউনিয়ন বা গ্রামের নাম লিখুন"
              className="w-full px-4 py-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-green-800 placeholder-green-400"
            />
          </div>

          {/* জিপিএস অপশন */}
          <div className="pt-5 border-t border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  <Navigation className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-800">
                    জিপিএস অবস্থান ব্যবহার করুন
                  </p>
                  <p className="text-sm text-green-600">
                    আপনার বর্তমান অবস্থান স্বয়ংক্রিয়ভাবে নির্ধারণ করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => জিপিএস_ব্যবহার_সেটকরো(!জিপিএস_ব্যবহার)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  জিপিএস_ব্যবহার ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    জিপিএস_ব্যবহার ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {জিপিএস_ব্যবহার && (
              <div className="space-y-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={জিপিএস_স্থান}
                    placeholder="অক্ষাংশ, দ্রাঘিমাংশ"
                    className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg bg-white text-blue-800 font-mono"
                    readOnly
                  />
                  <button
                    onClick={জিপিএস_চালুকরো}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center gap-2"
                  >
                    <Navigation className="h-5 w-5" />
                    অবস্থান নির্ণয়
                  </button>
                </div>
                <p className="text-sm text-blue-600">
                  💡 আপনার সঠিক অবস্থান জানা থাকলে আরো নির্ভুল পূর্বাভাস পাবেন
                </p>
              </div>
            )}
          </div>

          {/* নির্বাচিত এলাকা দেখানো */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-green-800 text-lg">
                  নির্বাচিত এলাকা: {নির্বাচিত_উপজেলা}, {নির্বাচিত_জেলা}
                </p>
                {জিপিএস_ব্যবহার && জিপিএস_স্থান && (
                  <p className="text-sm text-green-600 mt-1">
                    📍 জিপিএস অবস্থান: {জিপিএস_স্থান}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                <p className="text-xs text-green-600">বন্যা ঝুঁকি এলাকা</p>
                <p className="font-bold text-green-800">উচ্চ</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                <p className="text-xs text-green-600">কৃষি জমি</p>
                <p className="font-bold text-green-800">৮৫%</p>
              </div>
            </div>
          </div>

          <button className="w-full farmer-button flex items-center justify-center gap-3 py-4">
            <MapPin className="h-5 w-5" />
            <span className="text-lg font-semibold">
              এই এলাকার পূর্বাভাস দেখুন
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
