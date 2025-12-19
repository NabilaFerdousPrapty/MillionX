"use client";

import { useState } from "react";
import {
  Phone,
  AlertTriangle,
  Ambulance,
  Shield,
  MessageSquare,
  Download,
  Share2,
  MapPin,
  Clock,
  Users,
  FileText,
  Video,
  Bell,
} from "lucide-react";

const জরুরি_নম্বর = [
  {
    category: "জরুরি সাহায্য",
    contacts: [
      {
        name: "ন্যাশনাল ইমার্জেন্সি সার্ভিস",
        number: "৯৯৯",
        desc: "সকল জরুরি সাহায্য",
      },
      { name: "দুর্যোগ ব্যবস্থাপনা", number: "১০৯০", desc: "বন্যা/দুর্যোগ" },
      { name: "অ্যাম্বুলেন্স", number: "১০৬", desc: "জরুরি চিকিৎসা" },
      { name: "ফায়ার সার্ভিস", number: "১৬১৬৩", desc: "আগুন নেভানো" },
    ],
  },
  {
    category: "কৃষি সাহায্য",
    contacts: [
      { name: "কৃষি হেল্পলাইন", number: "১৬১২৩", desc: "কৃষি পরামর্শ" },
      {
        name: "কৃষি সম্প্রসারণ",
        number: "০৯৬৩৮-৭৭৭৭৭৭",
        desc: "স্থানীয় অফিস",
      },
      { name: "কৃষি বীমা", number: "০৯৬১১৭৭৭৭৭৭", desc: "বীমা দাবি" },
      { name: "বীজ সরবরাহ", number: "০২-৫৫০১২৩৪৫", desc: "বাংলাদেশ কৃষি" },
    ],
  },
  {
    category: "সরকারি সাহায্য",
    contacts: [
      {
        name: "প্রধানমন্ত্রীর কার্যালয়",
        number: "১৬২৩৭",
        desc: "নাগরিক সেবা",
      },
      { name: "জেলা প্রশাসক", number: "স্থানীয় নম্বর", desc: "জেলা পর্যায়" },
      {
        name: "উপজেলা নির্বাহী অফিসার",
        number: "স্থানীয় নম্বর",
        desc: "উপজেলা পর্যায়",
      },
      {
        name: "ইউনিয়ন পরিষদ",
        number: "স্থানীয় নম্বর",
        desc: "গ্রাম পর্যায়",
      },
    ],
  },
  {
    category: "স্বাস্থ্য সেবা",
    contacts: [
      { name: "ডায়াগনস্টিক সেন্টার", number: "১০৬৫৫", desc: "করোনা টেস্ট" },
      {
        name: "স্বাস্থ্য বাতায়ন",
        number: "১৬২৬৩",
        desc: "সকল স্বাস্থ্য সেবা",
      },
      { name: "মাতৃস্বাস্থ্য", number: "০৯৬১১৬৭৭৭৭৭", desc: "গর্ভবতী মহিলা" },
      { name: "শিশু স্বাস্থ্য", number: "১০৯৮", desc: "শিশু সুরক্ষা" },
    ],
  },
];

const জরুরি_পদ্ধতি = [
  {
    step: 1,
    title: "বন্যা সতর্কতা পেলে",
    actions: [
      "গুরুত্বপূর্ণ দলিলপত্র উঁচু স্থানে রাখুন",
      "গবাদিপশু নিরাপদ স্থানে নিন",
      "জরুরি যোগাযোগের নম্বর হাতে রাখুন",
    ],
  },
  {
    step: 2,
    title: "বন্যা চলাকালীন",
    actions: [
      "উঁচু ও নিরাপদ স্থানে থাকুন",
      "দূষিত পানি পান করবেন না",
      "বিজলী সংযোগ বিচ্ছিন্ন রাখুন",
    ],
  },
  {
    step: 3,
    title: "বন্যা পরবর্তী",
    actions: [
      "স্বাস্থ্য সুরক্ষা নিশ্চিত করুন",
      "ক্ষতি মূল্যায়ন করুন",
      "সরকারি সাহায্যের জন্য আবেদন করুন",
    ],
  },
];

