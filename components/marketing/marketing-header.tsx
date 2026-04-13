"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@base-ui/react/dialog";
import { LayoutDashboard, LogIn, Menu, PanelRight, UserPlus, X } from "lucide-react";
import { resolvePostSignInPath } from "@/lib/auth/post-sign-in-redirect";
import { fetchSessionSummaryIfAuthenticated } from "@/lib/query/session-summary";
import { queryKeys } from "@/lib/query/query-keys";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const sessionQuery = useQuery({
    queryKey: queryKeys.me.sessionSummary(),
    queryFn: fetchSessionSummaryIfAuthenticated,
    staleTime: 30_000,
    retry: false,
  });

  const isLoggedIn = Boolean(sessionQuery.data);
  const dashboardHref = isLoggedIn
    ? resolvePostSignInPath(sessionQuery.data?.role ?? null, null)
    : "/dashboard";

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
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 dark:bg-[#061a1c]/90 dark:supports-[backdrop-filter]:bg-[#061a1c]/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/landing" className="group flex min-w-0 items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight text-foreground transition group-hover:text-primary">
              elev8temedia
            </span>
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              E‑commerce growth
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1.5 md:flex md:gap-2"
            aria-label="Primary"
          >
            <ThemeToggle compact />
            {isLoggedIn ? (
              <Button
                render={<Link href={dashboardHref} />}
                nativeButton={false}
                variant="default"
                size="sm"
                className="sm:px-4"
              >
                Go to dashboard
              </Button>
            ) : (
              <>
                <Button
                  render={<Link href="/login" />}
                  nativeButton={false}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  Sign in
                </Button>
                <Button
                  render={<Link href="/signup" />}
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                  className="border-foreground/15 bg-transparent sm:px-4 dark:border-white/30 dark:text-white"
                >
                  Get started
                </Button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle compact />
            <Dialog.Trigger
              type="button"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-10 shrink-0 gap-1 px-3",
              )}
              aria-label="Open menu"
            >
              <PanelRight className="size-3.5 shrink-0 opacity-70" aria-hidden />
              <Menu className="size-3.5 shrink-0" aria-hidden />
            </Dialog.Trigger>
          </div>
        </div>
      </header>

      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-[min(20rem,100vw)] flex-col border-l border-border bg-background shadow-2xl outline-none",
            "transition-transform duration-200 ease-out",
            "data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
          )}
          initialFocus={true}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Dialog.Title className="text-sm font-semibold text-foreground">
              Menu
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
              )}
              aria-label="Close menu"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <nav
            className="flex flex-col gap-2 p-4"
            aria-label="Primary mobile"
          >
            {isLoggedIn ? (
              <Button
                render={
                  <Link href={dashboardHref} onClick={() => setOpen(false)} />
                }
                nativeButton={false}
                variant="default"
                className="h-10 w-full justify-center rounded-md"
              >
                <LayoutDashboard className="size-4 shrink-0" aria-hidden />
                Go to dashboard
              </Button>
            ) : (
              <>
                <Button
                  render={
                    <Link href="/login" onClick={() => setOpen(false)} />
                  }
                  nativeButton={false}
                  variant="outline"
                  className="h-10 w-full justify-center rounded-md"
                >
                  <LogIn className="size-4 shrink-0" aria-hidden />
                  Sign in
                </Button>
                <Button
                  render={
                    <Link href="/signup" onClick={() => setOpen(false)} />
                  }
                  nativeButton={false}
                  className="h-10 w-full justify-center rounded-md"
                >
                  <UserPlus className="size-4 shrink-0" aria-hidden />
                  Get started
                </Button>
              </>
            )}
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
