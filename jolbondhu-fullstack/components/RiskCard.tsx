"use client";

import {
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Droplets,
} from "lucide-react";

interface RiskCardProps {
  level: "নিম্ন" | "মধ্যম" | "উচ্চ" | "অতি_উচ্চ";
  score: number;
  confidence: number;
  nextUpdate: string;
}

export default function RiskCard({
  level = "উচ্চ",
  score = 75,
  confidence = 85,
  nextUpdate = "২ ঘন্টা পর",
}: RiskCardProps) {
  const ঝুঁকি_কনফিগ = {
    নিম্ন: {
      color: "bg-emerald-100 text-emerald-800",
      icon: CheckCircle,
      title: "নিম্ন ঝুঁকি",
      description: "স্বাভাবিক কৃষিকাজ চালিয়ে যেতে পারেন",
      gradient: "risk-low",
      advice: "ফসল রোপণ ও পরিচর্যা চালিয়ে যান",
    },
    মধ্যম: {
      color: "bg-amber-100 text-amber-800",
      icon: Info,
      title: "মধ্যম ঝুঁকি",
      description: "পরিস্থিতি নিবিড়ভাবে পর্যবেক্ষণ করুন",
      gradient: "risk-medium",
      advice: "অতিরিক্ত সতর্কতা অবলম্বন করুন",
    },
    উচ্চ: {
      color: "bg-red-100 text-red-800",
      icon: AlertTriangle,
      title: "উচ্চ ঝুঁকি",
      description: "তাৎক্ষণিক প্রতিরোধমূলক ব্যবস্থা নিন",
      gradient: "risk-high",
      advice: "জরুরি সতর্কতা অনুসরণ করুন",
    },
    অতি_উচ্চ: {
      color: "bg-red-900 text-red-100",
      icon: AlertTriangle,
      title: "অতি উচ্চ ঝুঁকি",
      description: "জীবন ও সম্পদের ঝুঁকি, অবিলম্বে ব্যবস্থা নিন",
      gradient: "risk-severe",
      advice: "অবিলম্বে নিরাপদ স্থানে যান",
    },
  };

  const কনফিগ = ঝুঁকি_কনফিগ[level];
  const আইকন = কনফিগ.icon;

  return (
    <div className="bangladeshi-card p-6 relative overflow-hidden">
      {/* পটভূমি এ্যানিমেশন */}
      <div
        className={`absolute top-0 right-0 w-48 h-48 ${কনফিগ.gradient} opacity-5 rounded-full -translate-y-12 translate-x-12`}
      />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-200 to-emerald-300 opacity-10 rounded-full translate-y-8 -translate-x-8" />

      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 ${কনফিগ.color} rounded-2xl`}>
              <আইকন className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-900">
                {কনফিগ.title}
              </h2>
              <p className="text-green-700">{কনফিগ.description}</p>
              <p className="text-sm text-green-600 mt-1">💡 {কনফিগ.advice}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-green-900">{score}%</div>
            <div className="text-sm text-green-600">ঝুঁকি স্কোর</div>
          </div>
        </div>

        <div className="space-y-6">
          {/* ঝুঁকি প্রগ্রেস বার */}
          <div>
            <div className="flex justify-between text-sm text-green-700 mb-2">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                ঝুঁকির মাত্রা
              </span>
              <span>{confidence}% নির্ভরযোগ্যতা</span>
            </div>
            <div className="h-3 bg-green-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${কনফিগ.gradient} rounded-full transition-all duration-1000`}
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-green-600 mt-2 px-1">
              <span>নিম্ন</span>
              <span>মধ্যম</span>
              <span>উচ্চ</span>
              <span className="text-red-600">অতি উচ্চ</span>
            </div>
          </div>

          {/* ঝুঁকি কারণসমূহ */}
          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              ঝুঁকির কারণসমূহ
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "বৃষ্টিপাত",
                  value: "৪৫ মিমি",
                  status: "উচ্চ",
                  color: "bg-red-100 text-red-800",
                },
                {
                  label: "নদীর পানি",
                  value: "বাড়ছে",
                  status: "মধ্যম",
                  color: "bg-amber-100 text-amber-800",
                },
                {
                  label: "মাটির আর্দ্রতা",
                  value: "৮৫%",
                  status: "উচ্চ",
                  color: "bg-red-100 text-red-800",
                },
                {
                  label: "উজানের প্রবাহ",
                  value: "বাড়ছে",
                  status: "মধ্যম",
                  color: "bg-amber-100 text-amber-800",
                },
                {
                  label: "বাতাসের গতি",
                  value: "১২ কিমি/ঘ",
                  status: "নিম্ন",
                  color: "bg-emerald-100 text-emerald-800",
                },
                {
                  label: "আবহাওয়া পূর্বাভাস",
                  value: "বৃষ্টি",
                  status: "উচ্চ",
                  color: "bg-red-100 text-red-800",
                },
              ].map((কারণ, সূচক) => (
                <div
                  key={সূচক}
                  className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-green-700">{কারণ.label}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${কারণ.color} font-medium`}
                    >
                      {কারণ.status}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-green-900">
                    {কারণ.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* সময় এবং আপডেট */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-600">পরবর্তী আপডেট</p>
              <p className="font-bold text-blue-800">{nextUpdate}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-600">কার্যকরী সময়</p>
              <p className="font-bold text-amber-800">আগামী ৩ দিন</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
              <p className="text-xs text-emerald-600">শেষ আপডেট</p>
              <p className="font-bold text-emerald-800">১ ঘন্টা আগে</p>
            </div>
          </div>

          {/* জরুরি নোটিশ */}
          {level === "উচ্চ" || level === "অতি_উচ্চ" ? (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-bold text-red-800">🚨 জরুরি সতর্কতা</p>
                  <p className="text-sm text-red-700">
                    উচ্চ বন্যা ঝুঁকি রয়েছে। ফসল ও গবাদিপশু রক্ষার জন্য অবিলম্বে
                    ব্যবস্থা নিন।
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
