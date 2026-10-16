import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use static export for Capacitor (Android APK) wrapping.
  // Produces a fully static site under /out servable from Android WebView.
  output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
