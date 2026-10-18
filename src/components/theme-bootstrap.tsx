"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";

/**
 * ThemeBootstrap — applies the `dark` class and `data-theme` attribute
 * to <html> BEFORE first paint to prevent theme flash.
 */
export function ThemeBootstrap() {
  const theme = useApp((s) => s.theme);
  const colorTheme = useApp((s) => s.colorTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.setAttribute("data-theme", colorTheme);
  }, [theme, colorTheme]);

  return null;
}
