"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeCtxType {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  mounted: boolean;
}

const ThemeCtx = createContext<ThemeCtxType>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
  mounted: false,
});

function applyToDOM(t: Theme) {
  document.documentElement.classList.toggle("dark", t === "dark");
  localStorage.setItem("theme", t);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme) || "dark";
    setThemeState(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
    setMounted(true);
  }, []);

  // Toggle between light and dark — saves to localStorage
  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    applyToDOM(next);
  };

  // Set a specific theme — used by portfolio page to apply owner's default
  // Does NOT save to localStorage so it doesn't override visitor's preference
  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    // Intentionally NOT saving to localStorage here
  };

  return (
    <ThemeCtx.Provider value={{ theme, toggle, setTheme, mounted }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
