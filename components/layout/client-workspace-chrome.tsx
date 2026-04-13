"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Building2, House, LayoutDashboard, LogOut, Menu, PanelLeft, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navClass = "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
const navClassActive = "text-sm font-semibold text-foreground";

export function ClientWorkspaceChrome() {
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

  const hubActive = pathname === "/client/hub" || pathname.startsWith("/client/hub/");
  const dashActive = pathname === "/client/dashboard";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            href="/client/hub"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            elev8temedia
          </Link>

          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Client portal"
          >
            <Link
              href="/client/hub"
              className={cn(navClass, hubActive && navClassActive)}
            >
              Client Hub
            </Link>
            <Link
              href="/client/dashboard"
              className={cn(navClass, dashActive && navClassActive)}
            >
              Overview
            </Link>
            <Link href="/" className={navClass}>
              Marketing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <form action="/auth/signout" method="post" className="hidden md:block">
              <Button type="submit" variant="outline" size="sm" className="h-9 gap-1.5">
                <LogOut className="size-3.5 shrink-0 opacity-70" aria-hidden />
                Sign out
              </Button>
            </form>
            <Dialog.Trigger
              type="button"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-10 shrink-0 gap-1 px-3 md:hidden",
              )}
              aria-label="Open client portal menu"
            >
              <PanelLeft className="size-3.5 shrink-0 opacity-70" aria-hidden />
              <Menu className="size-3.5 shrink-0" aria-hidden />
            </Dialog.Trigger>
          </div>
        </div>
      </header>

      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[min(20rem,100vw)] flex-col border-r border-border bg-background shadow-2xl outline-none md:hidden",
            "transition-transform duration-200 ease-out",
            "data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
          )}
          initialFocus={true}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Dialog.Title className="text-sm font-semibold text-foreground">
              Client portal
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
              aria-label="Close menu"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>
          <nav
            className="flex flex-col gap-2 p-4"
            aria-label="Client portal mobile"
          >
            <Button
              render={
                <Link href="/client/hub" onClick={() => setOpen(false)} />
              }
              nativeButton={false}
              variant="outline"
              className="h-10 w-full justify-start rounded-md"
            >
              <Building2 className="size-4 shrink-0" aria-hidden />
              Client Hub
            </Button>
            <Button
              render={
                <Link href="/client/dashboard" onClick={() => setOpen(false)} />
              }
              nativeButton={false}
              variant="outline"
              className="h-10 w-full justify-start rounded-md"
            >
              <LayoutDashboard className="size-4 shrink-0" aria-hidden />
              Overview
            </Button>
            <Button
              render={<Link href="/" onClick={() => setOpen(false)} />}
              nativeButton={false}
              variant="ghost"
              className="h-10 w-full justify-start rounded-md"
            >
              <House className="size-4 shrink-0" aria-hidden />
              Marketing home
            </Button>
            <div className="border-t border-border pt-3">
              <form
                action="/auth/signout"
                method="post"
                className="w-full"
                onSubmit={() => setOpen(false)}
              >
                <Button type="submit" variant="secondary" className="h-10 w-full rounded-md">
                  <LogOut className="size-4 shrink-0" aria-hidden />
                  Sign out
                </Button>
              </form>
            </div>
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
