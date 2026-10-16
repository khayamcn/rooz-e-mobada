"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, KeyRound, ClipboardPaste, Loader2, Lock } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function TokenActivation() {
  const activate = useApp((s) => s.activate);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clipboardDetected, setClipboardDetected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-detect clipboard on mount — if user copied a token before
  // launching the app, paste it automatically.
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        if (navigator.clipboard?.readText) {
          const text = await navigator.clipboard.readText();
          if (text && text.length > 20 && text.length < 100) {
            setToken(text);
            setClipboardDetected(true);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }
        }
      } catch {
        // Clipboard read blocked — user must paste manually
      }
    };
    const t = setTimeout(checkClipboard, 500);
    return () => clearTimeout(t);
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setToken(text);
      setError(null);
    } catch {
      setError("دسترسی به حافظه موقت ممکن نیست. توکن را دستی وارد کنید.");
    }
  };

  const handleActivate = () => {
    if (!token.trim()) {
      setError("لطفاً توکن فعال‌سازی را وارد کنید.");
      return;
    }
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const ok = activate(token);
      if (!ok) {
        setError("توکن نامعتبر است. لطفاً توکن صحیح را از تولیدکننده دریافت کنید.");
      }
      setLoading(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleActivate();
    }
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

      <div className="relative flex-1 flex flex-col items-center justify-center p-8 z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-6 shadow-glow"
        >
          <ShieldCheck className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold mb-2"
        >
          روز مبادا
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-white/70 mb-8 max-w-xs text-center"
        >
          پرونده اضطراری خانواده — برای فعال‌سازی، توکن دریافتی از تولیدکننده را وارد کنید.
        </motion.p>

        {clipboardDetected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            توکن از حافظه موقت کپی شد
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm"
        >
          <label className="flex items-center gap-1.5 text-xs font-semibold text-white/80 mb-2">
            <KeyRound className="w-3.5 h-3.5" />
            توکن فعال‌سازی
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="توکن را اینجا وارد کنید..."
              className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 transition-all font-mono"
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
            />
            {token && (
              <button
                type="button"
                onClick={() => setToken("")}
                className="absolute top-1/2 -translate-y-1/2 left-3 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60"
                aria-label="پاک کردن"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handlePaste}
            className="mt-2 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            جای‌گذاری از حافظه موقت
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          <button
            type="button"
            onClick={handleActivate}
            disabled={!token.trim() || loading}
            className={cn(
              "w-full mt-4 py-3.5 rounded-2xl font-bold shadow-glow active:scale-95 transition-all flex items-center justify-center gap-2",
              token.trim() && !loading
                ? "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white"
                : "bg-white/5 text-white/40 cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                در حال بررسی...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                فعال‌سازی برنامه
              </>
            )}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-[10px] text-white/40 text-center max-w-xs"
        >
          این توکن فقط توسط تولیدکننده نرم‌افزار صادر می‌شود و برای فعال‌سازی دائمی برنامه روی این دستگاه استفاده می‌شود.
        </motion.p>
      </div>
    </div>
  );
}
