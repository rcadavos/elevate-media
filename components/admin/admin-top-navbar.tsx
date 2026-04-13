"use client";

import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AdminTopNavbarProps = {
  className?: string;
  /** When false, no bottom border (parent row supplies one border with the brand column). */
  showBottomBorder?: boolean;
};

export function AdminTopNavbar({
  className,
  showBottomBorder = true,
}: AdminTopNavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex min-h-[3.25rem] shrink-0 items-center gap-3 bg-background/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80",
        showBottomBorder && "border-b border-border",
        className,
      )}
    >
      <div className="min-w-0 flex-1" aria-hidden />
      <div className="relative mx-auto w-full min-w-0 max-w-md shrink-0">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          name="q"
          placeholder="Search clients, directory, pages…"
          className="w-full pl-10"
          aria-label="Search workspace"
          autoComplete="off"
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
