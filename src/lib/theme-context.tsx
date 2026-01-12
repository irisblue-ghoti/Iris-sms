"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (e?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // Load saved theme preference or detect system preference
    const saved = localStorage.getItem("theme") as Theme;
    if (saved && (saved === "light" || saved === "dark")) {
      setThemeState(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  }, []);

  const toggleTheme = useCallback((e?: React.MouseEvent) => {
    const newTheme = theme === "light" ? "dark" : "light";

    // Get click position for radial effect
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;

    // Create overlay element
    const overlay = document.createElement("div");
    overlay.className = `theme-transition-overlay ${newTheme === "dark" ? "to-dark" : "to-light"}`;
    overlay.style.setProperty("--x", `${x}px`);
    overlay.style.setProperty("--y", `${y}px`);
    document.body.appendChild(overlay);

    // Enable transitions on all elements
    document.documentElement.classList.add("theme-transition");

    // Trigger overlay animation
    requestAnimationFrame(() => {
      overlay.classList.add("active");
    });

    // Apply theme change after a short delay
    setTimeout(() => {
      setTheme(newTheme);
    }, 150);

    // Clean up
    setTimeout(() => {
      overlay.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        document.documentElement.classList.remove("theme-transition");
      }, 500);
    }, 400);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Theme toggle button component with animated icon
export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const context = useContext(ThemeContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={`relative flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${className}`}>
        <span className="w-5 h-5" />
      </button>
    );
  }

  const theme = context?.theme ?? "light";
  const toggleTheme = context?.toggleTheme;
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg
          className="w-5 h-5 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
