"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";

export function ThemeBootstrap() {
  const theme = useApp((s) => s.theme);
  const colorTheme = useApp((s) => s.colorTheme);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
    html.setAttribute("data-theme", colorTheme);
  }, [theme, colorTheme]);

  return null;
}
