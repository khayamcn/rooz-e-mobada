"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ChevronLeft, RefreshCw, KeyRound, Users, Plus, ArrowLeft } from "lucide-react";
import { toPersian } from "@/lib/persian";

/**
 * AuthFlow — orchestrates signup → OTP → family create/join → main app.
 */
export function AuthFlow() {
  const authScreen = useApp((s) => s.authScreen);
  const pendingOtp = useApp((s) => s.pendingOtp);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-violet-950 via-slate-900 to-violet-950 text-white">
      <AnimatePresence mode="wait">
        {authScreen === "splash" && <SplashStep key="splash" />}
        {authScreen === "signup" && <SignupStep key="signup" />}
        {authScreen === "otp" && <OtpStep key="otp" otp={pendingOtp} />}
        {authScreen === "create-family" && <CreateFamilyStep key="create" />}
        {authScreen === "join-family" && <JoinFamilyStep key="join" />}
      </AnimatePresence>
    </div>
  );
}

function SplashStep() {
  const setAuthScreen = useApp((s) => s.setAuthScreen);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-6 shadow-glow"
      >
        <ShieldCheck className="w-12 h-12 text-white" />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-2"
      >
        روز مبادا
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-white/70 mb-12 max-w-xs"
      >
        پرونده دیجیتال اضطراری خانواده — دسترسی آفلاین به مدارک، تماس‌ها،
        راهنماهای بحران و فضای ابری خصوصی.
      </motion.p>
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => setAuthScreen("signup")}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white font-bold shadow-glow active:scale-95 transition-transform"
      >
        شروع استفاده
      </motion.button>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-[10px] text-white/40 mt-6"
      >
        نسخه ۱.۲.۰ · قابل نصب از بازار
      </motion.p>
    </motion.div>
  );
}

