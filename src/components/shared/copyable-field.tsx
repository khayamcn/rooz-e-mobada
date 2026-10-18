"use client";

import { useState, type ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyableFieldProps {
  label: string;
  value: string;
  faNum?: boolean;
  dir?: "rtl" | "ltr";
  compact?: boolean;
  icon?: ReactNode;
  copyable?: boolean;
}

export function CopyableField({
  label,
  value,
  faNum = true,
  dir = "rtl",
  compact = false,
  icon,
  copyable = true,
}: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-soft text-[11px] shrink-0">{label}:</span>
        <span
          dir={dir}
          className={cn("text-strong font-medium text-[11px] truncate flex-1", faNum && "fa-num")}
        >
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`کپی ${label}`}
            className="shrink-0 w-6 h-6 rounded-md brand-bg-soft brand-text flex items-center justify-center transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 min-w-0">
      {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-soft mb-0.5">{label}</p>
        <div className="flex items-center gap-1.5">
          <p
            dir={dir}
            className={cn(
              "text-sm text-strong font-semibold flex-1 min-w-0 truncate",
              faNum && "fa-num"
            )}
          >
            {value || "—"}
          </p>
          {copyable && value && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={`کپی ${label}`}
              className="shrink-0 w-7 h-7 rounded-lg brand-bg-soft brand-text flex items-center justify-center transition-colors active:scale-90"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CopyChip({ value, label = "کپی", size = "sm" }: { value: string; label?: string; size?: "sm" | "md" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`کپی ${label}`}
      className={cn(
        "shrink-0 rounded-lg brand-bg-soft brand-text flex items-center justify-center transition-colors active:scale-90",
        size === "sm" ? "w-7 h-7" : "w-8 h-8 px-2"
      )}
    >
      {copied ? (
        <Check className={size === "sm" ? "w-3.5 h-3.5 text-emerald-500" : "w-4 h-4 text-emerald-500"} />
      ) : (
        <Copy className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      )}
    </button>
  );
}
