"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { useForgotPasswordForm } from "@/hooks/forms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const {
    form,
    registerEmail,
    onValidSubmit,
    info,
    isSubmitting,
  } = useForgotPasswordForm();
  const {
    formState: { errors },
  } = form;

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your work email and we will send a reset link if an account exists."
      brandPlacement="outside-card"
      showBackToHome={false}
      edgeThemeToggle
      centerHeaderText
      compactSubtitleTopSpacing
    >
      <form onSubmit={onValidSubmit} className="space-y-5" noValidate>
        {errors.root?.message ? (
          <Alert variant="destructive">
            <AlertTitle>Could not send reset email</AlertTitle>
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        ) : null}
        {info ? (
          <div
            className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
            role="status"
          >
            {info}
          </div>
        ) : null}
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
        <Button
          type="submit"
          className="w-full rounded-md h-10 mt-2"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
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
