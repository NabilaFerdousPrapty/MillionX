"use client";

import React, { useState, useEffect } from "react";
import {
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  MapPin,
  Loader2,
  Navigation,
  AlertCircle,
  Cloud,
  Sun,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Types for OpenWeather API ---
interface WeatherListEntry {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: { "3h": number };
  snow?: { "3h": number };
  pop: number; // Probability of precipitation
  dt_txt: string;
}

interface WeatherResponse {
  city: {
    name: string;
    country: string;
    sunrise: number;
    sunset: number;
    timezone: number;
  };
  list: WeatherListEntry[];
}

interface Coordinates {
  lat: number;
  lon: number;
}
interface WeatherCardProps {
  location?: {
    lat: number;
    lon: number;
  } | null;
}
export default function WeatherCard({ location }: WeatherCardProps) {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const API_KEY = "ae2f97df1a45e8f8eb5d0be9feeeffb1";

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });

        // Get city name from coordinates
        try {
          const reverseRes = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
          );
          const reverseData = await reverseRes.json();
          if (reverseData.length > 0) {
            setLocationName(
              `${reverseData[0].name}, ${reverseData[0].country}`
            );
          }
        } catch (err) {
          console.error("Failed to get location name:", err);
        }
      },
      (err) => {
        setError(
          "Unable to retrieve your location. Using default location (Dhaka)."
        );
        // Fallback to default coordinates (Dhaka)
        setUserLocation({ lat: 23.8103, lon: 90.4125 });
        setLocationName("Dhaka, BD");
      }
    );
  }, []);

  // Fetch weather data when location is available
  useEffect(() => {
    const fetchWeather = async () => {
      if (!userLocation) return;

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${userLocation.lat}&lon=${userLocation.lon}&appid=${API_KEY}&units=${unit}&cnt=40`
        );

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error(
              "Invalid API key. Please check your API configuration."
            );
          }
          throw new Error(`API Error: ${res.status}`);
        }

        const data: WeatherResponse = await res.json();

        // Ensure we have complete data
        if (!data.list || data.list.length === 0) {
          throw new Error("No weather data available for this location.");
        }

        setWeatherData(data);

        // Update location name if not already set
        if (!locationName && data.city) {
          setLocationName(`${data.city.name}, ${data.city.country}`);
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load weather data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      fetchWeather();
      // Refresh data every 10 minutes
      const interval = setInterval(fetchWeather, 600000);
      return () => clearInterval(interval);
    }
  }, [userLocation, unit, API_KEY]);

  const handleRefresh = () => {
    if (userLocation) {
      setLoading(true);
      setError(null);
      fetchWeatherData();
    }
  };

  const fetchWeatherData = async () => {
    if (!userLocation) return;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${userLocation.lat}&lon=${userLocation.lon}&appid=${API_KEY}&units=${unit}&cnt=40`
      );

      if (!res.ok) throw new Error("Failed to fetch weather data");

      const data: WeatherResponse = await res.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getWindDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-white rounded-2xl p-6 shadow-xl border border-blue-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">
          Getting your location and weather data...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Please allow location access
        </p>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-red-50">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle className="h-6 w-6" />
          <h2 className="font-bold">Error Loading Weather</h2>
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
          <button
            onClick={() => setUserLocation({ lat: 23.8103, lon: 90.4125 })}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Use Default (Dhaka)
          </button>
        </div>
      </div>
    );
  }

  const current = weatherData.list[0];
  const currentTime = new Date();
  const isDayTime = currentTime.getHours() >= 6 && currentTime.getHours() < 18;

  // Process data for the chart - next 24 hours (8 data points, 3-hour intervals)
  const chartData = weatherData.list.slice(0, 8).map((item) => ({
    time:
      new Date(item.dt * 1000).toLocaleTimeString([], {
        hour: "numeric",
        hour12: false,
      }) + ":00",
    temp: Math.round(item.main.temp),
    rain: item.rain ? item.rain["3h"] : item.snow ? item.snow["3h"] : 0,
    pop: Math.round(item.pop * 100), // Probability of precipitation in percentage
  }));

  // Process data for 5-day forecast (one entry per day at noon)
  const dailyData = weatherData.list
    .filter((item) => new Date(item.dt * 1000).getHours() === 12)
    .slice(0, 5)
    .map((item) => ({
      day: new Date(item.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      date: new Date(item.dt * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      temp: Math.round(item.main.temp),
      high: Math.round(item.main.temp + 3), // Approximate high
      low: Math.round(item.main.temp - 3), // Approximate low
      rain: item.rain ? item.rain["3h"] : item.snow ? item.snow["3h"] : 0,
      pop: Math.round(item.pop * 100),
      icon: item.weather[0].icon,
      description: item.weather[0].description,
    }));

  // Current weather stats
  const stats = [
    {
      label: "Feels Like",
      value: `${Math.round(current.main.feels_like)}°${
        unit === "metric" ? "C" : "F"
      }`,
      color: "text-orange-600",
      bg: "bg-orange-50",
      icon: Thermometer,
    },
    {
      label: "Precipitation",
      value: `${
        current.rain
          ? current.rain["3h"]
          : current.snow
          ? current.snow["3h"]
          : 0
      }mm`,
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: CloudRain,
    },
    {
      label: "Wind",
      value: `${Math.round(current.wind.speed)} ${
        unit === "metric" ? "km/h" : "mph"
      } ${getWindDirection(current.wind.deg)}`,
      color: "text-teal-600",
      bg: "bg-teal-50",
      icon: Wind,
    },
    {
      label: "Humidity",
      value: `${current.main.humidity}%`,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      icon: Droplets,
    },
    {
      label: "Pressure",
      value: `${current.main.pressure}hPa`,
      color: "text-purple-600",
      bg: "bg-purple-50",
      icon: Cloud,
    },
    {
      label: "Precipitation Chance",
      value: `${Math.round(current.pop * 100)}%`,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      icon: CloudRain,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-xl border border-blue-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl ${
              isDayTime ? "bg-yellow-500" : "bg-blue-600"
            }`}
          >
            {isDayTime ? (
              <Sun className="text-white h-6 w-6" />
            ) : (
              <Cloud className="text-white h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <h2 className="font-bold text-gray-900 text-lg">
                Weather Forecast
              </h2>
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              {locationName ||
                `${weatherData.city.name}, ${weatherData.city.country}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnit("metric")}
            className={`px-3 py-1 rounded-lg ${
              unit === "metric"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setUnit("imperial")}
            className={`px-3 py-1 rounded-lg ${
              unit === "imperial"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            °F
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
          >
            <Loader2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Current Weather */}
      <div className="mb-8 p-4 bg-white rounded-xl border border-blue-100">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={getWeatherIcon(current.weather[0].icon)}
                alt={current.weather[0].description}
                className="h-24 w-24"
              />
            </div>
            <div>
              <div className="text-5xl font-bold text-gray-900">
                {Math.round(current.main.temp)}°{unit === "metric" ? "C" : "F"}
              </div>
              <p className="text-gray-600 capitalize">
                {current.weather[0].description}
              </p>
              <p className="text-sm text-gray-500">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-gray-600">
              Sunrise:{" "}
              {new Date(weatherData.city.sunrise * 1000).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              )}
            </p>
            <p className="text-gray-600">
              Sunset:{" "}
              {new Date(weatherData.city.sunset * 1000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <StatItem key={idx} {...stat} />
        ))}
      </div>

      {/* Temperature Chart */}
      <div className="h-64 w-full mb-8">
        <h3 className="font-bold text-gray-900 mb-4">
          24-Hour Temperature Forecast
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="time"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              label={{
                value: `°${unit === "metric" ? "C" : "F"}`,
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#3b82f6" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 5-Day Forecast */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">5-Day Forecast</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {dailyData.map((day, idx) => (
            <div
              key={idx}
              className="text-center p-4 bg-white rounded-xl border border-blue-100 hover:shadow-md transition"
            >
              <p className="text-sm font-bold text-gray-900">{day.day}</p>
              <p className="text-xs text-gray-500 mb-2">{day.date}</p>
              <div className="flex justify-center items-center my-2">
                <img
                  src={getWeatherIcon(day.icon)}
                  alt={day.description}
                  className="h-12 w-12"
                />
              </div>
              <div className="flex justify-center gap-2 mb-2">
                <p className="text-lg font-bold text-gray-900">{day.temp}°</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="text-red-500">{day.high}°</span>
                  <span>/</span>
                  <span className="text-blue-500">{day.low}°</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 capitalize mb-1">
                {day.description}
              </p>
              <div className="flex justify-center items-center gap-1 text-xs">
                <CloudRain className="h-3 w-3 text-blue-500" />
                <span className="text-blue-600 font-medium">{day.pop}%</span>
                {day.rain > 0 && (
                  <span className="text-gray-500 ml-1">({day.rain}mm)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Data provided by OpenWeather • Last updated:{" "}
          {currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

function StatItem({ label, value, color, bg, icon: Icon }: any) {
  return (
    <div
      className={`${bg} p-4 rounded-xl border border-transparent hover:shadow-sm transition`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`p-2 rounded-lg ${color
            .replace("text-", "bg-")
            .replace("600", "100")}`}
        >
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-xs font-semibold text-gray-600">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
