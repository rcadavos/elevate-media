"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const btn =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/90 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

const btnCompact =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-white/80 text-zinc-600 backdrop-blur-sm transition hover:bg-white hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 2.25 2.25 0 002.16-.198.75.75 0 01.981.98 10.5 10.5 0 01-9.193 9.192.75.75 0 01-.842-.28 7.5 7.5 0 009.8-9.8.75.75 0 01.28-.842z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type ThemeToggleProps = {
  /** Tighter styling for dense headers */
  compact?: boolean;
};

export function ThemeToggle({ compact }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div
        className={
          compact
            ? "h-9 w-9 shrink-0 rounded-lg border border-zinc-200/80 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/80"
            : "h-9 w-9 shrink-0 rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
        }
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={compact ? btnCompact : btn}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
