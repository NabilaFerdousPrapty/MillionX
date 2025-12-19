"use client";

import { useState } from "react";
import { Wheat, Carrot, Apple, Trees } from "lucide-react";

const crops = [
  {
    id: "boro-rice",
    name: "Boro Rice",
    icon: Wheat,
    season: "Rabi",
    stage: "Transplanting",
  },
  {
    id: "aman-rice",
    name: "Aman Rice",
    icon: Wheat,
    season: "Kharif",
    stage: "Vegetative",
  },
  {
    id: "wheat",
    name: "Wheat",
    icon: Wheat,
    season: "Rabi",
    stage: "Flowering",
  },
  {
    id: "maize",
    name: "Maize",
    icon: Wheat,
    season: "Kharif",
    stage: "Seedling",
  },
  {
    id: "potato",
    name: "Potato",
    icon: Carrot,
    season: "Rabi",
    stage: "Tuber Formation",
  },
  {
    id: "vegetables",
    name: "Vegetables",
    icon: Carrot,
    season: "All",
    stage: "Various",
  },
  {
    id: "jute",
    name: "Jute",
    icon: Trees,
    season: "Kharif",
    stage: "Harvesting",
  },
  {
    id: "fruits",
    name: "Fruits",
    icon: Apple,
    season: "All",
    stage: "Fruiting",
  },
];

export default function CropSelector() {
  const [selectedCrop, setSelectedCrop] = useState("boro-rice");

  return (
    <div className="glass-card rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Wheat className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-gray-900">Select Crop</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {crops.map((crop) => {
          const Icon = crop.icon;
          const isSelected = selectedCrop === crop.id;

          return (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(crop.id)}
              className={`p-4 rounded-lg border transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      isSelected ? "text-blue-600" : "text-gray-600"
                    }`}
                  />
                </div>
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {crop.name}
                </span>
                <div className="text-xs text-gray-500">
                  {crop.season} • {crop.stage}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Crop Details */}
      {selectedCrop && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Wheat className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="font-semibold text-emerald-800">
                {crops.find((c) => c.id === selectedCrop)?.name}
              </h3>
              <p className="text-sm text-emerald-700">
                Current advisory is tailored for this crop type
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-emerald-600">Sensitivity</p>
              <p className="font-medium">High to Flood</p>
            </div>
            <div>
              <p className="text-emerald-600">Recovery Time</p>
              <p className="font-medium">10-14 days</p>
            </div>
            <div>
              <p className="text-emerald-600">Insurance</p>
              <p className="font-medium">Available</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
