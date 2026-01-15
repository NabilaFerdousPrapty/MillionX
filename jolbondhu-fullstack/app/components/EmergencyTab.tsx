import { AlertTriangle, ChevronRight, Shield, Phone } from "lucide-react";
import { EmergencyAssistance } from "../types/types";

interface Props {
  emergencyAssistance: EmergencyAssistance | null;
  handleEmergencyRequest: (situation: string, urgency: string) => void;
}

export const EmergencyTab = ({
  emergencyAssistance,
  handleEmergencyRequest,
}: Props) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900">
              জরুরি সাহায্য প্রয়োজন?
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: "বন্যা", urgency: "উচ্চ", icon: "🌊" },
              { type: "স্বাস্থ্য জরুরি", urgency: "অতি উচ্চ", icon: "🏥" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => handleEmergencyRequest(item.type, item.urgency)}
                className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <ChevronRight className="h-5 w-5 text-red-600" />
                </div>
                <h4 className="font-medium text-red-900">{item.type}</h4>
              </button>
            ))}
          </div>
        </div>

        {emergencyAssistance && (
          <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-900">
                AI জরুরি সহায়তা
              </h3>
            </div>
            <ul className="space-y-2 mb-4">
              {emergencyAssistance.immediate_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-red-800">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                  {action}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {emergencyAssistance.emergency_numbers.map((num, i) => (
                <button
                  key={i}
                  onClick={() => window.open(`tel:${num}`)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4">দ্রুত সাহায্য</h4>
          <button
            onClick={() => window.open("tel:999")}
            className="w-full p-3 bg-red-500 text-white rounded-lg mb-2 flex justify-center gap-2"
          >
            <Phone /> জরুরি (৯৯৯)
          </button>
          <button
            onClick={() => window.open("tel:1090")}
            className="w-full p-3 bg-orange-500 text-white rounded-lg flex justify-center gap-2"
          >
            <Phone /> দুর্যোগ (১০৯০)
          </button>
        </div>
      </div>
    </div>
  </div>
);
