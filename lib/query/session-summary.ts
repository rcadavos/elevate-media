export type SessionSummary = {
  email: string | null;
  role: string | null;
  profileError: boolean;
  noProfile: boolean;
};

type FetchSessionSummaryOptions = {
  onUnauthorized?: () => void;
};

export async function fetchSessionSummary(
  options?: FetchSessionSummaryOptions,
): Promise<SessionSummary> {
  const res = await fetch("/api/me/session-summary", {
    credentials: "same-origin",
  });
  if (res.status === 401) {
    options?.onUnauthorized?.();
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error("Could not load session");
  }
  return (await res.json()) as SessionSummary;
}
