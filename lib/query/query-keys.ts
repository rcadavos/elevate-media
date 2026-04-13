import type { DirectoryRole } from "@/lib/constants/directory-roles";

/** Central TanStack Query keys — import from `@/lib/query/query-keys`. */
export const queryKeys = {
  me: {
    all: ["me"] as const,
    sessionSummary: () => ["me", "session-summary"] as const,
  },
  admin: {
    all: ["admin"] as const,
    profiles: (role: DirectoryRole) => ["admin", "profiles", role] as const,
    auditLogs: (page: number, pageSize: number) =>
      ["admin", "audit-logs", page, pageSize] as const,
  },
} as const;
