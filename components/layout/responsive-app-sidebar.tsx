"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Menu, Search, X } from "lucide-react";
import { AdminNavSearch } from "@/components/admin/admin-nav-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResponsiveAppSidebarProps = {
  children: React.ReactNode;
};

export function ResponsiveAppSidebar({ children }: ResponsiveAppSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [searchExpanded, setSearchExpanded] = React.useState(false);
  const [searchSession, setSearchSession] = React.useState(0);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    setSearchExpanded(false);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const openMobileSearch = () => {
    setSearchSession((n) => n + 1);
    setSearchExpanded(true);
  };

  const closeMobileSearch = () => {
    setSearchExpanded(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-[3.25rem] items-center gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:hidden">
        <Link
          href="/admin/dashboard"
          className={cn(
            "relative z-0 flex min-w-0 flex-1 flex-col leading-tight transition-opacity duration-200",
            searchExpanded && "pointer-events-none opacity-0",
          )}
        >
          <span className="block truncate text-xs font-semibold tracking-tight text-primary">
            elev8temedia
          </span>
          <span className="block truncate text-[10px] font-medium text-muted-foreground">
            Admin Portal
          </span>
        </Link>

        {!searchExpanded ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative z-30 h-10 w-10 shrink-0"
            aria-label="Open search"
            onClick={openMobileSearch}
          >
            <Search className="size-4 shrink-0" aria-hidden />
          </Button>
        ) : null}

        <div className="relative z-30 flex shrink-0 items-center gap-2">
          <ThemeToggle compact />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-expanded={open}
            aria-controls="app-sidebar"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="size-4 shrink-0" aria-hidden />
            ) : (
              <Menu className="size-4 shrink-0" aria-hidden />
            )}
          </Button>
        </div>

        {searchExpanded ? (
          <div
            className="absolute inset-y-0 left-0 right-28 z-20 flex items-center gap-1 border-b border-border bg-background/98 pr-1 pl-2 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-background/95"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0"
              aria-label="Close search"
              onClick={closeMobileSearch}
            >
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
            </Button>
            <div className="min-w-0 flex-1 py-1">
              <AdminNavSearch
                key={searchSession}
                autoFocus
                onDismissChrome={closeMobileSearch}
                className="min-w-0"
              />
            </div>
          </div>
        ) : null}
      </header>

      <button
        type="button"
        aria-label="Close navigation menu"
        className={cn(
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        id="app-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh max-h-dvh min-h-0 w-60 shrink-0 flex-col border-r border-border bg-card p-4 shadow-xl transition-transform duration-200 ease-out md:static md:h-full md:max-h-none md:self-stretch md:shadow-none",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="mb-3 flex items-center justify-between border-b border-border pb-3 md:hidden">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Menu
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </aside>
    </>
  );
}
