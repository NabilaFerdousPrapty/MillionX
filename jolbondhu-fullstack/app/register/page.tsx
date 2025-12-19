"use client";

import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    district: "",
    upazila: "",
    password: "",
    confirmPassword: "",
    farmerType: "small",
    landSize: "",
    mainCrops: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const জেলাসমূহ = [
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
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Registration logic here
      alert("নিবন্ধন সফল হয়েছে!");
    }
  };

  const সুবিধাসমূহ = [
    "বিনামূল্যে বন্যা পূর্বাভাস",
    "ব্যক্তিগতকৃত পরামর্শ",
    "কৃষি সম্প্রদায়ের সদস্য",
    "প্রশিক্ষণ কোর্স",
    "সরকারি সাহায্যের তথ্য",
    "বীমা সুবিধা",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* হেডার */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white mb-6">
              <Users className="h-6 w-6" />
              <span className="text-lg font-semibold">নতুন নিবন্ধন</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-cyan-900 mb-4">
              জলবন্ধু সম্প্রদায়ের সদস্য হোন
            </h1>
            <p className="text-cyan-700 text-lg">
              বিনামূল্যে বন্যা পূর্বাভাস ও কৃষি পরামর্শ পেতে আজই নিবন্ধন করুন
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* বাম কলাম - সুবিধাসমূহ */}
            <div className="lg:col-span-1">
              <div className="bangladeshi-card p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="h-6 w-6 text-cyan-600" />
                  <h2 className="text-xl font-bold text-cyan-900">
                    নিবন্ধনের সুবিধা
                  </h2>
                </div>

                <div className="space-y-4">
                  {সুবিধাসমূহ.map((সুবিধা, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-1 bg-cyan-100 rounded-lg mt-1">
                        <CheckCircle className="h-4 w-4 text-cyan-600" />
                      </div>
                      <span className="text-cyan-800">{সুবিধা}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-bold text-emerald-900">
                      গুরুত্বপূর্ণ তথ্য
                    </h4>
                  </div>
                  <p className="text-sm text-emerald-700">
                    নিবন্ধন সম্পূর্ণ বিনামূল্যে। কোন ফি বা চার্জ নেই। আপনার তথ্য
                    সম্পূর্ণ গোপন রাখা হবে।
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-cyan-900 mb-2">
                    ২৫,৪৩২+
                  </div>
                  <div className="text-cyan-700">কৃষক সদস্য</div>
                </div>
              </div>
            </div>

            {/* ডান কলাম - ফর্ম */}
            <div className="lg:col-span-2">
              <div className="bangladeshi-card p-8">
                {/* প্রগ্রেস বার */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-cyan-700">
                      ধাপ {step}/2
                    </span>
                    <span className="text-sm text-cyan-600">
                      {step === 1 ? "ব্যক্তিগত তথ্য" : "কৃষি তথ্য"}
                    </span>
                  </div>
                  <div className="h-2 bg-cyan-100 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${step * 50}%` }}
                    ></div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {step === 1 ? (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-cyan-900 mb-6">
                        আপনার ব্যক্তিগত তথ্য দিন
                      </h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-2">
                            <User className="h-4 w-4" />
                            পূর্ণ নাম
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 outline-none text-cyan-800"
                            placeholder="মোঃ আব্দুল করিম"
                          />
                        </div>

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
                            className="w-full px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 outline-none text-cyan-800"
                            placeholder="০১৭১২৩৪৫৬৭৮"
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-2">
                            <Mail className="h-4 w-4" />
                            ইমেইল (ঐচ্ছিক)
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 outline-none text-cyan-800"
                            placeholder="example@email.com"
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-2">
                            <MapPin className="h-4 w-4" />
                            জেলা
                          </label>
                          <select
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 outline-none text-cyan-800"
                          >
                            <option value="">জেলা নির্বাচন করুন</option>
                            {জেলাসমূহ.map((জেলা) => (
                              <option key={জেলা} value={জেলা}>
                                {জেলা}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-2">
                          <MapPin className="h-4 w-4" />
                          উপজেলা/থানা
                        </label>
                        <input
                          type="text"
                          name="upazila"
                          value={formData.upazila}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 outline-none text-cyan-800"
                          placeholder="আপনার উপজেলা বা থানার নাম"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
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
                              minLength={6}
                              className="w-full px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 outline-none text-cyan-800 pr-12"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-600"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 mb-2">
                            <Lock className="h-4 w-4" />
                            পাসওয়ার্ড নিশ্চিত করুন
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              minLength={6}
                              className="w-full px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 outline-none text-cyan-800 pr-12"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-600"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {formData.password &&
                        formData.confirmPassword &&
                        formData.password !== formData.confirmPassword && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                              পাসওয়ার্ড মিলেনি। আবার চেষ্টা করুন।
                            </p>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-cyan-900 mb-6">
                        আপনার কৃষি তথ্য দিন
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-cyan-700 mb-2">
                          আপনি কোন ধরনের কৃষক?
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: "small", label: "ক্ষুদ্র কৃষক" },
                            { value: "medium", label: "মাঝারি কৃষক" },
                            { value: "large", label: "বৃহৎ কৃষক" },
                          ].map((type) => (
                            <button
                              type="button"
                              key={type.value}
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  farmerType: type.value,
                                })
                              }
                              className={`px-4 py-3 rounded-lg border-2 ${
                                formData.farmerType === type.value
                                  ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                                  : "border-cyan-200 text-cyan-700"
                              }`}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-cyan-700 mb-2">
                          মোট জমির পরিমাণ (একর/বিঘা)
                        </label>
                        <input
                          type="text"
                          name="landSize"
                          value={formData.landSize}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 outline-none text-cyan-800"
                          placeholder="উদা: ৫ বিঘা বা ৩ একর"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-cyan-700 mb-2">
                          প্রধান ফসলসমূহ
                        </label>
                        <textarea
                          name="mainCrops"
                          value={formData.mainCrops}
                          onChange={handleChange}
                          required
                          rows={3}
                          className="w-full px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 outline-none text-cyan-800"
                          placeholder="উদা: ধান, গম, আলু, সবজি ইত্যাদি"
                        />
                      </div>

                      <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                        <p className="text-sm text-amber-800">
                          💡 আপনার কৃষি তথ্য আমাদেরকে আপনার জন্য আরো ভালো
                          পরামর্শ প্রদানে সাহায্য করবে। এই তথ্য সম্পূর্ণ গোপনীয়
                          রাখা হবে।
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-8 pt-6 border-t border-cyan-200">
                    {step === 2 && (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-6 py-3 border-2 border-cyan-200 text-cyan-700 rounded-xl hover:bg-cyan-50"
                      >
                        পূর্ববর্তী
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all"
                    >
                      {step === 1 ? "পরবর্তী ধাপ" : "নিবন্ধন সম্পন্ন করুন"}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-cyan-700">
                    ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
                    <a
                      href="/login"
                      className="text-cyan-600 font-semibold hover:text-cyan-700"
                    >
                      লগইন করুন
                    </a>
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
