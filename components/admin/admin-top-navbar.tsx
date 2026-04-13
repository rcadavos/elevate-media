"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { AdminNavSearch } from "@/components/admin/admin-nav-search";

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
      <AdminNavSearch className="relative mx-auto w-full min-w-0 max-w-md shrink-0" />
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
