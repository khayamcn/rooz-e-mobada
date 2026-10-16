"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Plus, UserPlus, ChevronLeft,
} from "lucide-react";
import { toPersian } from "@/lib/persian";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    id: 1,
    title: "برای روز مبادا",
    text: "بعضی اطلاعات را امیدواریم هیچ‌وقت لازم نشوند؛ اما اگر روزی به آن‌ها نیاز داشتیم، باید در دسترس باشند.",
    illustration: "family-warm",
    accent: "from-violet-500 to-fuchsia-600",
  },
  {
    id: 2,
    title: "اطلاعات مهم، یک‌جا",
    text: "مدارک، اطلاعات خودرو، بیمه، شماره‌های ضروری و دستورالعمل‌های مهم خانواده را در یک پرونده منظم نگه دارید.",
    illustration: "folders-organized",
    accent: "from-violet-500 to-purple-600",
  },
  {
    id: 3,
    title: "خصوصی و خانوادگی",
    text: "روز مبادا برای نگهداری و دسترسی کنترل‌شده به اطلاعات خانواده طراحی شده است؛ دسترسی فقط برای افراد مجاز.",
    illustration: "family-private",
    accent: "from-fuchsia-500 to-pink-600",
  },
  {
    id: 4,
    title: "امنیت، از ابتدا",
    text: "احراز هویت، کنترل دسترسی و محافظت از اطلاعات، بخش اصلی طراحی روز مبادا است.",
    illustration: "secure-lock",
    accent: "from-blue-500 to-violet-600",
  },
  {
    id: 5,
    title: "خانواده آماده‌تر",
    text: "پرونده خانواده خود را بسازید تا اطلاعات ضروری، هنگام نیاز، راحت‌تر در دسترس باشند.",
    illustration: "ready-family",
    accent: "from-emerald-500 to-teal-600",
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

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-violet-950 via-slate-900 to-violet-950 text-white relative overflow-hidden">
      <motion.div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {!isLast && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-12 left-4 z-30 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-xs font-semibold transition-colors"
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
              "relative w-48 h-48 rounded-3xl bg-gradient-to-br mb-8 shadow-glow flex items-center justify-center overflow-hidden",
              slide.accent
            )}>
              <Illustration name={slide.illustration} />
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10 blur-xl pointer-events-none" />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-3"
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
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative p-6 z-20 safe-bottom">
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              aria-label={`اسلاید ${toPersian(i + 1)}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === current ? "w-8 bg-violet-400" : "w-1.5 bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </div>

        {isLast ? (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onComplete()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold shadow-glow active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              ساخت پرونده خانواده
            </button>
            <button
              type="button"
              onClick={() => onComplete()}
              className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              پیوستن به خانواده
            </button>
          </div>
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

function Illustration({ name }: { name: string }) {
  switch (name) {
    case "family-warm":
      return (
        <svg viewBox="0 0 100 100" className="w-28 h-28" fill="none">
          <path d="M20 50 L50 25 L80 50 V75 H20 Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="42" y="55" width="16" height="14" fill="white" fillOpacity="0.4" rx="2" />
          <circle cx="40" cy="68" r="4" fill="white" />
          <circle cx="50" cy="68" r="4" fill="white" fillOpacity="0.8" />
          <circle cx="60" cy="68" r="4" fill="white" fillOpacity="0.6" />
          <circle cx="50" cy="20" r="3" fill="white" fillOpacity="0.7" />
          <path d="M50 8 V14 M50 26 V32 M40 20 H46 M54 20 H60" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case "folders-organized":
      return (
        <svg viewBox="0 0 100 100" className="w-28 h-28" fill="none">
          <path d="M15 30 H40 L45 38 H85 V70 H15 Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M20 40 H45 L50 48 H80" stroke="white" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6" />
          <rect x="35" y="48" width="20" height="16" rx="2" stroke="white" strokeWidth="2" />
          <line x1="40" y1="54" x2="50" y2="54" stroke="white" strokeWidth="1.2" />
          <line x1="40" y1="58" x2="48" y2="58" stroke="white" strokeWidth="1.2" />
          <rect x="60" y="50" width="14" height="20" rx="2" stroke="white" strokeWidth="2" />
          <circle cx="67" cy="66" r="1" fill="white" />
        </svg>
      );
    case "family-private":
      return (
        <svg viewBox="0 0 100 100" className="w-28 h-28" fill="none">
          <circle cx="30" cy="40" r="10" stroke="white" strokeWidth="2.5" />
          <circle cx="70" cy="40" r="10" stroke="white" strokeWidth="2.5" />
          <circle cx="50" cy="65" r="10" stroke="white" strokeWidth="2.5" />
          <line x1="38" y1="44" x2="46" y2="58" stroke="white" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
          <line x1="62" y1="44" x2="54" y2="58" stroke="white" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
          <line x1="40" y1="40" x2="60" y2="40" stroke="white" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
          <rect x="46" y="34" width="8" height="6" rx="1" fill="white" />
          <path d="M48 34 V31 a2 2 0 0 1 4 0 V34" stroke="white" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case "secure-lock":
      return (
        <svg viewBox="0 0 100 100" className="w-28 h-28" fill="none">
          <path d="M50 20 L70 28 V50 C70 65 60 75 50 80 C40 75 30 65 30 50 V28 Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M42 45 Q50 42 58 45 M44 50 Q50 48 56 50 M46 55 Q50 53 54 55" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <circle cx="50" cy="62" r="2" fill="white" />
          <ellipse cx="75" cy="30" rx="8" ry="5" stroke="white" strokeWidth="1.5" opacity="0.6" />
          <ellipse cx="25" cy="30" rx="8" ry="5" stroke="white" strokeWidth="1.5" opacity="0.6" />
        </svg>
      );
    case "ready-family":
      return (
        <svg viewBox="0 0 100 100" className="w-28 h-28" fill="none">
          <circle cx="50" cy="50" r="22" stroke="white" strokeWidth="2.5" />
          <path d="M40 50 L48 58 L62 42" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <g opacity="0.7">
            <path d="M25 25 L28 28 L31 25 L28 22 Z" fill="white" />
            <path d="M75 25 L78 28 L81 25 L78 22 Z" fill="white" />
            <path d="M20 70 L23 73 L26 70 L23 67 Z" fill="white" />
            <path d="M80 70 L83 73 L86 70 L83 67 Z" fill="white" />
          </g>
        </svg>
      );
    default:
      return <ShieldCheck className="w-20 h-20 text-white" />;
  }
}
