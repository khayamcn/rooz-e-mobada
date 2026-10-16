"use client";

import { useState, type ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyableFieldProps {
  label: string;
  value: string;
  /** Render the value with Persian numerals (default true) */
  faNum?: boolean;
  /** Direction of the value display (default rtl) */
  dir?: "rtl" | "ltr";
  /** Compact mode — single line, used inside dense lists */
  compact?: boolean;
  /** Custom className for the value text */
  valueClassName?: string;
  /** Optional icon shown before the label */
  icon?: ReactNode;
  /** If false, hides the copy button (e.g. for already-copied displays) */
  copyable?: boolean;
  /** Called after copy succeeds */
  onCopy?: () => void;
}

/**
 * CopyableField — a label/value pair with a built-in copy button.
 * Used for every important piece of information the user might want
 * to extract from the app: national ID, phone, document numbers,
 * plate, chassis, insurance codes, addresses, etc.
 *
 * On copy, shows a check icon for ~1.5s.
 */
export function CopyableField({
  label,
  value,
  faNum = true,
  dir = "rtl",
  compact = false,
  valueClassName,
  icon,
  copyable = true,
  onCopy,
}: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for browsers without clipboard API
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silently fail — copy is a nice-to-have, not critical
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-soft text-[11px] shrink-0">{label}:</span>
        <span
          dir={dir}
          className={cn(
            "text-strong font-medium text-[11px] truncate flex-1",
            faNum && "fa-num",
            valueClassName
          )}
        >
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`کپی ${label}`}
            className="shrink-0 w-6 h-6 rounded-md bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 dark:text-violet-300 flex items-center justify-center transition-colors"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
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
              faNum && "fa-num",
              valueClassName
            )}
          >
            {value || "—"}
          </p>
          {copyable && value && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={`کپی ${label}`}
              className="shrink-0 w-7 h-7 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 dark:text-violet-300 flex items-center justify-center transition-colors active:scale-90"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * CopyChip — minimal inline copy button, used next to already-rendered
 * values where layout space is tight (e.g. inside credential cards).
 */
export function CopyChip({
  value,
  label = "کپی",
  size = "sm",
}: {
  value: string;
  label?: string;
  size?: "sm" | "md";
}) {
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
        "shrink-0 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 dark:text-violet-300 flex items-center justify-center gap-1 transition-colors active:scale-90",
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
