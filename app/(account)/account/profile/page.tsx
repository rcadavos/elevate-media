import { redirect } from "next/navigation";
import { AccountProfileClient } from "@/components/account/account-profile-client";
import { createClient } from "@/lib/supabase/server";
import type { MeProfile } from "@/lib/types/me-profile";

export default async function AccountProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: row, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,avatar_url,role,created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !row) {
    redirect("/login");
  }

  return <AccountProfileClient initialProfile={row as MeProfile} />;
}
