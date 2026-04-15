import type { LoginHistoryRow } from "@/lib/types/login-history";

export type UserLastLoginPage = {
  entries: LoginHistoryRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function fetchAdminUserLastLogin(params: {
  page?: number;
  pageSize?: number;
}): Promise<UserLastLoginPage> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`/api/admin/user-last-login?${qs.toString()}`, {
    credentials: "same-origin",
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("Forbidden");
  }
  if (!res.ok) {
    throw new Error("Could not load sign-in history");
  }
  return (await res.json()) as UserLastLoginPage;
}
