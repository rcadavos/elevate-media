"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import {
  BookOpen,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Extra path prefix that should also mark this item active. */
  match?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users, match: "/clients" },
  { href: "/sops", label: "Playbooks", icon: BookOpen, match: "/sops" },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (pathname === item.href) return true;
  if (item.match && pathname.startsWith(`${item.match}/`)) return true;
  return false;
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Agency OS modules">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;
        return (
          <Button
            key={item.href}
            render={<Link href={item.href} onClick={onNavigate} />}
            nativeButton={false}
            variant={active ? "default" : "ghost"}
            aria-current={active ? "page" : undefined}
            className={cn(
              "h-10 min-h-10 w-full justify-start gap-2.5 px-2.5 text-sm",
              !active && "font-normal",
            )}
          >
            <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <BrandLogo size={36} />
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          elev8temedia
        </span>
        <span className="text-base font-semibold tracking-tight text-foreground">
          Agency OS
        </span>
      </span>
    </Link>
  );
}

function FooterActions({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-2">
      <Button
        render={<Link href="/" onClick={onNavigate} />}
        nativeButton={false}
        variant="ghost"
        className="h-9 w-full justify-start gap-2 px-2.5 text-sm font-normal text-muted-foreground"
      >
        <House className="size-4 shrink-0" aria-hidden />
        Marketing home
      </Button>
      <form
        action="/auth/signout"
        method="post"
        className="w-full"
        onSubmit={onNavigate}
      >
        <Button
          type="submit"
          variant="outline"
          className="h-9 w-full justify-start gap-2 px-2.5 text-sm"
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          Sign out
        </Button>
      </form>
    </div>
  );
}

export function AgencyOsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="flex min-h-dvh flex-col bg-muted/15 md:h-dvh md:flex-row md:overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
          <div className="border-b border-border pb-4">
            <Brand />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto py-4">
            <NavLinks pathname={pathname} />
          </div>
          <div className="shrink-0 border-t border-border pt-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ThemeToggle compact />
            </div>
            <FooterActions />
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:hidden">
          <Brand />
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Dialog.Trigger
              type="button"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "h-10 w-10 shrink-0",
              )}
              aria-label="Open navigation menu"
            >
              <Menu className="size-4 shrink-0" aria-hidden />
            </Dialog.Trigger>
          </div>
        </header>

        {/* Content */}
        <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden bg-background md:overflow-y-auto">
          <div className="mx-auto flex w-full min-h-0 min-w-0 max-w-6xl flex-1 flex-col px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[min(20rem,100vw)] flex-col border-r border-border bg-card shadow-2xl outline-none md:hidden",
            "transition-transform duration-200 ease-out",
            "data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
          )}
          initialFocus={true}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Dialog.Title className="sr-only">Agency OS navigation</Dialog.Title>
            <Brand />
            <Dialog.Close
              type="button"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
              aria-label="Close menu"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
          <div className="shrink-0 border-t border-border p-4">
            <FooterActions onNavigate={() => setOpen(false)} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