function SignupStep() {
  const setAuthScreen = useApp((s) => s.setAuthScreen);
  const signup = useApp((s) => s.signup);

  const [mobile, setMobile] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!displayName.trim()) next.displayName = "نام نمایشی الزامی است";
    if (!/^09\d{9}$/.test(mobile.replace(/\s/g, "")))
      next.mobile = "شماره موبایل باید با ۰۹ شروع و ۱۱ رقم باشد";
    if (nationalId && !/^\d{10}$/.test(nationalId.replace(/\s/g, "")))
      next.nationalId = "کد ملی باید ۱۰ رقم باشد (در صورت ورود)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    signup({
      mobile: mobile.replace(/\s/g, ""),
      displayName: displayName.trim(),
      nationalId: nationalId ? nationalId.replace(/\s/g, "") : undefined,
    });
  };

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      className="flex-1 flex flex-col p-6"
    >
      <button
        type="button"
        onClick={() => setAuthScreen("splash")}
        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-6 hover:bg-white/20 transition-colors"
        aria-label="بازگشت"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-bold mb-1">ساخت حساب کاربری</h2>
      <p className="text-xs text-white/60 mb-6">
        برای تأیید هویت، یک کد یک‌بارمصرف به شماره موبایل شما ارسال می‌شود.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5">
            نام نمایشی
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="مثلاً: علی رضایی"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
          />
          {errors.displayName && (
            <p className="text-[11px] text-red-400 mt-1">{errors.displayName}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5">
            شماره موبایل
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="0912xxxxxxx"
            maxLength={11}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 fa-num"
          />
          {errors.mobile && (
            <p className="text-[11px] text-red-400 mt-1">{errors.mobile}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5">
            کد ملی (اختیاری)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder="۱۰ رقم کد ملی"
            maxLength={10}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 fa-num"
          />
          {errors.nationalId && (
            <p className="text-[11px] text-red-400 mt-1">{errors.nationalId}</p>
          )}
          <p className="text-[10px] text-white/40 mt-1">
            کد ملی صرفاً برای احراز هویت قانونی در صورت نیاز نگهداری می‌شود و
            در لاگ‌ها ثبت نمی‌گردد.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white font-bold shadow-glow active:scale-95 transition-transform mt-6"
      >
        ارسال کد تأیید
      </button>
      <div className="flex items-center gap-2 mt-6 text-[11px] text-white/50">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          اطلاعات شما با رمزنگاری AES-256 روی دستگاه و سرور محافظت می‌شود.
        </span>
      </div>
    </motion.div>
  );
}

function OtpStep({
  otp,
}: {
  otp: { mobile: string; code: string; expiresAt: number } | null;
}) {
  const verifyOtp = useApp((s) => s.verifyOtp);
  const resendOtp = useApp((s) => s.resendOtp);
  const setAuthScreen = useApp((s) => s.setAuthScreen);

  const [digits, setDigits] = useState(["", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 4) {
      const nextInput = document.getElementById(`otp-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = () => {
    const code = digits.join("");
    if (code.length !== 5) {
      setError("کد را کامل وارد کنید");
      return;
    }
    const ok = verifyOtp(code);
    if (!ok) {
      setError("کد اشتباه یا منقضی است");
    }
  };

  const handleResend = () => {
    resendOtp();
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      className="flex-1 flex flex-col p-6"
    >
      <button
        type="button"
        onClick={() => setAuthScreen("signup")}
        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-6 hover:bg-white/20 transition-colors"
        aria-label="بازگشت"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-4"
      >
        <KeyRound className="w-8 h-8 text-violet-300" />
      </motion.div>
      <h2 className="text-2xl font-bold mb-1">تأیید شماره موبایل</h2>
      <p className="text-xs text-white/60 mb-6">
        کد ۵ رقمی به شماره{" "}
        <span className="text-violet-300 font-bold fa-num" dir="ltr">
          {toPersian(otp?.mobile ?? "")}
        </span>{" "}
        ارسال شد.
      </p>
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-[11px] text-amber-300 mb-6 flex items-start gap-2">
        <span>ℹ️</span>
        <span>
          نسخه نمایشی: کد تأیید <span className="font-bold fa-num">{otp?.code}</span> است. در
          نسخه نهایی کد از طریق پیامک ارسال می‌شود.
        </span>
      </div>
      <div className="flex gap-2 justify-between mb-6" dir="ltr">
        {digits.map((d, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-12 h-14 text-center text-xl font-bold bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 fa-num"
          />
        ))}
      </div>
      {error && (
        <p className="text-[11px] text-red-400 mb-3 text-center">{error}</p>
      )}
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white font-bold shadow-glow active:scale-95 transition-transform"
      >
        تأیید و ادامه
      </button>
      <div className="flex items-center justify-center gap-2 mt-4 text-[11px]">
        {resendCooldown > 0 ? (
          <span className="text-white/50 fa-num">
            ارسال مجدد در {toPersian(resendCooldown)} ثانیه
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="flex items-center gap-1.5 text-violet-300 hover:text-violet-200"
          >
            <RefreshCw className="w-3 h-3" />
            ارسال مجدد کد
          </button>
        )}
      </div>
    </motion.div>
  );
}

function CreateFamilyStep() {
  const createFamily = useApp((s) => s.createFamily);
  const setAuthScreen = useApp((s) => s.setAuthScreen);
  const [title, setTitle] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const handleCreate = () => {
    if (!title.trim()) return;
    const code = createFamily(title.trim());
    setInviteCode(code);
  };

  if (inviteCode) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4"
        >
          <Users className="w-10 h-10 text-emerald-300" />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">خانواده ایجاد شد!</h2>
        <p className="text-xs text-white/60 mb-6">
          این کد دعوت را با اعضای خانواده به اشتراک بگذارید.
        </p>
        <div className="w-full bg-white/5 border-2 border-dashed border-violet-400/40 rounded-2xl p-6 mb-4">
          <p className="text-[11px] text-white/60 mb-1">کد دعوت خانواده</p>
          <p className="text-3xl font-bold tracking-[0.3em] text-violet-300 fa-num">
            {inviteCode}
          </p>
        </div>
        <p className="text-[10px] text-white/40 mb-6">
          این کد ۷ روز معتبر است و قابل ابطال توسط شماست.
        </p>
        <button
          type="button"
          onClick={() => setAuthScreen("main-app")}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white font-bold shadow-glow active:scale-95 transition-transform"
        >
          ورود به برنامه
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex-1 flex flex-col p-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-4">
        <Plus className="w-8 h-8 text-violet-300" />
      </div>
      <h2 className="text-2xl font-bold mb-1">ایجاد خانواده</h2>
      <p className="text-xs text-white/60 mb-6">
        شما سرپرست اولیه خانواده خواهید بود و می‌توانید اعضای دیگر را دعوت کنید.
      </p>
      <label className="block text-xs font-semibold text-white/80 mb-1.5">
        نام خانواده
      </label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="مثلاً: خانواده رضایی"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 mb-6"
      />
      <button
        type="button"
        onClick={handleCreate}
        disabled={!title.trim()}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white font-bold shadow-glow active:scale-95 transition-transform disabled:opacity-40"
      >
        ایجاد خانواده
      </button>
      <div className="flex items-center gap-2 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[11px] text-white/40">یا</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <button
        type="button"
        onClick={() => setAuthScreen("join-family")}
        className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        پیوستن به خانواده موجود
      </button>
    </motion.div>
  );
}

function JoinFamilyStep() {
  const joinFamily = useApp((s) => s.joinFamily);
  const setAuthScreen = useApp((s) => s.setAuthScreen);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleJoin = () => {
    if (!/^[A-Z0-9]{6}$/i.test(code)) {
      setError("کد دعوت باید ۶ کاراکتر (حروف انگلیسی و عدد) باشد");
      return;
    }
    const ok = joinFamily(code.toUpperCase());
    if (!ok) setError("کد نامعتبر یا منقضی است");
  };

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex-1 flex flex-col p-6"
    >
      <button
        type="button"
        onClick={() => setAuthScreen("create-family")}
        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-6 hover:bg-white/20 transition-colors"
        aria-label="بازگشت"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-violet-300" />
      </div>
      <h2 className="text-2xl font-bold mb-1">پیوستن به خانواده</h2>
      <p className="text-xs text-white/60 mb-6">
        کد دعوت ۶ رقمی را که از سرپرست خانواده دریافت کرده‌اید وارد کنید.
      </p>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="مثلاً: RZ7Q2X"
        maxLength={6}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-4 text-center text-2xl font-bold tracking-[0.3em] text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 mb-3"
        dir="ltr"
      />
      {error && (
        <p className="text-[11px] text-red-400 mb-3 text-center">{error}</p>
      )}
      <button
        type="button"
        onClick={handleJoin}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white font-bold shadow-glow active:scale-95 transition-transform"
      >
        پیوستن به خانواده
      </button>
    </motion.div>
  );
}
