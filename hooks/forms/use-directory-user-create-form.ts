"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { queryKeys } from "@/lib/query/query-keys";

export type DirectoryUserCreateValues = {
  full_name: string;
  email: string;
  password: string;
};

type UseDirectoryUserCreateFormOptions = {
  role: DirectoryRole;
};

export function useDirectoryUserCreateForm({
  role,
}: UseDirectoryUserCreateFormOptions) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<DirectoryUserCreateValues>({
    defaultValues: { full_name: "", email: "", password: "" },
    mode: "onSubmit",
  });

  const { setError, clearErrors, handleSubmit } = form;

  const createUserMutation = useMutation({
    mutationFn: async (values: DirectoryUserCreateValues) => {
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
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.profiles(role),
      });
      clearErrors("root");
      setSuccess(
        "User created. They can sign in with this email and password.",
      );
      form.reset({ full_name: "", email: "", password: "" });
    },
  });

  const registerFullName = form.register("full_name");
  const registerEmail = form.register("email", {
    required: "Email is required",
  });
  const registerPassword = form.register("password", {
    required: "Temporary password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters.",
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
    onValidSubmit,
    success,
    isSubmitting: createUserMutation.isPending,
  };
}
