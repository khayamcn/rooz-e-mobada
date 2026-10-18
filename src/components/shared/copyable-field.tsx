"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

interface CopyableFieldProps {
  label: string;
  value: string;
  dir?: "rtl" | "ltr";
  mono?: boolean;
}

export function CopyableField({
  label,
  value,
  dir = "ltr",
  mono = false,
}: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(value);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="surface-input rounded-card-sm p-3 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-[10px] text-soft mb-0.5">{label}</div>
        <div
          dir={dir}
          className={`text-strong text-sm font-medium truncate ${
            mono ? "font-mono" : ""
          }`}
        >
          {value || "—"}
        </div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`کپی ${label}`}
        className="shrink-0 h-9 w-9 rounded-lg brand-bg-soft text-brand-text flex items-center justify-center pressable"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

export function CopyChip({
  value,
  label,
  size = 32,
  tone = "default",
}: {
  value: string;
  label?: string;
  size?: number;
  tone?: "default" | "glass";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(value);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  const toneClass =
    tone === "glass"
      ? "bg-white/20 text-white hover:bg-white/30"
      : "brand-bg-soft text-brand-text";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label || "کپی"}
      style={{ height: size, width: size }}
      className={`shrink-0 rounded-lg flex items-center justify-center pressable ${toneClass}`}
    >
      {copied ? <Check size={Math.max(12, size - 14)} /> : <Copy size={Math.max(12, size - 14)} />}
    </button>
  );
}
