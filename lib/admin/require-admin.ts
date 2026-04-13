import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
};

export async function requireAdmin(): Promise<AdminSession> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login?error=missing_config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name, email, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    redirect("/dashboard?error=profiles_unavailable");
  }

  if (!profile) {
    redirect("/dashboard?error=no_profile");
  }

  const workspaceRole = profile.role?.trim().toLowerCase() ?? "";
  if (workspaceRole !== "admin") {
    redirect("/dashboard?notice=admin_only");
  }

  return {
    userId: user.id,
    email: profile.email ?? user.email ?? null,
    fullName: profile.full_name,
    avatarUrl:
      typeof profile.avatar_url === "string" && profile.avatar_url.trim()
        ? profile.avatar_url.trim()
        : null,
  };
}
