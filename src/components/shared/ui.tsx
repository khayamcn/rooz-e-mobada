"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * AppCard — surface card with consistent radius, padding and shadow.
 * The default surface is white #FFFFFF, matching the design system.
 */
interface AppCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padded?: boolean;
}

export function AppCard({
  children,
  className,
  onClick,
  padded = true,
}: AppCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "block w-full text-right bg-surface rounded-2xl border border-slate-200/70 shadow-card overflow-hidden",
        onClick && "active:scale-[0.99] transition-transform",
        padded && "p-4",
        className
      )}
    >
      {children}
    </Comp>
  );
}

/**
 * SectionTitle — small heading above a group of cards.
 */
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
      ? "text-alert"
      : tone === "success"
      ? "text-success"
      : "text-text-strong";
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

/**
 * StatusBadge — small colored chip for sync status, expiry status, etc.
 */
const STATUS_TONES = {
  synced: { bg: "bg-success/10", text: "text-success", label: "همگام‌شده" },
  pending: { bg: "bg-waiting/10", text: "text-waiting", label: "در صف" },
  conflict: { bg: "bg-alert/10", text: "text-alert", label: "تعارض" },
  failed: { bg: "bg-alert/10", text: "text-alert", label: "خطا" },
  valid: { bg: "bg-success/10", text: "text-success", label: "معتبر" },
  expiring: { bg: "bg-waiting/10", text: "text-waiting", label: "رو به انقضا" },
  expired: { bg: "bg-alert/10", text: "text-alert", label: "منقضی" },
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
      <span className={cn("w-1.5 h-1.5 rounded-full", t.text.replace("text-", "bg-"))} />
      {label ?? t.label}
    </span>
  );
}

/**
 * FileAttachmentChip — shows file attach state (cached / uploading / local_only / uploaded).
 */
const FILE_STATES = {
  local_only: { label: "ذخیره محلی", tone: "bg-waiting/10 text-waiting" },
  uploading: { label: "در صف آپلود", tone: "bg-waiting/10 text-waiting" },
  uploaded: { label: "در فضای ابری", tone: "bg-success/10 text-success" },
  downloading: { label: "در حال دانلود", tone: "bg-waiting/10 text-waiting" },
  cached: { label: "روی دستگاه", tone: "bg-success/10 text-success" },
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
      <span className="opacity-75">·</span>
      <span className="opacity-90">{s.label}</span>
    </span>
  );
}
