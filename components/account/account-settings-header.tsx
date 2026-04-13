"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export type AccountSettingsHeaderProps = {
  homeHref: string;
  homeLabel: string;
};

export function AccountSettingsHeader({ homeHref, homeLabel }: AccountSettingsHeaderProps) {
  return (
    <header className="border-b border-border bg-card/40 px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <Button
          render={<Link href={homeHref} />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="min-w-0 shrink px-0 text-muted-foreground"
        >
          <span className="truncate">← {homeLabel}</span>
        </Button>
        <ThemeToggle compact />
      </div>
    </header>
  );
}
