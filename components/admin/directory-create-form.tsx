"use client";

import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import { useDirectoryUserCreateForm } from "@/hooks/forms";
import {
  formFieldInputClass,
  formFieldInputInvalidClass,
} from "@/lib/forms/field-styles";

type DirectoryCreateFormProps = {
  role: DirectoryRole;
};

export function DirectoryCreateForm({ role }: DirectoryCreateFormProps) {
  const {
    form,
    registerFullName,
    registerEmail,
    registerPassword,
    onValidSubmit,
    success,
    isSubmitting,
  } = useDirectoryUserCreateForm({ role });
  const {
    formState: { errors },
  } = form;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Add {DIRECTORY_ROLE_LABELS[role]}
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Creates an account with the{" "}
        <span className="font-medium text-zinc-800 dark:text-zinc-200">
          {DIRECTORY_ROLE_LABELS[role]}
        </span>{" "}
        role. The server needs the Supabase service role key configured for
        this action.
      </p>
      <form
        onSubmit={onValidSubmit}
        className="mt-6 grid gap-4 sm:grid-cols-2"
        noValidate
      >
        {errors.root?.message && !success ? (
          <p
            className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {errors.root.message}
          </p>
        ) : null}
        {success ? (
          <p
            className="sm:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100"
            role="status"
          >
            {success}
          </p>
        ) : null}
        <div className="sm:col-span-2">
          <label
            htmlFor={`full_name_${role}`}
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Full name
          </label>
          <input
            id={`full_name_${role}`}
            autoComplete="name"
            aria-invalid={errors.full_name ? "true" : "false"}
            aria-describedby={
              errors.full_name ? `full_name_${role}-error` : undefined
            }
            className={`${formFieldInputClass} ${formFieldInputInvalidClass(!!errors.full_name)}`}
            {...registerFullName}
          />
          {errors.full_name?.message ? (
            <p
              id={`full_name_${role}-error`}
              className="mt-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {errors.full_name.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor={`email_${role}`}
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email
          </label>
          <input
            id={`email_${role}`}
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? `email_${role}-error` : undefined}
            className={`${formFieldInputClass} ${formFieldInputInvalidClass(!!errors.email)}`}
            {...registerEmail}
          />
          {errors.email?.message ? (
            <p
              id={`email_${role}-error`}
              className="mt-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor={`password_${role}`}
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Temporary password
          </label>
          <input
            id={`password_${role}`}
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={
              errors.password ? `password_${role}-error` : undefined
            }
            className={`${formFieldInputClass} ${formFieldInputInvalidClass(!!errors.password)}`}
            {...registerPassword}
          />
          {errors.password?.message ? (
            <p
              id={`password_${role}-error`}
              className="mt-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 disabled:opacity-60"
          >
            {isSubmitting ? "Creating…" : "Create user"}
          </button>
        </div>
      </form>
    </div>
  );
}
