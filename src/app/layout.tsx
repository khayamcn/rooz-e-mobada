import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeBootstrap } from "@/components/theme-bootstrap";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "روز مبادا",
  description: "مخزن امن اطلاعات ضروری خانواده — آفلاین و خصوصی",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

// Inline script: read theme/colorTheme from localStorage BEFORE React hydrates.
// Prevents theme flash on first paint.
const themeBootstrapScript = `
(function () {
  try {
    var raw = localStorage.getItem("rooz-mobada-v4");
    if (!raw) return;
    var parsed = JSON.parse(raw);
    var state = parsed && parsed.state ? parsed.state : {};
    var theme = state.theme || "light";
    var colorTheme = state.colorTheme || "violet";
    var html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
    html.setAttribute("data-theme", colorTheme);
  } catch (e) {
    // ignore — fall back to defaults
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="bg-page text-strong antialiased">
        <ThemeBootstrap />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
