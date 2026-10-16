"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, ChevronLeft, Phone, UserPlus, Loader2,
} from "lucide-react";
import { useApp } from "@/lib/store";

interface LoginScreenProps {
  onBack: () => void;
}

export function LoginScreen({ onBack }: LoginScreenProps) {
  const setAuthScreen = useApp((s) => s.setAuthScreen);
  const signup = useApp((s) => s.signup);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    // In production: integrate Firebase Auth with GoogleAuthProvider
    // or Android Credential Manager. The persistent Google account ID
    // is then linked to an internal user record. Here we simulate by
    // creating a user with a placeholder mobile (collected later) and
    // the Google display name.
    setTimeout(() => {
      setGoogleLoading(false);
      // Simulate Google returning a user identity
      signup({
        mobile: "09120000000", // placeholder; in production fetched from Google profile or prompted
        displayName: "کاربر گوگل",
      });
      // signup() routes to OTP screen by default; for Google Sign-In
      // we skip OTP and go straight to family creation.
      useApp.setState({ authScreen: "create-family" });
    }, 1500);
  };

  const handleMobileLogin = () => {
    setAuthScreen("signup");
  };

  const handleJoinWithCode = () => {
    setAuthScreen("join-family");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 flex flex-col p-6"
    >
      <button
        type="button"
        onClick={onBack}
        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-6 hover:bg-white/20 transition-colors"
        aria-label="بازگشت"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-6 shadow-glow"
      >
        <ShieldCheck className="w-10 h-10 text-white" />
      </motion.div>

      <h1 className="text-2xl font-bold mb-1">به روز مبادا خوش آمدید</h1>
      <p className="text-sm text-white/60 mb-8">
        برای ادامه، یکی از روش‌های ورود را انتخاب کنید.
      </p>

      <div className="space-y-3">
        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-3.5 rounded-2xl bg-white text-slate-900 font-bold shadow-glow active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-70"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
          ) : (
            <GoogleIcon />
          )}
          {googleLoading ? "در حال اتصال..." : "ادامه با حساب Google"}
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] text-white/40">یا</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Mobile login */}
        <button
          type="button"
          onClick={handleMobileLogin}
          className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2.5"
        >
          <Phone className="w-5 h-5 text-violet-300" />
          ورود با شماره موبایل
        </button>

        {/* Join with invite code */}
        <button
          type="button"
          onClick={handleJoinWithCode}
          className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2.5"
        >
          <UserPlus className="w-5 h-5 text-emerald-300" />
          پیوستن به خانواده با کد دعوت
        </button>
      </div>

      <div className="mt-8 space-y-2">
        <p className="text-[10px] text-white/40 leading-relaxed">
          🔒 با ورود، شما شرایط استفاده و سیاست حفظ حریم خصوصی روز مبادا را می‌پذیرید.
        </p>
        <p className="text-[10px] text-white/30 leading-relaxed">
          ورود با حساب Google از طریق Credential Manager رسمی اندروید انجام می‌شود. شناسه پایدار حساب شما به حساب داخلی برنامه متصل می‌شود. برای ورود معمولی، دسترسی به فایل‌های Google Drive درخواست نمی‌شود.
        </p>
      </div>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
