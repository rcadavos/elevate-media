"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DIRECTORY_ROLES,
  DIRECTORY_ROLE_LABELS,
} from "@/lib/constants/directory-roles";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarAccountMenu,
  SidebarBody,
  SidebarFooter,
  SidebarMenu,
  SidebarNav,
  SidebarSection,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type AdminSidebarProps = {
  email: string | null;
  fullName: string | null;
  avatarUrl?: string | null;
};

export function AdminSidebar({ email, fullName, avatarUrl }: AdminSidebarProps) {
  const pathname = usePathname();

  const dashboardActive =
    pathname === "/admin/dashboard" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin?");

  const auditLogsActive = pathname === "/admin/audit-logs";

  const displayName =
    fullName?.trim() || email?.trim() || "Account";

  return (
    <Sidebar className="h-full min-h-0">
      <SidebarBody>
        <SidebarNav aria-label="Admin">
          <Button
            render={<Link href="/admin/dashboard" />}
            nativeButton={false}
            variant={dashboardActive ? "default" : "ghost"}
            className={cn(
              "h-10 min-h-10 justify-start px-2.5 text-sm",
              !dashboardActive && "font-normal",
            )}
          >
            Dashboard
          </Button>
          <Button
            render={<Link href="/admin/audit-logs" />}
            nativeButton={false}
            variant={auditLogsActive ? "default" : "ghost"}
            className={cn(
              "h-10 min-h-10 justify-start px-2.5 text-sm",
              !auditLogsActive && "font-normal",
            )}
          >
            Audit logs
          </Button>
        </SidebarNav>

        <SidebarSection title="Directory">
          <SidebarMenu>
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
                      "h-10 min-h-10 w-full justify-start px-2.5 text-sm",
                      !active && "font-normal",
                    )}
                  >
                    {DIRECTORY_ROLE_LABELS[role]}
                  </Button>
                </li>
              );
            })}
          </SidebarMenu>
        </SidebarSection>
      </SidebarBody>

      <SidebarFooter>
        <SidebarAccountMenu
          email={email}
          displayName={displayName}
          avatarUrl={avatarUrl}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
