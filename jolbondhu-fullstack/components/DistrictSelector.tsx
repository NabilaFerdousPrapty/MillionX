// components/DistrictSelector.tsx
"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { BangladeshEmergencyUtils } from "../app/utils/bangladeshEmergencyUtils";

interface DistrictSelectorProps {
  onSelect: (division: string, district: string) => void;
  onUseCurrentLocation?: () => void;
}

export default function DistrictSelector({
  onSelect,
  onUseCurrentLocation,
}: DistrictSelectorProps) {
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const divisions = BangladeshEmergencyUtils.getAllDivisions();
  const districts = selectedDivision
    ? BangladeshEmergencyUtils.getDistrictsByDivision(selectedDivision)
    : [];

  const handleConfirm = () => {
    if (selectedDivision && selectedDistrict) {
      onSelect(selectedDivision, selectedDistrict);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-lg border border-blue-200">
      <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        ম্যানুয়ালি জেলা নির্বাচন করুন
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <select
          value={selectedDivision}
          onChange={(e) => {
            setSelectedDivision(e.target.value);
            setSelectedDistrict("");
          }}
          className="p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">বিভাগ নির্বাচন করুন</option>
          {divisions.map((div) => (
            <option key={div} value={div}>
              {div}
            </option>
          ))}
        </select>

        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          disabled={!selectedDivision}
          className="p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
        >
          <option value="">জেলা নির্বাচন করুন</option>
          {districts.map((dist) => (
            <option key={dist} value={dist}>
              {dist}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={!selectedDivision || !selectedDistrict}
          className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50"
        >
          নিশ্চিত করুন
        </button>

        {onUseCurrentLocation && (
          <button
            onClick={onUseCurrentLocation}
            className="flex-1 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            আমার অবস্থান
          </button>
        )}
      </div>
    </div>
  );
}
