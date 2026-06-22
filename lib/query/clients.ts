import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import type { AgencyClient } from "@/lib/types/agency";

/** Fields an admin can edit on a client. */
export type ClientPatch = Partial<{
  name: string;
  status: string;
  service: AgencyClient["service"];
  contact: string;
  email: string;
  profitMargin: number;
  feeOnRevenue: number;
  feeOnProfit: number;
  billingDay: number;
  targetRevenue: number;
  targetRoas: number;
  profileNote: string;
  notes: string;
}>;

export async function fetchAdminClients(): Promise<AgencyClient[]> {
  const res = await fetch("/api/admin/clients", { credentials: "same-origin" });
  const data = (await res.json()) as { clients?: AgencyClient[]; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Could not load clients");
  }
  return data.clients ?? [];
}

export async function patchAdminClient(
  id: string,
  patch: ClientPatch,
): Promise<AgencyClient> {
  const res = await fetch(`/api/admin/clients/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as { client?: AgencyClient; error?: string };
  if (!res.ok || !data.client) {
    throw new Error(data.error ?? "Could not save changes");
  }
  return data.client;
}

/** Replace a single client in the cached admin clients list. */
export function mergeClientIntoCache(
  queryClient: QueryClient,
  updated: AgencyClient,
): void {
  queryClient.setQueryData<AgencyClient[]>(queryKeys.admin.clients(), (old) =>
    old ? old.map((c) => (c.id === updated.id ? updated : c)) : old,
  );
}
