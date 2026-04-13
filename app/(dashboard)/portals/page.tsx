import Link from "next/link";
import { redirect } from "next/navigation";
import {
  DIRECTORY_ROLE_LABELS,
  type DirectoryRole,
} from "@/lib/constants/directory-roles";
import {
  getPortalPathForRole,
  parseProfileRoles,
} from "@/lib/auth/post-sign-in-redirect";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const roleDescriptions: Record<DirectoryRole, string> = {
  admin: "Manage users, audit logs, and admin operations.",
  client: "Open the client workspace to track delivery and updates.",
  sales: "Jump into pipeline activity and outreach tracking.",
  finance: "Review payments, projections, and finance operations.",
  operations: "Access standups, tasks, and weekly operational flow.",
};

export default async function PortalsPage() {
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

  const roles = parseProfileRoles(profile?.role ?? null);
  if (roles.length === 0) {
    redirect("/dashboard");
  }
  if (roles.length === 1) {
    redirect(getPortalPathForRole(roles[0]));
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Choose your portal
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Your account has access to multiple workspaces. Pick the portal you
          want to enter right now.
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <Card key={role} className="rounded-xl">
            <CardHeader>
              <CardTitle>{DIRECTORY_ROLE_LABELS[role]} Portal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {roleDescriptions[role]}
              </p>
              <Button
                render={<Link href={getPortalPathForRole(role)} />}
                nativeButton={false}
                className="w-full rounded-md"
              >
                Enter {DIRECTORY_ROLE_LABELS[role]} portal
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
