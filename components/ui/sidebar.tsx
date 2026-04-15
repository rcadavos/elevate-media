"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Shield, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
        "min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]",
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
      <p className="text-[10px] font-semibold tracking-widest text-primary">
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

function accountMenuInitials(displayName: string, email: string | null): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.charAt(0) ?? "";
    const b = parts[parts.length - 1]?.charAt(0) ?? "";
    return (a + b).toUpperCase() || "?";
  }
  if (parts.length === 1) {
    const w = parts[0] ?? "";
    if (w.length >= 2) return w.slice(0, 2).toUpperCase();
    if (w.length === 1) return w.toUpperCase();
  }
  const fromEmail = email?.trim().charAt(0);
  return (fromEmail || "?").toUpperCase();
}

type SidebarAccountAvatarProps = {
  avatarUrl?: string | null;
  displayName: string;
  email: string | null;
  /** Frame size; keep in sync with trigger height for alignment */
  size?: "sm" | "md";
};

function SidebarAccountAvatar({
  avatarUrl,
  displayName,
  email,
  size = "sm",
}: SidebarAccountAvatarProps) {
  const frame =
    size === "md" ? "size-10 text-xs" : ("size-8 text-[10px]" as const);
  const url = typeof avatarUrl === "string" && avatarUrl.trim() ? avatarUrl.trim() : null;
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote Supabase public URL
      <img
        src={url}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", frame)}
      />
    );
  }
  const initials = accountMenuInitials(displayName, email);
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground",
        frame,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export type SidebarAccountMenuProps = {
  email: string | null;
  displayName: string;
  /** Public avatar URL from `profiles.avatar_url` when set */
  avatarUrl?: string | null;
  /** Inserted after Profile / Security (or `customWorkspaceItems`), before the sign-out separator */
  menuBeforeSignOut?: React.ReactNode;
  /** Replace default Profile / Security links */
  customWorkspaceItems?: React.ReactNode;
};

export function SidebarAccountMenu({
  email,
  displayName,
  avatarUrl,
  menuBeforeSignOut,
  customWorkspaceItems,
}: SidebarAccountMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-2.5 text-left text-sm font-medium shadow-sm outline-none transition-[color,box-shadow]",
          "hover:bg-accent/50",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          <SidebarAccountAvatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            email={email}
            size="sm"
          />
          <span className="min-w-0 flex-1 truncate leading-tight text-foreground">
            {displayName}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "-rotate-180",
          )}
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-64"
        side="top"
        align="start"
        sideOffset={6}
        collisionPadding={8}
        collisionAvoidance={{ side: "none" }}
        renderGuards={false}
      >
        <div className="flex items-center gap-2.5 px-2 py-2.5">
          <SidebarAccountAvatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            email={email}
            size="md"
          />
          <div className="min-w-0 flex-1 py-0.5">
            <p className="truncate text-sm font-medium leading-tight text-foreground">
              {displayName}
            </p>
            {email ? (
              <p className="mt-1 truncate text-xs leading-tight text-muted-foreground">
                {email}
              </p>
            ) : null}
          </div>
        </div>
        <DropdownMenuSeparator />
        {customWorkspaceItems ?? (
          <>
            <DropdownMenuItem
              onClick={() => {
                router.push("/account/profile");
              }}
            >
              <User aria-hidden />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                router.push("/account/security");
              }}
            >
              <Shield aria-hidden />
              Security
            </DropdownMenuItem>
          </>
        )}
        {menuBeforeSignOut}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="p-0 focus:bg-transparent">
          <form action="/auth/signout" method="post" className="w-full">
            <button
              type="submit"
              className="flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm leading-snug text-destructive outline-none hover:bg-destructive/10 focus-visible:bg-destructive/10"
            >
              <LogOut aria-hidden />
              Logout
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
