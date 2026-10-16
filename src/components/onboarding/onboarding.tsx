"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Users, WifiOff, Lock, Sparkles, ChevronLeft, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersian } from "@/lib/persian";

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    id: 1,
    title: "برای روزهایی که اطلاعات مهم، حیاتی می‌شوند",
    text: "هدف برنامه، آماده نگه‌داشتن اطلاعات مهم برای شرایط غیرمنتظره است. پرونده امن دیجیتال خانواده شما.",
    icon: ShieldCheck,
    color: "from-violet-500 to-fuchsia-600",
  },
  {
    id: 2,
    title: "اطلاعات ضروری خانواده، یکجا",
    text: "اعضای خانواده، شماره تماس‌ها، مدارک، بیمه، اطلاعات خودرو و راهنماهای ضروری — همگی در یکجا.",
    icon: Users,
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: 3,
    title: "دسترسی حتی بدون اینترنت",
    text: "اطلاعاتی که روی دستگاه ذخیره شده‌اند، بدون اتصال اینترنت قابل استفاده هستند. کاملاً آفلاین.",
    icon: WifiOff,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 4,
    title: "حریم خصوصی در اولویت",
    text: "رمزنگاری اطلاعات، پشتیبان‌گیری رمزنگاری‌شده و کنترل کامل کاربر بر داده‌ها. اطلاعات فقط روی دستگاه شما.",
    icon: Lock,
    color: "from-rose-500 to-pink-600",
  },
  {
    id: 5,
    title: "امروز آماده باش، فردا آسوده‌تر",
    text: "برای دریافت توکن فعال‌سازی، با شماره موبایل ۰۹۳۵۲۶۰۰۰۱۸ در پیام‌رسان بله پیام دهید و کلید ورود به نرم‌افزار را خریداری کنید.",
    icon: Sparkles,
    color: "from-amber-500 to-orange-600",
    isFinal: true,
  },
] as const;

export function Onboarding({ onComplete }: OnboardingProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  const next = () => {
    if (isLast) return;
    setDirection(1);
    setCurrent((c) => Math.min(SLIDES.length - 1, c + 1));
  };
  const prev = () => {
    if (current === 0) return;
    setDirection(-1);
    setCurrent((c) => Math.max(0, c - 1));
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-violet-950 via-slate-900 to-violet-950 text-white relative overflow-hidden">
      <motion.div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {!isLast && (
        <button
          type="button"
          onClick={onComplete}
          className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-xs font-semibold transition-colors"
        >
          رد کردن
        </button>
      )}

      <div className="relative flex-1 flex flex-col items-center justify-center p-8 z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -60 : 60 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            <div className={cn(
              "relative w-40 h-40 rounded-3xl bg-gradient-to-br mb-8 shadow-glow flex items-center justify-center overflow-hidden",
              slide.color
            )}>
              <slide.icon className="w-20 h-20 text-white" strokeWidth={1.5} />
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold mb-3"
            >
              {slide.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-white/80 leading-relaxed"
            >
              {slide.text}
            </motion.p>

            {isLast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 w-full"
              >
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-right flex-1 min-w-0">
                    <p className="text-[11px] text-white/60">شماره تماس برای توکن</p>
                    <p className="text-sm font-bold fa-num" dir="ltr">09352600018</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded-lg">بله</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative p-6 z-20 safe-bottom">
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              aria-label={`اسلاید ${toPersian(i + 1)}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === current ? "w-8 bg-violet-400" : "w-1.5 bg-white/30"
              )}
            />
          ))}
        </div>

        {isLast ? (
          <button
            type="button"
            onClick={onComplete}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white font-bold shadow-glow active:scale-95 transition-transform"
          >
            ادامه به فعال‌سازی
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {current > 0 && (
              <button
                type="button"
                onClick={prev}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="قبلی"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white font-bold shadow-glow active:scale-95 transition-transform"
            >
              ادامه
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
