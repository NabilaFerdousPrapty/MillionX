import { Bot, MessageSquare, Phone } from "lucide-react";
import { ChatResponse } from "../types/types";

interface Props {
  chatHistory: ChatResponse[];
  userQuestion: string;
  setUserQuestion: (q: string) => void;
  handleChatSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const AIChatTab = ({
  chatHistory,
  userQuestion,
  setUserQuestion,
  handleChatSubmit,
  isLoading,
}: Props) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[500px] flex flex-col">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-bold">JolBondhu AI চ্যাট</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>কৃষি সম্পর্কিত প্রশ্ন করুন</p>
            </div>
          ) : (
            chatHistory.map((chat, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white rounded-2xl px-4 py-2 max-w-[80%]">
                    {chat.question}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-[80%]">
                    {chat.answer}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleChatSubmit} className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="প্রশ্ন লিখুন..."
            className="flex-1 border p-2 rounded-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "..." : "জিজ্ঞাসা করুন"}
          </button>
        </form>
      </div>
    </div>
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h4 className="font-bold mb-4">সরাসরি সাহায্য</h4>
        <button
          onClick={() => window.open("tel:16123")}
          className="w-full p-3 bg-green-500 text-white rounded-lg flex justify-center gap-2"
        >
          <Phone /> কৃষি হেল্পলাইন (১৬১২৩)
        </button>
      </div>
    </div>
  </div>
);
