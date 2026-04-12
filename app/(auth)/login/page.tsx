"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useLoginForm } from "@/hooks/forms";
import {
  formFieldInputClass,
  formFieldInputInvalidClass,
} from "@/lib/forms/field-styles";

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
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email
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
            autoComplete="current-password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={`${formFieldInputClass} ${formFieldInputInvalidClass(!!errors.password)}`}
            {...registerPassword}
          />
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          No account yet?{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400"
          >
            Create one
          </Link>
        </p>
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
        >
          <p className="text-sm text-zinc-500">Loading…</p>
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
