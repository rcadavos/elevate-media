"use client";

import { useEffect, useState } from "react";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import { OnboardingInviteForm } from "@/components/onboarding/onboarding-invite-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type OnboardingRoleClientProps = {
  role: DirectoryRole;
  inviteToken: string | null;
};

export function OnboardingRoleClient({
  role,
  inviteToken,
}: OnboardingRoleClientProps) {
  const label = DIRECTORY_ROLE_LABELS[role];

  if (!inviteToken) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-foreground">
          {label} onboarding
        </h1>
        <p className="text-sm text-muted-foreground">
          Open the secure link from your invitation email (or message from your
          admin). It includes a one-time token and will take you back here to set
          your password and profile.
        </p>
      </div>
    );
  }

  return <OnboardingInviteGate role={role} inviteToken={inviteToken} />;
}

function OnboardingInviteGate({
  role,
  inviteToken,
}: {
  role: DirectoryRole;
  inviteToken: string;
}) {
  const [state, setState] = useState<
    | { status: "loading" }
    | {
        status: "ready";
        emailHint: string;
        defaultFullName?: string;
        businessName?: string;
      }
    | { status: "error"; message: string }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const qs = new URLSearchParams({ invite: inviteToken, role });
      const res = await fetch(`/api/onboarding/invite?${qs.toString()}`, {
        credentials: "omit",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        emailHint?: string;
        defaultFullName?: string;
        businessName?: string;
      };
      if (cancelled) return;
      if (!res.ok) {
        setState({
          status: "error",
          message: data.error ?? "This invite is not valid.",
        });
        return;
      }
      setState({
        status: "ready",
        emailHint: data.emailHint ?? "your work email",
        defaultFullName: data.defaultFullName,
        businessName: data.businessName,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteToken, role]);

  if (state.status === "loading") {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Checking your invite…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Invite unavailable</AlertTitle>
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <OnboardingInviteForm
      role={role}
      inviteToken={inviteToken}
      emailHint={state.emailHint}
      defaultFullName={state.defaultFullName}
      businessName={state.businessName}
    />
  );
}
