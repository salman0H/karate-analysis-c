import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "سامانه آنالیز بدنی | باشگاه کاراته شرکت برق منطقه‌ای خراسان",
  description:
    "سامانه هوشمند ثبت و تحلیل داده‌های بدنی ورزشکاران باشگاه کاراته شرکت برق منطقه‌ای خراسان",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50">{children}</body>
    </html>
  );
}
