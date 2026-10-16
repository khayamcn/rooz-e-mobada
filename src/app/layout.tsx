import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeBootstrap } from "@/components/theme-bootstrap";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F4F8" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F1E" },
  ],
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
  // Inline script prevents theme flash by applying the dark class
  // before any React code runs. It reads from localStorage (zustand persist key).
  const themeScript = `
    (function() {
      try {
        var raw = localStorage.getItem('rooz-e-mobada-v1');
        var theme = 'dark';
        if (raw) {
          var parsed = JSON.parse(raw);
          theme = (parsed && parsed.state && parsed.state.theme) || 'dark';
        }
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        document.documentElement.classList.add('dark');
      }
    })();
  `;
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${vazirmatn.variable} font-vazir antialiased`}
      >
        <ThemeBootstrap />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
