"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ClipboardPaste, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/store";
import { validateToken } from "@/lib/token-validator";

export function TokenActivation() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);
  const activate = useApp((s) => s.activate);

  // Try clipboard on mount (some browsers require interaction; we attempt anyway)
  useEffect(() => {
    let cancelled = false;
    async function peek() {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          // Just probe availability; we won't read for privacy
          setHasClipboard(true);
        }
      } catch {
        if (!cancelled) setHasClipboard(false);
      }
    }
    void peek();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!token.trim()) {
      setError("لطفاً توکن را وارد کنید.");
      return;
    }
    setLoading(true);
    // simulate brief async to show spinner
    await new Promise((r) => setTimeout(r, 400));
    const ok = activate(token.trim());
    setLoading(false);
    if (!ok) {
      setError("توکن نامعتبر است. لطفاً دوباره تلاش کنید.");
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setToken(text.trim());
        return;
      }
    } catch {
      // ignore
    }
    setError("امکان دسترسی به کلیپ‌بورد وجود ندارد. لطفاً توکن را به‌صورت دستی وارد کنید.");
  };

  const isValid = validateToken(token.trim());

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div
              aria-hidden
              className="absolute inset-0 brand-gradient blur-3xl opacity-30 scale-150"
            />
            <div className="relative h-20 w-20 rounded-3xl brand-gradient flex items-center justify-center text-white shadow-glow">
              <KeyRound size={36} strokeWidth={1.8} />
            </div>
          </div>
          <h1 className="text-xl font-bold text-strong">فعال‌سازی برنامه</h1>
          <p className="text-sm text-soft mt-2 text-center leading-relaxed">
            برای استفاده از روز مبادا، توکن دریافتی خود را وارد کنید.
          </p>
        </div>

        <div className="surface-card rounded-card p-5 space-y-3">
          <label className="text-xs text-soft block">توکن فعال‌سازی</label>
          <div className="relative">
            <input
              type="text"
              dir="ltr"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="توکن خود را وارد کنید"
              className="font-mono text-sm pl-10"
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="off"
            />
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400"
            />
          </div>

          {hasClipboard && (
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center gap-1.5 text-xs text-brand-text pressable"
            >
              <ClipboardPaste size={14} /> جسباندن از کلیپ‌بورد
            </button>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 px-3 py-2 rounded-card-sm">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !token.trim()}
            className="w-full h-11 rounded-full brand-gradient text-white font-bold text-sm pressable shadow-glow flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> در حال بررسی...
              </>
            ) : (
              "فعال‌سازی"
            )}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-faint">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>اطلاعات شما به‌صورت آفلاین روی همین دستگاه ذخیره می‌شود.</span>
        </div>

        {isValid && (
          <div className="mt-4 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2 rounded-card-sm text-center">
            توکن معتبر است. روی «فعال‌سازی» بزنید.
          </div>
        )}
      </div>
    </div>
  );
}
