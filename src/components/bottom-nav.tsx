"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, FileText, Phone, Users, RefreshCw, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScreenId = "home" | "documents" | "contacts" | "family" | "sync";

interface RadialNavProps {
  active: ScreenId;
  onChange: (id: ScreenId) => void;
  pendingCount?: number;
  conflictCount?: number;
  onFabClick?: () => void;
}

const ITEMS: { id: ScreenId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "خانه", icon: Home },
  { id: "documents", label: "مدارک", icon: FileText },
  { id: "contacts", label: "تماس‌ها", icon: Phone },
  { id: "family", label: "خانواده", icon: Users },
  { id: "sync", label: "همگام", icon: RefreshCw },
];

/**
 * RadialNav — semicircle bottom navigation with rotating animation.
 *
 * Layout:
 *  - A semicircle "dish" attached to the bottom of the screen (convex side up).
 *  - 5 menu items arranged along the upper arc.
 *  - A central FAB button at the bottom of the dish.
 *  - Selecting an item rotates the entire arc so that the selected icon
 *    moves to the top center "active" position.
 *
 * Implementation notes:
 *  - The arc items are positioned by transforming them by angle from -90° (left)
 *    to +90° (right) across 180°.
 *  - The active offset is added to bring the active item to center.
 *  - All transforms use CSS transitions via framer-motion.
 */
export function RadialNav({
  active,
  onChange,
  pendingCount = 0,
  conflictCount = 0,
  onFabClick,
}: RadialNavProps) {
  const [fabOpen, setFabOpen] = useState(false);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Find index of active item
  const activeIndex = ITEMS.findIndex((i) => i.id === active);

  // The arc spans 180°. With 5 items, each item is offset by 180°/(n-1) = 45°.
  // Item at index 0 is at the far left (-90°), index 4 is at far right (+90°).
  // To bring active item to top center (angle = -90° relative to bottom),
  // we rotate the whole arc by `-activeAngle + (-90°)`, i.e. shift the dish.
  const ARC_SPAN = 180; // degrees
  const step = ARC_SPAN / (ITEMS.length - 1); // 45°

  useEffect(() => {
    // Smooth scroll active item into view (just in case).
    const el = itemRefs.current[active];
    if (el) {
      el.focus({ preventScroll: true });
    }
  }, [active]);

  return (
    <div className="relative pointer-events-none">
      {/* FAB Quick Actions (when opened) */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setFabOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 100 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="absolute bottom-36 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { label: "افزودن مدرک", icon: FileText, color: "from-violet-500 to-purple-600" },
                { label: "افزودن تماس", icon: Phone, color: "from-emerald-500 to-teal-600" },
                { label: "افزودن عضو", icon: Users, color: "from-pink-500 to-rose-600" },
                { label: "همگام‌سازی", icon: RefreshCw, color: "from-blue-500 to-cyan-600" },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    type="button"
                    initial={{ scale: 0, y: 40 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: 40 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 22 }}
                    onClick={() => {
                      setFabOpen(false);
                      onFabClick?.();
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-2xl border border-violet-500/20"
                  >
                    <span
                      className={cn(
                        "w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white",
                        action.color
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The radial dish — semicircle */}
      <div
        className="surface-nav pointer-events-auto relative"
        style={{
          height: "120px",
          borderTopLeftRadius: "9999px",
          borderTopRightRadius: "9999px",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.18), 0 -1px 0 var(--nav-border) inset",
        }}
      >
        {/* Arc container — items positioned along a semicircle */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: "12px",
            width: "240px",
            height: "120px",
          }}
        >
          {/* Rotating arc — when activeIndex changes, the whole arc spins to bring the item to top */}
          <motion.div
            className="relative w-full h-full"
            animate={{ rotate: `-${activeIndex * step}deg` }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{ transformOrigin: "50% 100%" }}
          >
            {ITEMS.map((item, i) => {
              const Icon = item.icon;
              // angle measured from straight up (0 = top), positive to the left
              const angle = -90 + i * step; // -90, -45, 0, 45, 90
              const isActive = item.id === active;
              const badge =
                item.id === "sync"
                  ? conflictCount + pendingCount > 0
                    ? conflictCount + pendingCount
                    : 0
                  : 0;

              // Position along arc: convert angle to (x, y) where y is up from center
              // Arc radius (px) — items sit on a circle of radius 96 centered at the bottom middle
              const radius = 96;
              const rad = (angle * Math.PI) / 180;
              // x increases to the right; in RTL we want item 0 (home) on the right.
              // For RTL visual consistency, mirror x.
              const x = -Math.sin(rad) * radius; // mirror for RTL
              const y = -Math.cos(rad) * radius;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  ref={(el) => { itemRefs.current[item.id] = el; }}
                  onClick={() => onChange(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  // Counter-rotate each item so icons stay upright while arc spins
                  animate={{ rotate: `${activeIndex * step}deg` }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "0",
                    transform: `translate(-50%, 0) translate(${x}px, ${y}px)`,
                    transformOrigin: "center center",
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-full transition-all duration-300",
                    isActive
                      ? "w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-glow scale-110 z-20"
                      : "w-11 h-11 bg-white/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-violet-500/15 z-10 backdrop-blur"
                  )}
                >
                  <Icon
                    className={isActive ? "w-6 h-6" : "w-5 h-5"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <span className="text-[9px] font-bold leading-none mt-0.5">
                      {item.label}
                    </span>
                  )}
                  {badge > 0 && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center fa-num ring-2 ring-white dark:ring-slate-900">
                      {badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        {/* Center FAB — opens quick actions */}
        <button
          type="button"
          onClick={() => setFabOpen((v) => !v)}
          aria-label={fabOpen ? "بستن منوی سریع" : "باز کردن منوی سریع"}
          className="absolute left-1/2 -translate-x-1/2 -top-7 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 text-white shadow-glow flex items-center justify-center active:scale-90 transition-transform z-30 ring-4 ring-white dark:ring-slate-900"
        >
          <motion.div
            animate={{ rotate: fabOpen ? 135 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            {fabOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </motion.div>
        </button>

        {/* Active label hint above the dish */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-[10px] font-medium text-violet-600 dark:text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full">
            {ITEMS[activeIndex].label}
          </span>
        </div>
      </div>
    </div>
  );
}
