import {
  MapPin,
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  Lightbulb,
} from "lucide-react";
import { FloodPrediction } from "../types/types";

interface Props {
  floodPrediction: FloodPrediction | null;
  weatherData: any;
  onRefresh: () => void;
  onEmergencyClick: () => void;
}

export const FloodRiskTab = ({
  floodPrediction,
  weatherData,
  onRefresh,
  onEmergencyClick,
}: Props) => {
  if (!floodPrediction)
    return (
      <div className="text-center py-12">
        <CloudRain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          ঝুঁকি বিশ্লেষণ দেখতে অবস্থান শনাক্ত করুন
        </p>
      </div>
    );

  const getRiskDescription = (level: string) => {
    const descriptions: Record<string, string> = {
      "অতি উচ্চ": "তাৎক্ষণিক ব্যবস্থা প্রয়োজন। নিরাপদ স্থানে যান।",
      উচ্চ: "জরুরি প্রস্তুতি নিন। সতর্ক থাকুন।",
      মধ্যম: "সতর্কতা অবলম্বন করুন। পর্যবেক্ষণ করুন।",
      নিম্ন: "স্বাভাবিক অবস্থা। নিয়মিত মনিটর করুন।",
    };
    return descriptions[level] || "তথ্য পাওয়া যায়নি";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                বন্যা ঝুঁকি বিশ্লেষণ
              </h3>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {floodPrediction.nearest_district}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
                <div>
                  <p className="text-sm text-gray-600">ঝুঁকি মাত্রা</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: floodPrediction.risk_color }}
                    ></div>
                    <h4
                      className="text-2xl font-bold"
                      style={{ color: floodPrediction.risk_color }}
                    >
                      {floodPrediction.risk_level}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">ঝুঁকি স্কোর</p>
                  <h4 className="text-2xl font-bold text-gray-900">
                    {floodPrediction.risk_score}/100
                  </h4>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {getRiskDescription(floodPrediction.risk_level)}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">আস্থার হার</span>
                    <span className="font-medium text-green-600">
                      {floodPrediction.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            আবহাওয়া তথ্য
          </h3>
          {weatherData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-gray-600">তাপমাত্রা</span>
                </div>
                <span className="font-medium">{weatherData.temperature}°C</span>
              </div>
              {/* ... Other weather items same as original ... */}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          ঝুঁকি ফ্যাক্টর বিশ্লেষণ
        </h3>
        <div className="space-y-4">
          {/* Use Object.entries(floodPrediction.factors || {}) to prevent null error */}
          {Object.entries(floodPrediction.factors || {}).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">
                  {key === "rainfall_risk" && "বৃষ্টিপাত ঝুঁকি"}
                  {key === "river_risk" && "নদীর পানি স্তর"}
                  {key === "location_risk" && "অবস্থানগত ঝুঁকি"}
                  {key === "seasonal_risk" && "মৌসুমি ঝুঁকি"}
                </span>
                <span className="text-sm font-medium">{value}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${value}%`,
                    backgroundColor:
                      (value as number) > 70
                        ? "#dc2626"
                        : (value as number) > 50
                        ? "#f97316"
                        : "#f59e0b",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-bold text-blue-900">🤖 AI এর সুপারিশ</h3>
        </div>
        <div className="space-y-3">
          <p className="text-blue-800">
            <strong>পদক্ষেপ:</strong>{" "}
            {floodPrediction.risk_level === "অতি উচ্চ"
              ? "নিরাপদ স্থানে সরিয়ে যান।"
              : "সতর্ক থাকুন।"}
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={onEmergencyClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              জরুরি সাহায্য নিন
            </button>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg"
            >
              আপডেট করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
