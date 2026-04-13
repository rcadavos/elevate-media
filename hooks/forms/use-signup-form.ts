"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getPostSignInRedirectPath } from "@/lib/auth/post-sign-in-redirect";
import { createClient } from "@/lib/supabase/client";
import { mapAuthClientMutationError } from "@/lib/forms/map-auth-url-error";
import { queryKeys } from "@/lib/query/query-keys";

export type SignupFormValues = {
  email: string;
  password: string;
  confirm: string;
};

export function useSignupForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [info, setInfo] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    defaultValues: { email: "", password: "", confirm: "" },
    mode: "onSubmit",
  });

  const { setError, clearErrors, handleSubmit, getValues } = form;

  const signUpMutation = useMutation({
    mutationFn: async (values: SignupFormValues) => {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.me.sessionSummary(),
      });
      if (data?.session) {
        const supabase = createClient();
        const path = await getPostSignInRedirectPath(supabase);
        router.push(path);
        router.refresh();
        return;
      }
      setInfo(
        "Check your email to confirm your account, then sign in from the link we sent.",
      );
      form.reset({ email: "", password: "", confirm: "" });
    },
  });

  const registerEmail = form.register("email", {
    required: "Work email is required",
  });
  const registerPassword = form.register("password", {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters.",
    },
  });
  const registerConfirm = form.register("confirm", {
    required: "Please confirm your password",
    validate: (value) =>
      value === getValues("password") || "Passwords do not match.",
  });

  const onValidSubmit = handleSubmit((values) => {
    clearErrors("root");
    setInfo(null);
    signUpMutation.mutate(values, {
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
    registerPassword,
    registerConfirm,
    onValidSubmit,
    info,
    isSubmitting: signUpMutation.isPending,
  };
}
