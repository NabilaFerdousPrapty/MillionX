"use client";

import { CloudRain, Thermometer, Wind, Droplets, MapPin } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// বাস্তবসম্মত ঘণ্টা ভিত্তিক ডেটা (বৃষ্টিপাত এবং তাপমাত্রার পরিবর্তন)
const hourlyData = [
  { time: "সকাল ৬টা", temp: 22, rain: 5 },
  { time: "সকাল ৯টা", temp: 25, rain: 15 },
  { time: "দুপুর ১২টা", temp: 29, rain: 45 },
  { time: "বিকেল ৩টা", temp: 31, rain: 70 },
  { time: "সন্ধ্যা ৬টা", temp: 27, rain: 40 },
  { time: "রাত ৯টা", temp: 24, rain: 20 },
];

export default function WeatherCard() {
  const currentDateTime = new Date().toLocaleString("bn-BD", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-50">
      {/* Header & Location */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
            <CloudRain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              আবহাওয়ার পূর্বাভাস
            </h2>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>ঢাকা, বাংলাদেশ</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
            সর্বশেষ আপডেট: আজ, {currentDateTime}
          </p>
        </div>
      </div>

      {/* Current Weather Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Thermometer,
            label: "তাপমাত্রা",
            value: "২৯° সেলসিয়াস",
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            icon: CloudRain,
            label: "বৃষ্টিপাত",
            value: "৪৮ মি.মি.",
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            icon: Wind,
            label: "বাতাসের গতি",
            value: "১৪ কি.মি./ঘণ্টা",
            color: "text-teal-600",
            bg: "bg-teal-50",
          },
          {
            icon: Droplets,
            label: "আর্দ্রতা",
            value: "৮২%",
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`${item.bg} p-4 rounded-2xl border border-transparent hover:border-blue-100 transition-all`}
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {item.label}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Rainfall Chart */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-md font-bold text-gray-800">
            বৃষ্টিপাতের সম্ভাবনা (আগামী ২৪ ঘণ্টা)
          </h3>
          <span className="text-xs text-blue-500 font-medium">
            একক: মিলিমিটার (mm)
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                itemStyle={{ color: "#2563eb", fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="rain"
                name="বৃষ্টিপাত"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div>
        <h3 className="text-md font-bold text-gray-800 mb-4">
          আগামী ৫ দিনের পূর্বাভাস
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { day: "আজ", temp: "২৯°", rain: "২০", color: "text-blue-500" },
            { day: "মঙ্গল", temp: "৩১°", rain: "৫০", color: "text-blue-600" },
            { day: "বুধ", temp: "৩২°", rain: "৭৫", color: "text-blue-700" },
            {
              day: "বৃহস্পতি",
              temp: "৩০°",
              rain: "৪০",
              color: "text-blue-500",
            },
            { day: "শুক্র", temp: "২৮°", rain: "১০", color: "text-blue-400" },
          ].map((item, index) => (
            <div
              key={index}
              className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-colors group"
            >
              <p className="text-sm font-bold text-gray-700 mb-1">{item.day}</p>
              <p className="text-xs text-gray-500 mb-3">{item.temp} সে.</p>
              <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">
                <CloudRain className={`h-7 w-7 ${item.color}`} />
              </div>
              <p className="text-[10px] font-bold text-blue-600 bg-blue-100/50 py-1 rounded-md">
                {item.rain} মি.মি.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
