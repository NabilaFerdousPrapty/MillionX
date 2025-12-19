"use client";

import { CloudRain, Thermometer, Wind, Droplets } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const hourlyData = [
  { time: "6 AM", temp: 25, rain: 10 },
  { time: "9 AM", temp: 27, rain: 15 },
  { time: "12 PM", temp: 30, rain: 40 },
  { time: "3 PM", temp: 32, rain: 60 },
  { time: "6 PM", temp: 28, rain: 30 },
  { time: "9 PM", temp: 26, rain: 20 },
];

export default function WeatherCard() {
  return (
    <div className="glass-card rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <CloudRain className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Weather Forecast
        </h2>
      </div>

      {/* Current Weather */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Temperature</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">30°C</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CloudRain className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Rainfall</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">45mm</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Wind</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">12 km/h</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Humidity</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">78%</p>
        </div>
      </div>

      {/* Rainfall Chart */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Rainfall Forecast (Next 24 hours)
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="rain"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          5-Day Forecast
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {["Today", "Tue", "Wed", "Thu", "Fri"].map((day, index) => (
            <div key={day} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">{day}</p>
              <p className="text-xs text-gray-500 mb-2">30°C</p>
              <div className="flex justify-center">
                <CloudRain className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {[20, 45, 60, 35, 25][index]}mm
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
