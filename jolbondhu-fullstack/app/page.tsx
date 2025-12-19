"use client";

import { useState } from "react";
import {
  CloudRain,
  Shield,
  Leaf,
  Droplets,
  AlertTriangle,
  Phone,
  MessageSquare,
  Download,
  Share2,
  Bell,
  Clock,
  Users,
  BarChart3,
  MapPin,
} from "lucide-react";
import LocationSelector from "@/components/LocationSelector";
import RiskCard from "@/components/RiskCard";
import WeatherCard from "@/components/WeatherCard";
import AdvisoryCard from "@/components/AdvisoryCard";
import CropSelector from "@/components/CropSelector";

export default function HomePage() {
  const [ঝুঁকি_স্তর, ঝুঁকি_স্তর_সেটকরো] = useState<
    "নিম্ন" | "মধ্যম" | "উচ্চ" | "অতি_উচ্চ"
  >("উচ্চ");

  return (
    <div className="space-y-8 py-6">
      {/* হিরো সেকশন */}
      <section className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 opacity-90"></div>
        <div className="absolute inset-0 rice-field-bg"></div>

        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">
                  বাংলাদেশের কৃষকের বিশ্বস্ত সঙ্গী
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                <span className="block">ফসল রক্ষায়</span>
                <span className="block text-yellow-300">
                  এআই বন্যা পূর্বাভাস
                </span>
              </h1>

              <p className="text-lg text-white/90">
                জলবন্ধু আপনার ফসল ও গবাদিপশুকে বন্যার হাত থেকে রক্ষা করতে
                রিয়েল-টাইম পূর্বাভাস ও ব্যবহারিক পরামর্শ প্রদান করে।
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="farmer-button flex items-center justify-center gap-3 py-4 px-8">
                  <CloudRain className="h-6 w-6" />
                  <span className="text-lg font-semibold">
                    বিনামূল্যে শুরু করুন
                  </span>
                </button>
                <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl border border-white/30 hover:bg-white/30 transition-colors flex items-center justify-center gap-3">
                  <MessageSquare className="h-5 w-5" />
                  <span>ভিডিও দেখুন</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm font-medium">সক্রিয় সতর্কতা</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      area: "সিরাজগঞ্জ সদর",
                      risk: "উচ্চ",
                      time: "২ ঘন্টা আগে",
                    },
                    { area: "বেলকুচি", risk: "অতি উচ্চ", time: "১ ঘন্টা আগে" },
                    { area: "কামারখন্দ", risk: "মধ্যম", time: "৩ ঘন্টা আগে" },
                    { area: "রায়গঞ্জ", risk: "নিম্ন", time: "৪ ঘন্টা আগে" },
                  ].map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl ${
                        alert.risk === "অতি উচ্চ"
                          ? "bg-red-500/20"
                          : alert.risk === "উচ্চ"
                          ? "bg-orange-500/20"
                          : "bg-yellow-500/20"
                      } backdrop-blur-sm`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              alert.risk === "অতি উচ্চ"
                                ? "text-red-300"
                                : alert.risk === "উচ্চ"
                                ? "text-orange-300"
                                : "text-yellow-300"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-white">
                              {alert.area}
                            </p>
                            <p className="text-sm text-white/80">
                              {alert.time}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            alert.risk === "অতি উচ্চ"
                              ? "bg-red-500 text-white"
                              : alert.risk === "উচ্চ"
                              ? "bg-orange-500 text-white"
                              : "bg-yellow-500 text-white"
                          }`}
                        >
                          {alert.risk} ঝুঁকি
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* দ্রুত তথ্য সেকশন */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 text-center border border-green-200">
          <div className="inline-flex p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-green-900">২৫,০০০+</div>
          <div className="text-green-700">কৃষক সংযুক্ত</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 text-center border border-blue-200">
          <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl mb-4">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-blue-900">৯৫%</div>
          <div className="text-blue-700">নির্ভুল পূর্বাভাস</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-6 text-center border border-amber-200">
          <div className="inline-flex p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-amber-900">২৪/৭</div>
          <div className="text-amber-700">মনিটরিং সক্রিয়</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-6 text-center border border-emerald-200">
          <div className="inline-flex p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-emerald-900">৮৫%</div>
          <div className="text-emerald-700">ক্ষতি হ্রাস</div>
        </div>
      </section>

      {/* প্রধান ড্যাশবোর্ড */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* বাম কলাম */}
        <div className="lg:col-span-2 space-y-6">
          <RiskCard
            level={ঝুঁকি_স্তর}
            score={75}
            confidence={85}
            nextUpdate="২ ঘন্টা পর"
          />
          <AdvisoryCard />
        </div>

        {/* ডান কলাম */}
        <div className="space-y-6">
          <LocationSelector />
          <WeatherCard />
          <CropSelector />
        </div>
      </div>

      {/* কীভাবে কাজ করে */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200">
        <h2 className="text-2xl md:text-3xl font-bold text-green-900 text-center mb-2">
          জলবন্ধু কিভাবে কাজ করে?
        </h2>
        <p className="text-green-700 text-center mb-8">
          তিনটি সহজ ধাপে পান নির্ভুল বন্যা পূর্বাভাস
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              number: "১",
              icon: MapPin,
              title: "স্থান নির্বাচন",
              desc: "আপনার জেলা বা জিপিএস ব্যবহার করে অবস্থান নির্বাচন করুন",
              color: "from-green-500 to-emerald-600",
            },
            {
              number: "২",
              icon: Leaf,
              title: "ফসল তথ্য",
              desc: "আপনার বর্তমান ফসলের ধরন ও অবস্থা নির্বাচন করুন",
              color: "from-emerald-500 to-teal-600",
            },
            {
              number: "৩",
              icon: Shield,
              title: "পরামর্শ পান",
              desc: "ব্যক্তিগতকৃত বন্যা পূর্বাভাস ও ফসল রক্ষার পরামর্শ পান",
              color: "from-teal-500 to-cyan-600",
            },
          ].map((step) => (
            <div key={step.number} className="relative">
              <div
                className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${step.color} text-white rounded-2xl flex items-center justify-center text-xl font-bold z-10`}
              >
                {step.number}
              </div>
              <div className="bg-white rounded-2xl p-6 pt-10 border-2 border-green-200 h-full">
                <div
                  className={`inline-flex p-3 bg-gradient-to-br ${step.color} rounded-xl mb-4`}
                >
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-green-700">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* কৃষকগণের সাক্ষাৎকার */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">
                কৃষকদের মতামত
              </h3>
              <p className="text-amber-800 italic">
                "জলবন্ধুর পূর্বাভাসের কারণে আমার ৫ বিঘা ধান রক্ষা পেয়েছে।
                সময়মতো ফসল তুলতে পেরে ৭০,০০০ টাকা ক্ষতি থেকে রক্ষা পেয়েছি।"
              </p>
              <p className="text-amber-700 font-medium mt-4">
                - মোঃ রফিকুল ইসলাম, সিরাজগঞ্জ
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                জরুরি সাহায্য
              </h3>
              <p className="text-blue-800">
                বন্যার সময় জরুরি সাহায্যের জন্য যোগাযোগ করুন:
              </p>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                  <span className="text-blue-700">কৃষি সম্প্রসারণ</span>
                  <span className="font-bold text-blue-900">১৬১২৩</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                  <span className="text-blue-700">দুর্যোগ ব্যবস্থাপনা</span>
                  <span className="font-bold text-blue-900">১০৯০</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* সিএনটি */}
      <section className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white mb-6">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">আপনার ফসল সুরক্ষিত করুন</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
          আজই শুরু করুন বিনামূল্যে
        </h2>

        <p className="text-green-700 text-lg max-w-2xl mx-auto mb-8">
          জলবন্ধু আপনার ফসলকে প্রকৃতির প্রতিকূলতা থেকে রক্ষা করতে ২৪/৭ কাজ করে।
          বাংলাদেশের লক্ষাধিক কৃষকের বিশ্বস্ত সঙ্গী।
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="farmer-button flex items-center justify-center gap-3 py-4 px-8">
            <CloudRain className="h-6 w-6" />
            <span className="text-lg font-semibold">
              বিনামূল্যে রেজিস্টার করুন
            </span>
          </button>

          <div className="flex gap-3">
            <button className="p-4 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors">
              <Download className="h-5 w-5 text-green-600" />
            </button>
            <button className="p-4 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors">
              <Share2 className="h-5 w-5 text-green-600" />
            </button>
            <button className="p-4 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors">
              <Bell className="h-5 w-5 text-green-600" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
