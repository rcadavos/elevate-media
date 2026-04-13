"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { getPostSignInRedirectPath } from "@/lib/auth/post-sign-in-redirect";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query/query-keys";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

type OnboardingInviteFormProps = {
  role: DirectoryRole;
  inviteToken: string;
  emailHint: string;
};

type FormValues = {
  full_name: string;
  password: string;
  password_confirm: string;
};

export function OnboardingInviteForm({
  role,
  inviteToken,
  emailHint,
}: OnboardingInviteFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    defaultValues: { full_name: "", password: "", password_confirm: "" },
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    if (values.password !== values.password_confirm) {
      form.setError("password_confirm", {
        type: "validate",
        message: "Passwords do not match",
      });
      return;
    }

    const res = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invite: inviteToken,
        role,
        password: values.password,
        full_name: values.full_name,
      }),
    });
    const data = (await res.json()) as { error?: string; email?: string | null };

    if (!res.ok) {
      setServerError(data.error ?? "Something went wrong. Try again.");
      return;
    }

    const email = data.email?.trim();
    if (!email) {
      setServerError("Account updated but email was missing. Sign in manually.");
      return;
    }

    const supabase = createClient();
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email,
      password: values.password,
    });

    if (signErr) {
      setServerError(
        `${signErr.message} You can still sign in from the login page with your new password.`,
      );
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: queryKeys.me.sessionSummary(),
    });
    const path = await getPostSignInRedirectPath(supabase);
    router.replace(path);
    router.refresh();
  });

  const label = DIRECTORY_ROLE_LABELS[role];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Welcome to elev8temedia
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {label} Portal — sign in as{" "}
          <span className="font-medium text-foreground">{emailHint}</span>
        </p>
      </div>

      {serverError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not finish setup</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="onboarding-full-name">Full name</Label>
          <Input
            id="onboarding-full-name"
            autoComplete="name"
            aria-invalid={errors.full_name ? "true" : "false"}
            {...register("full_name", { required: "Full name is required" })}
          />
          {errors.full_name?.message ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.full_name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="onboarding-password">Password</Label>
          <Input
            id="onboarding-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Use at least 8 characters.",
              },
            })}
          />
          {errors.password?.message ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="onboarding-password-confirm">Confirm password</Label>
          <Input
            id="onboarding-password-confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password_confirm ? "true" : "false"}
            {...register("password_confirm", {
              required: "Confirm your password",
            })}
          />
          {errors.password_confirm?.message ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.password_confirm.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Create account & sign in"}
        </Button>
      </form>
    </div>
  );
}
