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
