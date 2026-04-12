import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 px-4 py-10 dark:bg-zinc-950 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to home
          </Link>
          <ThemeToggle />
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              elev8temedia
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
