"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asDiv?: boolean;
  children: ReactNode;
}

/**
 * AppCard: a soft white surface-card. Use asDiv=true when the card itself
 * contains nested buttons (avoids invalid <button> inside <button>).
 */
export function AppCard({
  asDiv = false,
  className,
  children,
  ...rest
}: AppCardProps) {
  const baseClass = cn(
    "surface-card rounded-card p-4 text-right transition-colors",
    className,
  );
  if (asDiv) {
    return <div className={baseClass}>{children}</div>;
  }
  return (
    <button type="button" className={cn(baseClass, "pressable text-right w-full")} {...rest}>
      {children}
    </button>
  );
}

interface SectionTitleProps {
  icon?: ReactNode;
  label: string;
  action?: ReactNode;
}

export function SectionTitle({ icon, label, action }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3 mt-1">
      <div className="flex items-center gap-2 min-w-0">
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg brand-bg-soft text-brand-text">
            {icon}
          </span>
        )}
        <h2 className="text-sm font-bold text-strong truncate">{label}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
