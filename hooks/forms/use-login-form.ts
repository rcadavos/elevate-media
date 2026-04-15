"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { getPostSignInRedirectPath } from "@/lib/auth/post-sign-in-redirect";
import { createClient } from "@/lib/supabase/client";
import {
  mapAuthClientMutationError,
  mapAuthUrlError,
} from "@/lib/forms/map-auth-url-error";
import { queryKeys } from "@/lib/query/query-keys";

export type LoginFormValues = {
  email: string;
  password: string;
};

type UseLoginFormOptions = {
  /** `error` query param from the URL (e.g. after auth callback). */
  urlError: string | null;
};

export function useLoginForm({ urlError }: UseLoginFormOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const { setError, clearErrors, handleSubmit } = form;

  useEffect(() => {
    if (!urlError) {
      clearErrors("root");
      return;
    }
    setError("root", {
      type: "server",
      message: mapAuthUrlError(urlError),
    });
  }, [urlError, setError, clearErrors]);

  const signInMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: async () => {
      const supabase = createClient();
      try {
        await fetch("/api/me/sign-in-event", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auth_factor: "password" }),
        });
      } catch {
        /* non-blocking */
      }
      const path = await getPostSignInRedirectPath(supabase);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.me.sessionSummary(),
      });
      router.push(path);
      router.refresh();
    },
  });

  const registerEmail = form.register("email", {
    required: "Email is required",
  });
  const registerPassword = form.register("password", {
    required: "Password is required",
  });

  const onValidSubmit = handleSubmit((values) => {
    clearErrors("root");
    signInMutation.mutate(values, {
      onError: (err) => {
        void fetch("/api/auth/sign-in-event", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            auth_factor: "password",
          }),
        });
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
    onValidSubmit,
    isSubmitting: signInMutation.isPending,
  };
}
