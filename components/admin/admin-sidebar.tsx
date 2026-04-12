"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DIRECTORY_ROLES,
  DIRECTORY_ROLE_LABELS,
} from "@/lib/constants/directory-roles";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type AdminSidebarProps = {
  email: string | null;
  fullName: string | null;
};

export function AdminSidebar({ email, fullName }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);

  const dashboardActive =
    pathname === "/admin/dashboard" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin?");

  const displayName =
    fullName?.trim() || email?.trim() || "Account";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="min-h-0 flex-1 space-y-6">
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">
            elev8temedia
          </p>
          <p className="mt-1 text-base font-semibold text-foreground">Admin</p>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Admin">
          <Button
            render={<Link href="/admin/dashboard" />}
            nativeButton={false}
            variant={dashboardActive ? "default" : "ghost"}
            className={cn("justify-start", !dashboardActive && "font-normal")}
          >
            Dashboard
          </Button>
        </nav>

        <div>
          <p className="mb-2 px-1 text-[10px] font-semibold tracking-widest text-muted-foreground">
            Directory
          </p>
          <ul className="flex flex-col gap-0.5">
            {DIRECTORY_ROLES.map((role) => {
              const href = `/admin/directory/${role}`;
              const active = pathname === href;
              return (
                <li key={role}>
                  <Button
                    render={<Link href={href} />}
                    nativeButton={false}
                    variant={active ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      !active && "font-normal",
                    )}
                  >
                    {DIRECTORY_ROLE_LABELS[role]}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-auto shrink-0 space-y-3 border-t border-border pt-4">
        <div className="flex justify-start">
          <ThemeToggle />
        </div>

        <DropdownMenu open={accountOpen} onOpenChange={setAccountOpen}>
          <DropdownMenuTrigger
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-2.5 text-left text-sm font-medium shadow-sm outline-none transition-[color,box-shadow]",
              "hover:bg-accent/50",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            )}
          >
            <span className="min-w-0 flex-1 truncate text-foreground">
              {displayName}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                accountOpen && "-rotate-180",
              )}
              aria-hidden
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <span className="block truncate text-foreground">{displayName}</span>
              {email ? (
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {email}
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                router.push("/dashboard");
              }}
            >
              Team workspace
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                router.push("/signup");
              }}
            >
              Create account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-0 focus:bg-transparent">
              <form action="/auth/signout" method="post" className="w-full">
                <button
                  type="submit"
                  className="w-full rounded-md px-1.5 py-1 text-left text-sm text-destructive outline-none hover:bg-destructive/10 focus-visible:bg-destructive/10"
                >
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
