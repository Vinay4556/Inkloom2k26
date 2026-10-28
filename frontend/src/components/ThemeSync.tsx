"use client";

import { useEffect } from "react";
import { applyPreference, readPreference, THEME_EVENT } from "@/lib/theme";

/** Keeps data-theme in sync when the OS theme changes (System mode) or another tab changes the preference. */
export function ThemeSync() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyPreference(readPreference());
    mq.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    window.addEventListener(THEME_EVENT, sync);
    sync();
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener(THEME_EVENT, sync);
    };
  }, []);
  return null;
}
