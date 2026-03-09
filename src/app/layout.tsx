import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "دليلك - لوحة التحكم",
  description: "لوحة تحكم تطبيق دليلك",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased bg-gray-50`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
