"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PanelLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResponsiveAppSidebarProps = {
  children: React.ReactNode;
};

export function ResponsiveAppSidebar({ children }: ResponsiveAppSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
        <Link
          href="/admin/dashboard"
          className="flex min-w-0 flex-col leading-tight"
        >
          <span className="text-xs font-semibold tracking-tight text-foreground">
            elev8temedia
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">
            Admin Portal
          </span>
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 shrink-0 gap-1 px-3"
          aria-expanded={open}
          aria-controls="app-sidebar"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="size-4 shrink-0" aria-hidden />
          ) : (
            <>
              <PanelLeft className="size-3.5 shrink-0 opacity-70" aria-hidden />
              <Menu className="size-3.5 shrink-0" aria-hidden />
            </>
          )}
        </Button>
      </header>

      <button
        type="button"
        aria-label="Close navigation menu"
        className={cn(
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity md:hidden",
          open
            ? "opacity-100"
            : "pointer-events-none opacity-0",
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
