"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Sidebar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar"
      className={cn("flex min-h-0 flex-1 flex-col gap-6", className)}
      {...props}
    />
  );
}

export function SidebarBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-body"
      className={cn(
        "min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarBrand({
  productLabel = "elev8temedia",
  workspaceLabel,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  productLabel?: string;
  /** Role or workspace name; rendered as “{workspaceLabel} Portal”. */
  workspaceLabel: string;
}) {
  return (
    <div data-slot="sidebar-brand" className={className} {...props}>
      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">
        {productLabel}
      </p>
      <p className="mt-1 text-base font-semibold text-foreground">
        {workspaceLabel} Portal
      </p>
    </div>
  );
}

export function SidebarNav({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="sidebar-nav"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

export function SidebarSection({
  title,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  title?: string;
}) {
  return (
    <div data-slot="sidebar-section" className={className} {...props}>
      {title ? (
        <p className="mb-2 px-1 text-[10px] font-semibold tracking-widest text-muted-foreground">
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}

export function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "mt-auto shrink-0 space-y-3 border-t border-border pt-4",
        className,
      )}
      {...props}
    />
  );
}

export type SidebarAccountMenuProps = {
  email: string | null;
  displayName: string;
  /** Inserted after default workspace links, before the sign-out separator */
  menuBeforeSignOut?: React.ReactNode;
  /** Replace default “Team workspace” / “Create account” block */
  customWorkspaceItems?: React.ReactNode;
};

export function SidebarAccountMenu({
  email,
  displayName,
  menuBeforeSignOut,
  customWorkspaceItems,
}: SidebarAccountMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
            open && "-rotate-180",
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
        {customWorkspaceItems ?? (
          <>
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
          </>
        )}
        {menuBeforeSignOut}
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
  );
}
