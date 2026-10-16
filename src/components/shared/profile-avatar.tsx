"use client";

import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  name: string;
  initials?: string;
  avatarDataUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: boolean;
  className?: string;
}

const SIZES: Record<NonNullable<ProfileAvatarProps["size"]>, string> = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-[10px]",
  md: "w-10 h-10 text-xs",
  lg: "w-12 h-12 text-sm",
  xl: "w-16 h-16 text-base",
};

/**
 * ProfileAvatar — shows member's profile photo if available, otherwise
 * initials on a gradient background. Used everywhere a member is shown.
 */
export function ProfileAvatar({
  name,
  initials,
  avatarDataUrl,
  size = "md",
  ring = false,
  className,
}: ProfileAvatarProps) {
  const display = (initials || name.split(" ").map((s) => s[0]).join(" ")).slice(0, 3);
  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold shrink-0",
        SIZES[size],
        ring && "ring-2 ring-white dark:ring-slate-900 shadow-glow",
        className
      )}
    >
      {avatarDataUrl ? (
        <img
          src={avatarDataUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="leading-none">{display}</span>
      )}
    </div>
  );
}
