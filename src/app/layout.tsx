import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeBootstrap } from "@/components/theme-bootstrap";

export const metadata: Metadata = {
  title: "روز مبادا | پرونده دیجیتال خانواده",
  description:
    "پرونده دیجیتال آفلاین برای مدیریت مدارک، کارت‌های بانکی، قبوض و اطلاعات شخصی خانواده.",
  applicationName: "روز مبادا",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "روز مبادا" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
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
}: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `
    (function() {
      try {
        var raw = localStorage.getItem('rooz-e-mobada-v3');
        var theme = 'dark';
        var color = 'violet';
        if (raw) {
          var p = JSON.parse(raw);
          theme = p?.state?.theme || 'dark';
          color = p?.state?.colorTheme || 'violet';
        }
        if (theme === 'dark') document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', color);
      } catch (e) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'violet');
      }
    })();
  `;
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeBootstrap />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
