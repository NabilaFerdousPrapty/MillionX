"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Users,
  AlertCircle,
  ArrowRight,
  Smartphone,
  Fingerprint,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call - Replace with your actual authentication logic
    try {
      // Example API call:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // const data = await response.json();

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Demo validation
      if (formData.phone === "০১৭১২৩৪৫৬৭৮" && formData.password === "demo123") {
        // Store auth token (replace with actual auth logic)
        if (rememberMe) {
          localStorage.setItem("userPhone", formData.phone);
        }
        sessionStorage.setItem("isLoggedIn", "true");

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError("মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।");
      }
    } catch (err) {
      setError("লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      phone: "০১৭১২৩৪৫৬৭৮",
      password: "demo123",
    });
  };

  const সুবিধাসমূহ = [
    "বিনামূল্যে বন্যা পূর্বাভাস",
    "ব্যক্তিগতকৃত পরামর্শ",
    "কৃষি সম্প্রদায়ের সদস্য",
    "প্রশিক্ষণ কোর্স",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white mb-6">
              <Users className="h-6 w-6" />
              <span className="text-lg font-semibold">স্বাগতম</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-cyan-900 mb-4">
              আপনার অ্যাকাউন্টে লগইন করুন
            </h1>
            <p className="text-cyan-700 text-lg">
              বন্যা পূর্বাভাস ও কৃষি পরামর্শ পেতে লগইন করুন
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Benefits */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-cyan-100">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="h-6 w-6 text-cyan-600" />
                  <h2 className="text-xl font-bold text-cyan-900">
                    লগইন সুবিধা
                  </h2>
                </div>

                <div className="space-y-4">
                  {সুবিধাসমূহ.map((সুবিধা, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-1 bg-cyan-100 rounded-lg mt-1">
                        <div className="h-4 w-4 rounded-full bg-cyan-600" />
                      </div>
                      <span className="text-cyan-800">{সুবিধা}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-bold text-emerald-900">নতুন সদস্য?</h4>
                  </div>
                  <p className="text-sm text-emerald-700 mb-3">
                    এখনই নিবন্ধন করুন এবং বিনামূল্যে সেবা গ্রহণ করুন।
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    নিবন্ধন করুন <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-cyan-900 mb-2">
                    ২৫,৪৩২+
                  </div>
                  <div className="text-cyan-700">কৃষক সদস্য</div>
                </div>
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-cyan-100">
                {/* Demo Login Button */}
                <div className="mb-6">
                  <button
                    onClick={handleDemoLogin}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Smartphone className="h-5 w-5" />
                    ডেমো অ্যাকাউন্ট ব্যবহার করুন
                  </button>
                  <p className="text-xs text-center text-cyan-600 mt-2">
                    (মোবাইল: ০১৭১২৩৪৫৬৭৮, পাসওয়ার্ড: demo123)
                  </p>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cyan-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 py-1 bg-white text-cyan-600 rounded-full border border-cyan-200">
                      অথবা লগইন করুন
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-2">
                      <Phone className="h-4 w-4" />
                      মোবাইল নম্বর
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 outline-none text-cyan-800 transition-all"
                      placeholder="০১৭১২৩৪৫৬৭৮"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-2">
                      <Lock className="h-4 w-4" />
                      পাসওয়ার্ড
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 outline-none text-cyan-800 pr-12 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-600 hover:text-cyan-800"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-cyan-700">মনে রাখুন</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-cyan-600 hover:text-cyan-800 font-medium"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        লগইন হচ্ছে...
                      </>
                    ) : (
                      <>
                        লগইন করুন
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Alternative Login Options */}
                <div className="mt-6 pt-6 border-t border-cyan-200">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-cyan-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-cyan-500">
                        অন্যান্য উপায়
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button className="py-2.5 border-2 border-cyan-200 rounded-xl text-cyan-700 hover:bg-cyan-50 transition-all flex items-center justify-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      এসএমএস
                    </button>
                    <button className="py-2.5 border-2 border-cyan-200 rounded-xl text-cyan-700 hover:bg-cyan-50 transition-all flex items-center justify-center gap-2">
                      <Fingerprint className="h-4 w-4" />
                      ফিঙ্গারপ্রিন্ট
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-cyan-700">
                    অ্যাকাউন্ট নেই?{" "}
                    <Link
                      href="/register"
                      className="text-cyan-600 font-semibold hover:text-cyan-800"
                    >
                      নিবন্ধন করুন
                    </Link>
                  </p>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-white/50 rounded-xl border border-cyan-100">
                <div className="flex items-center gap-3 text-sm text-cyan-700">
                  <Shield className="h-5 w-5 text-cyan-600 flex-shrink-0" />
                  <p>
                    আপনার তথ্য সম্পূর্ণ গোপন রাখা হবে। আমরা কখনো আপনার তথ্য
                    তৃতীয় পক্ষের সাথে শেয়ার করব না।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
