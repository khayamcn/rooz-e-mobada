"use client";

import { Sparkles, X, Cloud, Shield, Star } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ScreenId } from "@/components/bottom-nav";

interface AdsBannerProps {
  onNavigate?: (id: ScreenId) => void;
}

const ADS = [
  {
    id: "ad-cloud",
    icon: Cloud,
    title: "فضای ابری نامحدود",
    subtitle: "همه مدارک خانواده در یکجا، امن و قابل دسترس",
    cta: "شروع کنید",
    target: "cloud" as ScreenId,
    gradient: "from-violet-500 to-fuchsia-600",
  },
  {
    id: "ad-backup",
    icon: Shield,
    title: "بکاپ‌گیری خودکار",
    subtitle: "هرگز نگران از دست رفتن اطلاعات نباشید",
    cta: "تنظیم بکاپ",
    target: "settings" as ScreenId,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "ad-pro",
    icon: Star,
    title: "نسخه حرفه‌ای بازار",
    subtitle: "با حذف تبلیغات و فضای بیشتر، تجربه بهتری داشته باشید",
    cta: "ارتقا به پرو",
    target: "settings" as ScreenId,
    gradient: "from-amber-500 to-orange-600",
  },
];

/**
 * AdsBanner — promotional section for Bazaar publication.
 * Rotates through several promotional cards. User can dismiss individual ads.
 */
export function AdsBanner({ onNavigate }: AdsBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState(0);

  const visibleAds = ADS.filter((a) => !dismissed.has(a.id));
  if (visibleAds.length === 0) return null;

  const ad = visibleAds[current % visibleAds.length];
  const Icon = ad.icon;

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
    setCurrent((c) => (c + 1) % visibleAds.length);
  };

  return (
    <section className="px-4 mb-5">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-medium text-soft flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          پیشنهاد ویژه
        </span>
        <span className="text-[9px] text-soft">تبلیغات</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "rounded-2xl p-4 bg-gradient-to-br text-white relative overflow-hidden shadow-glow",
            ad.gradient
          )}
        >
          {/* Decorative shapes */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <button
            type="button"
            onClick={() => dismiss(ad.id)}
            aria-label="بستن تبلیغ"
            className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center backdrop-blur transition-colors z-10"
          >
            <X className="w-3 h-3" />
          </button>

          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{ad.title}</p>
              <p className="text-[11px] opacity-80 mt-0.5 line-clamp-2">{ad.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.(ad.target)}
            className="relative w-full mt-3 py-2 rounded-xl bg-white/95 text-slate-900 text-xs font-bold hover:bg-white transition-colors"
          >
            {ad.cta}
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Ad dots indicator */}
      {visibleAds.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {visibleAds.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all",
                i === current % visibleAds.length ? "w-4 bg-violet-500" : "w-1.5 bg-slate-300 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
