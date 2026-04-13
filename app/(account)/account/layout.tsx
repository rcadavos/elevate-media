import { redirect } from "next/navigation";
import { AccountSettingsHeader } from "@/components/account/account-settings-header";
import { accountWorkspaceHomeHref } from "@/lib/auth/account-workspace";
import { createClient } from "@/lib/supabase/server";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const homeHref = accountWorkspaceHomeHref(profile?.role);
  const homeLabel = profile?.role === "admin" ? "Back to admin" : "Back to workspace";

  return (
    <div className="min-h-dvh bg-background">
      <AccountSettingsHeader homeHref={homeHref} homeLabel={homeLabel} />
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">{children}</div>
    </div>
  );
}
