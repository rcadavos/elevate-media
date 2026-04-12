"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { useSignupForm } from "@/hooks/forms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const {
    form,
    registerEmail,
    registerPassword,
    registerConfirm,
    onValidSubmit,
    info,
    isSubmitting,
  } = useSignupForm();
  const {
    formState: { errors },
  } = form;

  return (
    <AuthShell
      title="Create account"
      subtitle="Invite-only in production — for the demo, use any email you control."
    >
      <form onSubmit={onValidSubmit} className="space-y-5" noValidate>
        {errors.root?.message ? (
          <Alert variant="destructive">
            <AlertTitle>Could not create account</AlertTitle>
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        ) : null}
        {info ? (
          <div
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-50"
            role="status"
          >
            {info}
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
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
            autoComplete="new-password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={
              errors.password ? "password-error" : "password-hint"
            }
            {...registerPassword}
          />
          <p
            id="password-hint"
            className={`text-xs text-muted-foreground ${errors.password?.message ? "hidden" : ""}`}
          >
            At least 8 characters.
          </p>
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
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.confirm ? "true" : "false"}
            aria-describedby={errors.confirm ? "confirm-error" : undefined}
            {...registerConfirm}
          />
          {errors.confirm?.message ? (
            <p
              id="confirm-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.confirm.message}
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have access?{" "}
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="link"
            className="h-auto p-0 text-primary"
          >
            Sign in
          </Button>
        </p>
      </form>
    </AuthShell>
  );
}
