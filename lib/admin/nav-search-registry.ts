export type AdminNavSearchItem = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  /** Extra strings matched besides title, subtitle, and href */
  keywords: string[];
};

/**
 * Destinations surfaced from the admin workspace search field (demo / static).
 * Extend when new admin or linked modules ship.
 */
export const ADMIN_NAV_SEARCH_ITEMS: AdminNavSearchItem[] = [
  {
    id: "admin-dashboard",
    title: "Admin dashboard",
    subtitle: "Agency overview and KPIs",
    href: "/admin/dashboard",
    keywords: ["stats", "home", "overview", "alerts"],
  },
  {
    id: "directory-root",
    title: "Directory",
    subtitle: "Browse users by role",
    href: "/admin/directory",
    keywords: ["users", "team", "staff", "people"],
  },
  {
    id: "directory-client",
    title: "Directory — Clients",
    subtitle: "Client accounts",
    href: "/admin/directory/client",
    keywords: ["client", "accounts", "brands"],
  },
  {
    id: "directory-sales",
    title: "Directory — Sales",
    subtitle: "Sales team",
    href: "/admin/directory/sales",
    keywords: ["sales", "reps", "pipeline"],
  },
  {
    id: "directory-finance",
    title: "Directory — Finance",
    subtitle: "Finance team",
    href: "/admin/directory/finance",
    keywords: ["finance", "billing", "payments"],
  },
  {
    id: "directory-operations",
    title: "Directory — Operations",
    subtitle: "Operations team",
    href: "/admin/directory/operations",
    keywords: ["operations", "ops", "delivery"],
  },
  {
    id: "directory-admin",
    title: "Directory — Admins",
    subtitle: "Administrator accounts",
    href: "/admin/directory/admin",
    keywords: ["admin", "superuser"],
  },
  {
    id: "audit-logs",
    title: "Audit logs",
    subtitle: "Admin activity history",
    href: "/admin/audit-logs",
    keywords: ["audit", "logs", "history", "compliance"],
  },
  {
    id: "workspace-dashboard",
    title: "Workspace home",
    subtitle: "Signed-in workspace",
    href: "/dashboard",
    keywords: ["workspace", "session", "dashboard"],
  },
  {
    id: "account-profile",
    title: "My profile",
    subtitle: "Photo and display name",
    href: "/account/profile",
    keywords: ["account", "avatar", "name", "settings", "me"],
  },
  {
    id: "account-security",
    title: "Account security",
    subtitle: "Change password",
    href: "/account/security",
    keywords: ["password", "credentials", "login", "auth"],
  },
  {
    id: "portals",
    title: "Portals",
    subtitle: "Switch role workspace",
    href: "/portals",
    keywords: ["portal", "roles", "switch"],
  },
  {
    id: "sales-module",
    title: "Sales",
    subtitle: "Sales module",
    href: "/sales",
    keywords: ["leads", "pipeline", "outreach"],
  },
  {
    id: "finance-module",
    title: "Finance",
    subtitle: "Finance module",
    href: "/finance",
    keywords: ["revenue", "expenses", "projections"],
  },
  {
    id: "operations-module",
    title: "Operations",
    subtitle: "Operations module",
    href: "/operations",
    keywords: ["standup", "tasks", "reports"],
  },
];

function haystackForItem(item: AdminNavSearchItem): string {
  return [item.title, item.subtitle ?? "", item.href, ...item.keywords]
    .join(" ")
    .toLowerCase();
}

/** Every whitespace-separated token must appear somewhere in the item text. */
export function filterAdminNavSearchItems(
  query: string,
  items: AdminNavSearchItem[] = ADMIN_NAV_SEARCH_ITEMS,
  limit = 12,
): AdminNavSearchItem[] {
  const tokens = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) {
    return [];
  }
  const hay = items.map((item) => ({ item, hay: haystackForItem(item) }));
  const matched = hay
    .filter(({ hay }) => tokens.every((t) => hay.includes(t)))
    .map(({ item }) => item);
  return matched.slice(0, limit);
}
