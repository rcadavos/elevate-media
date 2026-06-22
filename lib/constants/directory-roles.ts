export const DIRECTORY_ROLES = [
  "admin",
  "sales",
  "finance",
  "operations",
] as const;

export type DirectoryRole = (typeof DIRECTORY_ROLES)[number];

export function isDirectoryRole(value: string): value is DirectoryRole {
  return (DIRECTORY_ROLES as readonly string[]).includes(value);
}

export const DIRECTORY_ROLE_LABELS: Record<DirectoryRole, string> = {
  admin: "Admin",
  sales: "Sales",
  finance: "Finance",
  operations: "Operations",
};
