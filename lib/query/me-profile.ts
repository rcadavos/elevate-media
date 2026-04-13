import type { MeProfile } from "@/lib/types/me-profile";

export async function fetchMeProfile(): Promise<MeProfile> {
  const res = await fetch("/api/me/profile", { credentials: "same-origin" });
  const data = (await res.json()) as { error?: string; profile?: MeProfile };
  if (!res.ok) {
    throw new Error(data.error ?? "Could not load profile");
  }
  if (!data.profile) {
    throw new Error("Missing profile in response");
  }
  return data.profile;
}

export async function patchMeProfile(full_name: string): Promise<MeProfile> {
  const res = await fetch("/api/me/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ full_name }),
  });
  const data = (await res.json()) as { error?: string; profile?: MeProfile };
  if (!res.ok) {
    throw new Error(data.error ?? "Update failed");
  }
  if (!data.profile) {
    throw new Error("Missing profile in response");
  }
  return data.profile;
}

export async function uploadMyProfilePhoto(file: File): Promise<MeProfile> {
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch("/api/me/profile/photo", {
    method: "POST",
    body: fd,
    credentials: "same-origin",
  });
  const data = (await res.json()) as { error?: string; profile?: MeProfile };
  if (!res.ok) {
    throw new Error(data.error ?? "Upload failed");
  }
  if (!data.profile) {
    throw new Error("Missing profile in response");
  }
  return data.profile;
}

export async function postMePassword(password: string): Promise<void> {
  const res = await fetch("/api/me/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ password }),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Could not update password");
  }
}
