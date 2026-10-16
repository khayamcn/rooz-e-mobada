"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";

/**
 * ThemeBootstrap — applies the `dark` class to <html> BEFORE first paint
 * to prevent theme flash. Runs as a client-only effect.
 */
export function ThemeBootstrap() {
  const theme = useApp((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return null;
}
