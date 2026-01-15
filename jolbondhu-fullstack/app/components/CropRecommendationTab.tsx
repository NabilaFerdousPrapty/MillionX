import { Leaf } from "lucide-react";
import { CropRecommendation } from "../types/types";

interface Props {
  cropRecommendation: CropRecommendation | null;
}

export const CropRecommendationTab = ({ cropRecommendation }: Props) => {
  if (!cropRecommendation)
    return (
      <div className="text-center py-12">
        <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">ফসল সুপারিশ দেখতে অবস্থান শনাক্ত করুন</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Leaf className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">ফসল সুপারিশ</h3>
              <p className="text-sm text-gray-600">
                বর্তমান মৌসুম: {cropRecommendation.current_season}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-2">
              🎯 সুপারিশকৃত ফসল
            </h4>
            <div className="flex flex-wrap gap-2">
              {cropRecommendation.recommended_crops.map((crop, i) => (
                <span
                  key={i}
                  className="px-3 py-2 bg-green-100 text-green-800 rounded-lg font-medium"
                >
                  {crop}
                </span>
              ))}
            </div>
            <p className="text-gray-700">
              <strong>মাটি:</strong> {cropRecommendation.soil_type}
            </p>
            <p className="text-gray-700">
              <strong>সময়:</strong> {cropRecommendation.planting_time}
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h4 className="font-bold text-green-900 mb-3">
              সার প্রয়োগ পরামর্শ
            </h4>
            <p className="text-green-800 text-sm">
              {cropRecommendation.fertilizer_recommendation}
            </p>
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
            <h4 className="font-bold text-cyan-900 mb-3">সেচ ব্যবস্থাপনা</h4>
            <p className="text-cyan-800 text-sm">
              {cropRecommendation.irrigation_needs}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
