"use client";

interface ProfileAvatarProps {
  name: string;
  avatarDataUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: boolean;
}

const SIZE_MAP: Record<NonNullable<ProfileAvatarProps["size"]>, string> = {
  xs: "h-8 w-8 text-[10px]",
  sm: "h-10 w-10 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-20 w-20 text-lg",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] || "") + (parts[1][0] || "");
}

export function ProfileAvatar({
  name,
  avatarDataUrl,
  size = "md",
  ring = false,
}: ProfileAvatarProps) {
  const sizeCls = SIZE_MAP[size];
  const ringCls = ring ? "ring-2 ring-white/60 ring-offset-2 ring-offset-transparent" : "";

  if (avatarDataUrl) {
    return (
      <div
        className={`relative ${sizeCls} rounded-full overflow-hidden brand-gradient ${ringCls} shrink-0`}
      >
        <img
          src={avatarDataUrl}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${sizeCls} rounded-full brand-gradient ${ringCls} flex items-center justify-center text-white font-bold shrink-0`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
