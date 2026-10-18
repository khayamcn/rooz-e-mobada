"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Phone,
  ShieldCheck,
  Wifi,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/lib/store";

interface Slide {
  icon: typeof Lock;
  title: string;
  subtitle: string;
  isLast?: boolean;
}

const SLIDES: Slide[] = [
  {
    icon: Sparkles,
    title: "برای روزهایی که اطلاعات مهم، حیاتی می‌شوند",
    subtitle:
      "روز مبادا همراه همیشگی شما برای نگهداری امن اطلاعات ضروری خانواده است.",
  },
  {
    icon: ShieldCheck,
    title: "اطلاعات ضروری خانواده، یکجا",
    subtitle:
      "افراد، اسناد، کارت‌ها، قبوض و رمزها — همه به‌صورت منظم و قابل دسترس کنار هم.",
  },
  {
    icon: Wifi,
    title: "دسترسی حتی بدون اینترنت",
    subtitle:
      "تمام اطلاعات روی گوشی شما ذخیره می‌شود؛ نیازی به اتصال دائمی به اینترنت نیست.",
  },
  {
    icon: Lock,
    title: "حریم خصوصی در اولویت",
    subtitle:
      "هیچ اطلاعاتی به سرور ارسال نمی‌شود. کنترل کامل در دست شماست.",
  },
  {
    icon: CheckCircle2,
    title: "امروز آماده باش، فردا آسوده‌تر",
    subtitle:
      "برای پشتیبانی و فعال‌سازی با شماره ۰۹۳۵۲۶۰۰۰۱۸ در تماس باشید.",
    isLast: true,
  },
];

export function Onboarding() {
  const [index, setIndex] = useState(0);
  const completeOnboarding = useApp((s) => s.completeOnboarding);

  const current = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const Icon = current.icon;

  const next = () => {
    if (isLast) {
      completeOnboarding();
      return;
    }
    setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
  };
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <div className="flex items-center justify-between px-5 pt-6">
        <span className="text-xs text-soft">روز مبادا</span>
        {!isLast ? (
          <button
            type="button"
            onClick={completeOnboarding}
            className="text-xs text-soft pressable px-3 py-1.5 rounded-full surface-input"
          >
            رد کردن
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
            <CheckCircle2 size={12} /> بله
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-8">
                <div
                  aria-hidden
                  className="absolute inset-0 brand-gradient blur-3xl opacity-30 scale-150"
                />
                <div className="relative h-28 w-28 rounded-3xl brand-gradient flex items-center justify-center text-white shadow-glow">
                  <Icon size={56} strokeWidth={1.6} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-strong leading-relaxed mb-3">
                {current.title}
              </h2>
              <p className="text-sm text-soft leading-relaxed">
                {current.subtitle}
              </p>

              {current.isLast && (
                <a
                  href="tel:09352600018"
                  dir="ltr"
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl surface-card pressable"
                >
                  <Phone size={16} className="text-violet-600" />
                  <span className="font-mono text-sm font-bold text-strong">
                    09352600018
                  </span>
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="px-6 pb-10">
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 brand-gradient"
                  : "w-1.5 bg-violet-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            aria-label="قبلی"
            className="h-11 w-11 rounded-full surface-card flex items-center justify-center pressable disabled:opacity-40"
          >
            <ChevronRight size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            className="flex-1 h-11 rounded-full brand-gradient text-white font-bold text-sm pressable shadow-glow"
          >
            {isLast ? "شروع کنیم" : "بعدی"}
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="بعدی"
            className="h-11 w-11 rounded-full surface-card flex items-center justify-center pressable"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
