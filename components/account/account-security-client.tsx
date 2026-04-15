"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { postMePassword } from "@/lib/query/me-profile";
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

export function AccountSecurityClient() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      setFormError(null);
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      if (password !== confirm) {
        throw new Error("Passwords do not match");
      }
      await postMePassword(password);
    },
    onSuccess: () => {
      setPassword("");
      setConfirm("");
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set a new password for your Agency OS account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Use at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-new-password">New password</Label>
            <Input
              id="account-new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                mutation.reset();
                setFormError(null);
                setPassword(e.target.value);
              }}
              disabled={mutation.isPending}
              aria-invalid={!!formError}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-confirm-password">Confirm new password</Label>
            <Input
              id="account-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                mutation.reset();
                setFormError(null);
                setConfirm(e.target.value);
              }}
              disabled={mutation.isPending}
              aria-invalid={!!formError}
            />
          </div>

          {formError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not update password</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          {mutation.isSuccess ? (
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground" role="status">
              Password updated. Use your new password next time you sign in.
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Updating…" : "Update password"}
            </Button>
            <Button
              render={<Link href="/account/profile" />}
              nativeButton={false}
              variant="ghost"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5"
            >
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              Back to profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
