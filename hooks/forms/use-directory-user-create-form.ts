"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { queryKeys } from "@/lib/query/query-keys";

export type DirectoryUserCreateValues = {
  full_name: string;
  email: string;
  password: string;
  business_name: string;
  /** Client only; optional `YYYY-MM-DD`. */
  date_joined: string;
};

type UseDirectoryUserCreateFormOptions = {
  role: DirectoryRole;
  /** Called after a successful create (e.g. close modal), after a short delay so success copy is visible. */
  onCreated?: () => void;
};

type ClientInviteResponse = {
  error?: string;
  message?: string;
  inviteUrl?: string;
  emailSent?: boolean;
  emailError?: string;
};

export function useDirectoryUserCreateForm({
  role,
  onCreated,
}: UseDirectoryUserCreateFormOptions) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);
  const onCreatedRef = useRef(onCreated);
  useEffect(() => {
    onCreatedRef.current = onCreated;
  }, [onCreated]);

  const form = useForm<DirectoryUserCreateValues>({
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      business_name: "",
      date_joined: "",
    },
    mode: "onSubmit",
  });

  const { setError, clearErrors, handleSubmit } = form;

  const createUserMutation = useMutation({
    mutationFn: async (values: DirectoryUserCreateValues) => {
      if (role === "client") {
        const res = await fetch("/api/admin/client-invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            full_name: values.full_name,
            business_name: values.business_name,
            ...(values.date_joined.trim()
              ? { date_joined: values.date_joined.trim() }
              : {}),
          }),
        });
        const data = (await res.json()) as ClientInviteResponse;
        if (!res.ok) {
          throw new Error(data.error ?? "Could not create invite");
        }
        return data;
      }

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          full_name: values.full_name,
          role,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not create user");
      }
      return null;
    },
    onSuccess: async (inviteResult) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.profiles(role),
      });
      clearErrors("root");
      if (role === "client" && inviteResult?.message) {
        const linkLine =
          inviteResult.inviteUrl ? ` Invite link: ${inviteResult.inviteUrl}` : "";
        setSuccess(`${inviteResult.message}${linkLine}`);
      } else {
        setSuccess(
          "User created. They can sign in with this email and password.",
        );
      }
      form.reset({
        full_name: "",
        email: "",
        password: "",
        business_name: "",
        date_joined: "",
      });
      if (onCreatedRef.current) {
        window.setTimeout(() => {
          onCreatedRef.current?.();
        }, 1400);
      }
    },
  });

  const registerFullName = form.register("full_name");
  const registerEmail = form.register("email", {
    required: "Email is required",
  });
  const registerPassword = form.register("password", {
    validate: (value) => {
      if (role === "client") return true;
      if (!value?.trim()) return "Password is required";
      if (value.length < 8) return "Password must be at least 8 characters.";
      return true;
    },
  });
  const registerBusinessName = form.register("business_name", {
    validate: (value) => {
      if (role !== "client") return true;
      return value?.trim() ? true : "Business name is required";
    },
  });
  const registerDateJoined = form.register("date_joined", {
    validate: (value) => {
      if (role !== "client") return true;
      const t = (value ?? "").trim();
      if (!t) return true;
      return /^\d{4}-\d{2}-\d{2}$/.test(t) ? true : "Use YYYY-MM-DD";
    },
  });

  const onValidSubmit = handleSubmit((values) => {
    clearErrors("root");
    setSuccess(null);
    createUserMutation.mutate(values, {
      onError: (err) => {
        setError("root", {
          type: "server",
          message:
            err instanceof Error ? err.message : "Network error. Try again.",
        });
      },
    });
  });

  return {
    form,
    registerFullName,
    registerEmail,
    registerPassword,
    registerBusinessName,
    registerDateJoined,
    onValidSubmit,
    success,
    isSubmitting: createUserMutation.isPending,
  };
}
