"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
  /** True while a page header renders its own theme switch. */
  headerToggle: boolean;
  setHeaderToggle: (present: boolean) => void;
}>({ theme: "light", toggle: () => {}, headerToggle: false, setHeaderToggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

const CHANGE_EVENT = "swcl:theme-change";

/** The saved choice, or the system preference when nothing is saved. */
function readTheme(): Theme {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // Storage can be blocked; fall back to the system preference.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange); // another tab switched theme
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    media.removeEventListener("change", onChange);
  };
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // "light" while rendering on the server, then the visitor's theme once in the browser.
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);
  const [headerToggle, setHeaderToggle] = useState(false);

  // Apply / remove .dark class on <html> whenever theme changes, and remember it.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Storage can be blocked; the theme still applies for this visit.
    }
  }, [theme]);

  const toggle = () => {
    try {
      localStorage.setItem("theme", theme === "dark" ? "light" : "dark");
    } catch {
      // Without storage the switch cannot persist; nothing else to do.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle, headerToggle, setHeaderToggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
