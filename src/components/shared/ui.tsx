"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padded?: boolean;
  /** Highlight this card as active/selected */
  active?: boolean;
  /**
   * When true, AppCard renders as a <div> instead of a <button>, even if
   * onClick is provided. Useful when children contain nested buttons
   * (HTML forbids <button> inside <button>).
   */
  asDiv?: boolean;
}

export function AppCard({
  children,
  className,
  onClick,
  padded = true,
  active = false,
  asDiv = false,
}: AppCardProps) {
  // Render as <button> only when there's an onClick AND asDiv is false.
  // Otherwise render as <div> with the click handler attached (avoids
  // invalid nested-button HTML).
  const useButton = onClick && !asDiv;
  const Comp = useButton ? "button" : "div";
  return (
    <Comp
      type={useButton ? "button" : undefined}
      onClick={onClick}
      role={onClick && asDiv ? "button" : undefined}
      tabIndex={onClick && asDiv ? 0 : undefined}
      onKeyDown={
        onClick && asDiv
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "block w-full text-right rounded-2xl surface-card overflow-hidden transition-all",
        onClick &&
          "active:scale-[0.985] hover:shadow-glow cursor-pointer",
        active && "ring-2 ring-violet-500/60 shadow-glow",
        padded && "p-4",
        className
      )}
    >
      {children}
    </Comp>
  );
}

export function SectionTitle({
  icon,
  title,
  action,
  tone = "default",
}: {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
  tone?: "default" | "alert" | "success";
}) {
  const toneClass =
    tone === "alert"
      ? "text-red-500 dark:text-red-400"
      : tone === "success"
      ? "text-emerald-500 dark:text-emerald-400"
      : "text-strong";
  return (
    <div className="flex items-center justify-between gap-2 mb-3 px-1">
      <h2
        className={cn(
          "flex items-center gap-2 text-sm font-bold",
          toneClass
        )}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {title}
      </h2>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const STATUS_TONES = {
  synced: { bg: "bg-emerald-500/15", text: "text-emerald-500 dark:text-emerald-300", dot: "bg-emerald-500", label: "همگام‌شده" },
  pending: { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-300", dot: "bg-amber-500", label: "در صف" },
  conflict: { bg: "bg-red-500/15", text: "text-red-500 dark:text-red-300", dot: "bg-red-500", label: "تعارض" },
  failed: { bg: "bg-red-500/15", text: "text-red-500 dark:text-red-300", dot: "bg-red-500", label: "خطا" },
  valid: { bg: "bg-emerald-500/15", text: "text-emerald-500 dark:text-emerald-300", dot: "bg-emerald-500", label: "معتبر" },
  expiring: { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-300", dot: "bg-amber-500", label: "رو به انقضا" },
  expired: { bg: "bg-red-500/15", text: "text-red-500 dark:text-red-300", dot: "bg-red-500", label: "منقضی" },
} as const;

export type StatusTone = keyof typeof STATUS_TONES;

export function StatusBadge({
  tone,
  label,
}: {
  tone: StatusTone;
  label?: string;
}) {
  const t = STATUS_TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold",
        t.bg,
        t.text
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", t.dot)} />
      {label ?? t.label}
    </span>
  );
}

const FILE_STATES = {
  local_only: { label: "ذخیره محلی", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  uploading: { label: "در صف آپلود", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  uploaded: { label: "در فضای ابری", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  downloading: { label: "در حال دانلود", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  cached: { label: "روی دستگاه", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
} as const;

export function FileAttachmentChip({
  status,
  label,
}: {
  status: keyof typeof FILE_STATES;
  label: string;
}) {
  const s = FILE_STATES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium",
        s.tone
      )}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
      <span className="truncate">{label}</span>
      <span className="opacity-50">·</span>
      <span className="opacity-90">{s.label}</span>
    </span>
  );
}

/**
 * IconButton — compact circular button used in headers / list rows.
 */
export function IconButton({
  children,
  onClick,
  variant = "ghost",
  className,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "solid" | "outline";
  className?: string;
  "aria-label"?: string;
}) {
  const variants = {
    ghost:
      "bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/15",
    solid:
      "bg-violet-500 text-white hover:bg-violet-600 shadow-glow",
    outline:
      "bg-transparent border border-violet-500/40 text-violet-500 dark:text-violet-300 hover:bg-violet-500/10",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center transition-colors active:scale-95",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
