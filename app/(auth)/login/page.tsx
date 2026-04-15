"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useLoginForm } from "@/hooks/forms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const {
    form,
    registerEmail,
    registerPassword,
    onValidSubmit,
    isSubmitting,
  } = useLoginForm({ urlError });
  const {
    formState: { errors },
  } = form;

  return (
    <AuthShell
      title="Sign in"
      subtitle="Sign in to your elev8temedia workspace."
      brandPlacement="outside-card"
      showBackToHome={false}
      edgeThemeToggle
      centerHeaderText
      compactSubtitleTopSpacing
    >
      <form onSubmit={onValidSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...registerEmail}
          />
          {errors.email?.message ? (
            <p
              id="email-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={
              errors.password ? "password-error" : undefined
            }
            {...registerPassword}
          />
          {errors.password?.message ? (
            <p
              id="password-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>
        {errors.root?.message ? (
          <Alert variant="destructive">
            <AlertTitle>Sign in failed</AlertTitle>
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        ) : null}
        <Button
          type="submit"
          className="w-full rounded-md h-10 mt-6"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
        <div className="text-center">
          <Button
            render={<Link href="/forgot-password" />}
            nativeButton={false}
            variant="link"
            className="h-auto px-0 py-0 text-sm text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Sign in"
          subtitle="Sign in to your elev8temedia workspace."
          brandPlacement="outside-card"
          showBackToHome={false}
          edgeThemeToggle
          centerHeaderText
          compactSubtitleTopSpacing
        >
          <p className="text-sm text-muted-foreground">Loading…</p>
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
