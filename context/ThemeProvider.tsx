"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";
export type FontSize = "small" | "medium" | "large";

interface SettingsContextType {
  theme: Theme;
  fontSize: FontSize;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  themes: Theme[];
}

const initialSettings: SettingsContextType = {
  theme: "system",
  fontSize: "medium",
  setTheme: () => null,
  setFontSize: () => null,
  themes: ["dark", "light", "system"],
};

const SettingsContext = createContext<SettingsContextType>(initialSettings);

export function useSettings() {
  return useContext(SettingsContext);
}

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [theme, setTheme] = useState<Theme>("system");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [mounted, setMounted] = useState(false);
  const themes: Theme[] = ["dark", "light", "system"];

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as Theme;
    const storedFontSize = localStorage.getItem("fontSize") as FontSize;

    if (storedTheme) {
      setTheme(storedTheme);
    }

    if (storedFontSize) {
      setFontSize(storedFontSize);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("theme", theme);
    localStorage.setItem("fontSize", fontSize);

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    root.classList.remove("text-sm", "text-base", "text-lg");
    switch (fontSize) {
      case "small":
        root.classList.add("text-sm");
        break;
      case "medium":
        root.classList.add("text-base");
        break;
      case "large":
        root.classList.add("text-lg");
        break;
    }
  }, [theme, fontSize, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <SettingsContext.Provider
      value={{ theme, fontSize, setTheme, setFontSize, themes }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
