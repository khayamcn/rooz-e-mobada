import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "روز مبادا | پرونده اضطراری خانواده",
  description:
    "پرونده دیجیتال اضطراری خانواده؛ دسترسی آفلاین به مدارک، تماس‌های ضروری، راهنماهای بحران و همگام‌سازی امن برای لحظات بحرانی.",
  keywords: [
    "روز مبادا",
    "پرونده اضطراری",
    "مدارک خانواده",
    "تماس‌های اضطراری",
    "راهنمای بحران",
    "آفلاین",
    "بازار",
    "اندروید",
  ],
  authors: [{ name: "Rooz-e Mobada Team" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "روز مبادا",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  applicationName: "روز مبادا",
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} font-vazir antialiased bg-slate-100 text-slate-900`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
