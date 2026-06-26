"use client";

import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import { useDirectoryUserCreateForm } from "@/hooks/forms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DirectoryCreateFormProps = {
  role: DirectoryRole;
  /** `plain` omits the card chrome (e.g. inside a dialog). */
  variant?: "card" | "plain";
  /** Right-aligned, larger submit — use inside the directory create dialog. */
  modalFooter?: boolean;
  onCreated?: () => void;
};

/** Stable id for `aria-describedby` on the directory create dialog title. */
export function directoryCreateIntroDomId(role: DirectoryRole): string {
  return `directory-add-intro-${role}`;
}

function DirectoryCreateIntroText({ role }: { role: DirectoryRole }) {
  return (
    <>
      Creates an account with the{" "}
      <span className="font-medium text-foreground">
        {DIRECTORY_ROLE_LABELS[role]}
      </span>{" "}
      role. The server needs the Supabase service role key configured for this
      action.
    </>
  );
}

export function DirectoryCreateForm({
  role,
  variant = "card",
  modalFooter = false,
  onCreated,
}: DirectoryCreateFormProps) {
  const {
    form,
    registerFullName,
    registerEmail,
    registerPassword,
    onValidSubmit,
    success,
    isSubmitting,
  } = useDirectoryUserCreateForm({ role, onCreated });
  const {
    formState: { errors },
  } = form;

  const introId = directoryCreateIntroDomId(role);

  const formBody = (
    <form
      onSubmit={onValidSubmit}
      className="grid gap-4 sm:grid-cols-2"
      noValidate
    >
      {variant === "plain" ? (
        <p
          id={introId}
          className="sm:col-span-2 text-pretty text-sm leading-relaxed text-muted-foreground"
        >
          <DirectoryCreateIntroText role={role} />
        </p>
      ) : null}
      {errors.root?.message && !success ? (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-50 sm:col-span-2"
          role="status"
        >
          {success}
        </div>
      ) : null}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`full_name_${role}`}>Full name</Label>
        <Input
          id={`full_name_${role}`}
          autoComplete="name"
          aria-invalid={errors.full_name ? "true" : "false"}
          aria-describedby={
            errors.full_name ? `full_name_${role}-error` : undefined
          }
          {...registerFullName}
        />
        {errors.full_name?.message ? (
          <p
            id={`full_name_${role}-error`}
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.full_name.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`email_${role}`}>Email</Label>
        <Input
          id={`email_${role}`}
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? `email_${role}-error` : undefined}
          {...registerEmail}
        />
        {errors.email?.message ? (
          <p
            id={`email_${role}-error`}
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.email.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`password_${role}`}>Temporary password</Label>
        <Input
          id={`password_${role}`}
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.password ? "true" : "false"}
          aria-describedby={
            errors.password ? `password_${role}-error` : undefined
          }
          {...registerPassword}
        />
        {errors.password?.message ? (
          <p
            id={`password_${role}-error`}
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.password.message}
          </p>
        ) : null}
      </div>
      <div
        className={
          modalFooter ?
            "flex justify-end sm:col-span-2"
          : "sm:col-span-2"
        }
      >
        <Button
          type="submit"
          disabled={isSubmitting}
          className={
            modalFooter ?
              "h-11 min-w-[10.5rem] rounded-md px-8 text-base font-medium"
            : undefined
          }
        >
          {isSubmitting ? "Creating…" : "Create User"}
        </Button>
      </div>
    </form>
  );

  if (variant === "plain") {
    return formBody;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add {DIRECTORY_ROLE_LABELS[role]}</CardTitle>
        <CardDescription>
          <DirectoryCreateIntroText role={role} />
        </CardDescription>
      </CardHeader>
      <CardContent>{formBody}</CardContent>
    </Card>
  );
}
