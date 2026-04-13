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

/** Same as {@link fetchSessionSummary} but returns `null` when there is no session (401). */
export async function fetchSessionSummaryIfAuthenticated(): Promise<SessionSummary | null> {
  const res = await fetch("/api/me/session-summary", {
    credentials: "same-origin",
  });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as SessionSummary;
}
