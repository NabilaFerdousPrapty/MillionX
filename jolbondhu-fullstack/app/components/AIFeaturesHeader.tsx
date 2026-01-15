import { Brain, Sparkles } from "lucide-react";

export const AIFeaturesHeader = () => (
  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8" />
          <h2 className="text-2xl font-bold">JolBondhu AI Assistant</h2>
        </div>
        <p className="opacity-90">
          কৃত্রিম বুদ্ধিমত্তা ভিত্তিক বন্যা পূর্বাভাস ও কৃষি পরামর্শ
        </p>
      </div>
      <div className="hidden md:block">
        <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
          <Sparkles className="h-4 w-4" />
          <span>Real-time AI Analysis</span>
        </div>
      </div>
    </div>
  </div>
);
