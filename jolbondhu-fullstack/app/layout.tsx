import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Leaf } from "lucide-react";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
});

export const metadata: Metadata = {
  title: "জলবন্ধু - এআই বন্যা ও ফসল ঝুঁকি সহকারী",
  description:
    "বাংলাদেশের কৃষকদের জন্য এআই প্রযুক্তিভিত্তিক বন্যা পূর্বাভাস ও ফসল রক্ষার পরামর্শ সেবা",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="scroll-smooth">
      <body className={`${hindSiliguri.className} jute-texture`}>
        {/* সবুজ পটভূমি এলিমেন্ট */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <Header />
        <main className="container mx-auto px-4 py-6">{children}</main>

        <footer className="mt-16 border-t-2 border-green-200 bg-gradient-to-b from-white to-green-50">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800">জলবন্ধু</h3>
                </div>
                <p className="text-green-700 text-sm">
                  বাংলাদেশের কৃষকদের জন্য এআই প্রযুক্তিভিত্তিক বন্যা পূর্বাভাস ও
                  ফসল রক্ষার পরামর্শ সেবা
                </p>
              </div>

              <div>
                <h4 className="font-bold text-green-800 mb-4">দ্রুত লিংক</h4>
                <ul className="space-y-2">
                  {[
                    "ঝুঁকি মানচিত্র",
                    "পরামর্শ কেন্দ্র",
                    "কৃষক সম্প্রদায়",
                    "প্রশিক্ষণ ভিডিও",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-green-700 hover:text-green-600 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-green-800 mb-4">যোগাযোগ</h4>
                <ul className="space-y-2 text-green-700">
                  <li>ইমেইল: support@jolbondhu.bd</li>
                  <li>হেল্পলাইন: ১৬১২৩</li>
                  <li>এসএমএস: JOLBONDHU থেকে ১০৯০</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-green-800 mb-4">অংশীদার</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-green-700">
                      কৃষি মন্ত্রণালয়
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-green-700">
                      বাংলাদেশ আবহাওয়া অধিদপ্তর
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-green-200 mt-8 pt-8 text-center">
              <p className="text-green-700">
                © {new Date().getFullYear()} জলবন্ধু - বাংলাদেশের কৃষকের
                বিশ্বস্ত সঙ্গী
              </p>
              <p className="text-sm text-green-600 mt-2">
                🇧🇩 বাংলাদেশ সরকারের সহযোগিতায়
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