const নিকটস্থ_সুবিধা = [
  {
    type: "সাইক্লোন শেল্টার",
    distance: "২.৫ কিমি",
    capacity: "৫০০ জন",
    contact: "স্থানীয় ইউপি চেয়ারম্যান",
  },
  {
    type: "স্বাস্থ্য কমপ্লেক্স",
    distance: "৩.২ কিমি",
    capacity: "১০০ বেড",
    contact: "ডাঃ মোঃ আলী - ০১৭১২৩৪৫৬৭৮",
  },
  {
    type: "খাদ্য গুদাম",
    distance: "৪.০ কিমি",
    capacity: "১০ টন",
    contact: "উপজেলা খাদ্য কর্মকর্তা",
  },
  {
    type: "পশু চিকিৎসা কেন্দ্র",
    distance: "২.৮ কিমি",
    capacity: "১০০ প্রাণী",
    contact: "ডাঃ করিম - ০১৯১২৩৪৫৬৭৮",
  },
];

export default function EmergencyPage() {
  const [selectedCategory, setSelectedCategory] = useState("জরুরি_সাহায্য");

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* হেডার */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-full text-white mb-6">
            <AlertTriangle className="h-6 w-6" />
            <span className="text-lg font-semibold">
              জরুরি যোগাযোগ ও সাহায্য
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-red-900 mb-4">
            বিপদে পড়লে এই নম্বরগুলো মনে রাখুন
          </h1>
          <p className="text-red-700 text-lg max-w-3xl mx-auto">
            বন্যা বা অন্য কোন জরুরি অবস্থায় সাহায্যের জন্য এই নম্বরগুলো ব্যবহার
            করুন। সমস্ত নম্বর ২৪/৭ সক্রিয় থাকে।
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* বাম কলাম - জরুরি নম্বর */}
          <div className="lg:col-span-2">
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Phone className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-bold text-red-900">
                  জরুরি যোগাযোগ নম্বর
                </h2>
              </div>

              {/* ক্যাটেগরি ট্যাব */}
              <div className="flex flex-wrap gap-2 mb-6">
                {জরুরি_নম্বর.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedCategory === cat.category
                        ? "bg-red-500 text-white"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>

              {/* কন্টাক্ট কার্ড */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {জরুরি_নম্বর
                  .find((cat) => cat.category === selectedCategory)
                  ?.contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-red-900 text-lg">
                            {contact.name}
                          </h3>
                          <p className="text-red-700 text-sm">{contact.desc}</p>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Phone className="h-5 w-5 text-red-600" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-center py-3 bg-white rounded-lg border border-red-200">
                          <div className="text-2xl font-bold text-red-900">
                            {contact.number}
                          </div>
                          <p className="text-sm text-red-700">২৪/৭ খোলা</p>
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-red-500 text-white rounded-lg flex items-center justify-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>কল করুন</span>
                          </button>
                          <button className="flex-1 py-2 bg-white border-2 border-red-200 text-red-700 rounded-lg">
                            এসএমএস
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* জরুরি সতর্ক বার্তা */}
              <div className="mt-8 p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="h-5 w-5" />
                  <h4 className="font-bold">🚨 জরুরি বার্তা</h4>
                </div>
                <p className="text-sm">
                  বন্যা পূর্বাভাস: সিরাজগঞ্জ জেলায় আগামী ২৪ ঘন্টার মধ্যে বন্যার
                  উচ্চ ঝুঁকি রয়েছে। সকলকে সতর্ক থাকার এবং জরুরি নম্বর হাতে
                  রাখার অনুরোধ করা হচ্ছে।
                </p>
              </div>
            </div>

            {/* জরুরি পদ্ধতি */}
            <div className="bangladeshi-card p-6 mt-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-bold text-orange-900">
                  জরুরি অবস্থায় করণীয়
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {জরুরি_পদ্ধতি.map((step) => (
                  <div key={step.step} className="relative">
                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold z-10">
                      {step.step}
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 pt-8 rounded-xl border border-orange-200 h-full">
                      <h3 className="font-bold text-orange-900 mb-4">
                        {step.title}
                      </h3>
                      <ul className="space-y-2">
                        {step.actions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <span className="text-orange-800 text-sm">
                              {action}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ডান কলাম - অতিরিক্ত তথ্য */}
          <div className="space-y-6">
            {/* নিকটস্থ সুবিধা */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl font-bold text-emerald-900">
                  নিকটস্থ জরুরি সুবিধা
                </h2>
              </div>

              <div className="space-y-4">
                {নিকটস্থ_সুবিধা.map((facility, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-emerald-900">
                          {facility.type}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-emerald-700 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{facility.distance} দূরে</span>
                          <Users className="h-4 w-4 ml-2" />
                          <span>{facility.capacity} ধারণক্ষমতা</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-emerald-800">
                      <span className="font-medium">যোগাযোগ: </span>
                      {facility.contact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* জরুরি ডকুমেন্ট */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-blue-900">
                  জরুরি ডকুমেন্ট
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  { title: "জরুরি সাহায্য আবেদন ফর্ম", size: "১.২ MB" },
                  { title: "ক্ষতি মূল্যায়ন ফর্ম", size: "০.৮ MB" },
                  { title: "কৃষি বীমা ক্লেম ফর্ম", size: "১.৫ MB" },
                  { title: "সরকারি সাহায্য গাইড", size: "২.৩ MB" },
                ].map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {doc.title}
                        </p>
                        <p className="text-xs text-blue-700">{doc.size}</p>
                      </div>
                    </div>
                    <button className="p-2 text-blue-600 hover:text-blue-700">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* দ্রুত সাহায্য */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Ambulance className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-bold text-purple-900">
                  দ্রুত সাহায্য পান
                </h2>
              </div>

              <div className="space-y-4">
                <button className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center gap-3">
                  <Ambulance className="h-6 w-6" />
                  <span className="text-lg font-semibold">
                    অ্যাম্বুলেন্স ডাকুন
                  </span>
                </button>

                <button className="w-full p-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl flex items-center justify-center gap-3">
                  <AlertTriangle className="h-6 w-6" />
                  <span className="text-lg font-semibold">জরুরি সতর্কতা</span>
                </button>

                <button className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center gap-3">
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-lg font-semibold">লাইভ চ্যাট</span>
                </button>
              </div>
            </div>

            {/* ভিডিও গাইড */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Video className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-bold text-red-900">
                  জরুরি ভিডিও গাইড
                </h2>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-red-200 to-orange-300 rounded-xl flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-red-600 ml-1"></div>
                    </div>
                  </div>
                  <p className="mt-2 font-medium text-red-900">
                    বন্যা সময় করণীয়
                  </p>
                  <p className="text-sm text-red-700">৫:৩০ মিনিট</p>
                </div>

                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-blue-200 to-cyan-300 rounded-xl flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-blue-600 ml-1"></div>
                    </div>
                  </div>
                  <p className="mt-2 font-medium text-blue-900">
                    প্রাথমিক চিকিৎসা
                  </p>
                  <p className="text-sm text-blue-700">৮:১৫ মিনিট</p>
                </div>
              </div>
            </div>

            {/* শেয়ার অপশন */}
            <div className="bangladeshi-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Share2 className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-bold text-amber-900">
                  এই পৃষ্ঠা শেয়ার করুন
                </h2>
              </div>

              <p className="text-amber-700 mb-4">
                এই জরুরি নম্বরগুলো আপনার বন্ধু ও পরিবারের সদস্যদের সাথে শেয়ার
                করুন।
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                  ফেসবুক
                </button>
                <button className="p-3 bg-green-100 text-green-700 rounded-lg">
                  হোয়াটসঅ্যাপ
                </button>
                <button className="p-3 bg-red-100 text-red-700 rounded-lg">
                  এসএমএস
                </button>
              </div>

              <button className="w-full mt-4 p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg">
                লিঙ্ক কপি করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
