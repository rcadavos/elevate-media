"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { useSignupForm } from "@/hooks/forms";
import {
  formFieldInputClass,
  formFieldInputInvalidClass,
} from "@/lib/forms/field-styles";

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
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {errors.root.message}
          </p>
        ) : null}
        {info ? (
          <p
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
            role="status"
          >
            {info}
          </p>
        ) : null}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Work email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`${formFieldInputClass} ${formFieldInputInvalidClass(!!errors.email)}`}
            {...registerEmail}
          />
          {errors.email?.message ? (
            <p
              id="email-error"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={
              errors.password ? "password-error" : "password-hint"
            }
            className={`${formFieldInputClass} ${formFieldInputInvalidClass(!!errors.password)}`}
            {...registerPassword}
          />
          <p
            id="password-hint"
            className={`mt-1 text-xs text-zinc-500 ${errors.password?.message ? "hidden" : ""}`}
          >
            At least 8 characters.
          </p>
          {errors.password?.message ? (
            <p
              id="password-error"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="confirm"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.confirm ? "true" : "false"}
            aria-describedby={errors.confirm ? "confirm-error" : undefined}
            className={`${formFieldInputClass} ${formFieldInputInvalidClass(!!errors.confirm)}`}
            {...registerConfirm}
          />
          {errors.confirm?.message ? (
            <p
              id="confirm-error"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {errors.confirm.message}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have access?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
