"use client";

import { useState } from "react";
import {
  CloudRain,
  Leaf,
  Menu,
  X,
  Home,
  Map,
  Shield,
  Users,
  Phone,
  Video,
  BookOpen,
  User,
} from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-green-200 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* লোগো */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-30"></div>
              <div className="relative p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                <Leaf className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
                জলবন্ধু
                <span className="text-xs px-2 py-1 bg-red-600 text-white rounded-full">
                  বাংলাদেশ
                </span>
              </h1>
              <p className="text-sm text-green-600">
                এআই বন্যা ও ফসল ঝুঁকি সহকারী
              </p>
            </div>
          </div>

          {/* ডেস্কটপ নেভিগেশন */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { icon: Home, label: "হোম", href: "/" },
              { icon: Map, label: "ঝুঁকি মানচিত্র", href: "/risk-map" },
              {
                icon: Shield,
                label: "পরামর্শ কেন্দ্র",
                href: "/advisory-center",
              },
              { icon: Users, label: "কৃষক সম্প্রদায়", href: "/community" },
              { icon: Video, label: "প্রশিক্ষণ", href: "/training" },
              { icon: Phone, label: "জরুরি যোগাযোগ", href: "/emergency" },
              { icon: BookOpen, label: "সম্পর্কে", href: "/about" },
              { icon: User, label: "নিবন্ধন", href: "/register" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-green-700 hover:bg-green-50 rounded-xl transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* সিএনটি এবং মোবাইল মেনু */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <CloudRain className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                সক্রিয় বন্যা সতর্কতা
              </span>
            </div>

            <button className="farmer-button flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="hidden sm:inline">সতর্কতা পান</span>
            </button>

            {/* মোবাইল মেনু বাটন */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-green-100 text-green-700"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* মোবাইল মেনু */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-green-200">
            <div className="space-y-2">
              {[
                { icon: Home, label: "হোম", href: "/", desc: "প্রধান পৃষ্ঠা" },
                {
                  icon: Map,
                  label: "ঝুঁকি মানচিত্র",
                  href: "/risk-map",
                  desc: "আপনার এলাকার মানচিত্র",
                },
                {
                  icon: Shield,
                  label: "পরামর্শ কেন্দ্র",
                  href: "/advisory-center",
                  desc: "ফসল সুরক্ষা পরামর্শ",
                },
                {
                  icon: Users,
                  label: "কৃষক সম্প্রদায়",
                  href: "/community",
                  desc: "অন্যান্য কৃষকের সাথে যোগাযোগ",
                },
                {
                  icon: Video,
                  label: "প্রশিক্ষণ ভিডিও",
                  href: "/training",
                  desc: "বিনামূল্যে কৃষি প্রশিক্ষণ",
                },
                {
                  icon: Phone,
                  label: "জরুরি যোগাযোগ",
                  href: "/emergency",
                  desc: "জরুরি সাহায্যের নম্বর",
                },
                {
                  icon: BookOpen,
                  label: "সম্পর্কে",
                  href: "/about",
                  desc: "জলবন্ধু সম্পর্কে বিস্তারিত",
                },
                {
                  icon: User,
                  label: "নিবন্ধন",
                  href: "/register",
                  desc: "নতুন সদস্য নিবন্ধন",
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="p-2 bg-white rounded-lg">
                    <item.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">{item.label}</p>
                    <p className="text-sm text-green-600">{item.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
