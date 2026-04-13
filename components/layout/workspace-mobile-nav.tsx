"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { House, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WorkspaceMobileNav() {
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
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:hidden">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          elev8temedia
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <Dialog.Trigger
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-10 w-10 shrink-0",
            )}
            aria-label="Open workspace menu"
          >
            <Menu className="size-4 shrink-0" aria-hidden />
          </Dialog.Trigger>
        </div>
      </div>

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
              Workspace
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
            aria-label="Workspace mobile"
          >
            <Button
              render={
                <Link href="/dashboard" onClick={() => setOpen(false)} />
              }
              nativeButton={false}
              variant="outline"
              className="h-10 w-full justify-start rounded-md"
            >
              <LayoutDashboard className="size-4 shrink-0" aria-hidden />
              Workspace home
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
