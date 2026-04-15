"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { mapAuthClientMutationError } from "@/lib/forms/map-auth-url-error";

export type ForgotPasswordFormValues = {
  email: string;
};

export function useForgotPasswordForm() {
  const [info, setInfo] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const { setError, clearErrors, handleSubmit } = form;

  const resetMutation = useMutation({
    mutationFn: async (values: ForgotPasswordFormValues) => {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${origin}/auth/callback`,
        },
      );
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      setInfo(
        "If an account exists for that email, we sent a link to reset your password.",
      );
      form.reset({ email: "" });
    },
  });

  const registerEmail = form.register("email", {
    required: "Email is required",
  });

  const onValidSubmit = handleSubmit((values) => {
    clearErrors("root");
    setInfo(null);
    resetMutation.mutate(values, {
      onError: (err) => {
        setError("root", {
          type: "server",
          message: mapAuthClientMutationError(err),
        });
      },
    });
  });

  return {
    form,
    registerEmail,
    onValidSubmit,
    info,
    isSubmitting: resetMutation.isPending,
  };
}
