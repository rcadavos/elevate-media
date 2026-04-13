/** Home URL after leaving account settings, based on directory role. */
export function accountWorkspaceHomeHref(role: string | null | undefined): string {
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}
