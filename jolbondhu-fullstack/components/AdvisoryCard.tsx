"use client";

import { AlertCircle, Sprout, Shield, Package } from "lucide-react";

const recommendations = [
  {
    icon: AlertCircle,
    title: "Immediate Actions",
    color: "bg-red-50 text-red-700",
    items: [
      "Postpone transplanting of seedlings for next 2-3 days",
      "Harvest mature crops immediately if possible",
      "Secure stored grains in elevated locations",
    ],
  },
  {
    icon: Shield,
    title: "Crop Protection",
    color: "bg-blue-50 text-blue-700",
    items: [
      "Apply silicon-based anti-stress agents for standing crops",
      "Use floating seedbeds for vegetable cultivation",
      "Prepare drainage channels around field boundaries",
    ],
  },
  {
    icon: Sprout,
    title: "Post-Flood Recovery",
    color: "bg-emerald-50 text-emerald-700",
    items: [
      "Clean debris from fields after water recedes",
      "Apply gypsum to improve soil structure",
      "Reseed with quick-growing varieties if needed",
    ],
  },
  {
    icon: Package,
    title: "Input Management",
    color: "bg-amber-50 text-amber-700",
    items: [
      "Store fertilizers and pesticides in waterproof containers",
      "Relocate livestock to higher ground",
      "Secure farm equipment and machinery",
    ],
  },
];

export default function AdvisoryCard() {
  return (
    <div className="glass-card rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Farm Advisory</h2>
      </div>

      <div className="mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Current Crop:</span> Boro Rice
            (Transplanting Stage)
            <br />
            <span className="font-semibold">Season:</span> Rabi Season
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {recommendations.map((category, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-lg ${category.color}`}>
                <category.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900">{category.title}</h3>
            </div>
            <ul className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Emergency Contacts
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-red-700 font-medium">Agriculture Extension</p>
            <p className="text-gray-600">017XX-XXXXXX</p>
          </div>
          <div>
            <p className="text-red-700 font-medium">Disaster Management</p>
            <p className="text-gray-600">1090 (Toll Free)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
