"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClientProfilePhotoSlot } from "@/components/admin/client-profile-photo-slot";
import {
  fetchMeProfile,
  patchMeProfile,
  uploadMyProfilePhoto,
} from "@/lib/query/me-profile";
import { queryKeys } from "@/lib/query/query-keys";
import type { MeProfile } from "@/lib/types/me-profile";
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

export type AccountProfileClientProps = {
  initialProfile: MeProfile;
};

export function AccountProfileClient({ initialProfile }: AccountProfileClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: queryKeys.me.profile(),
    queryFn: fetchMeProfile,
    initialData: initialProfile,
  });

  const profile = profileQuery.data ?? initialProfile;
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(() => profile.full_name ?? "");
  const [editError, setEditError] = useState<string | null>(null);

  const patchMutation = useMutation({
    mutationFn: () => patchMeProfile(draftName.trim()),
    onSuccess: (updated) => {
      setEditError(null);
      queryClient.setQueryData(queryKeys.me.profile(), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.me.sessionSummary() });
      setDraftName(updated.full_name ?? "");
      setEditing(false);
      router.refresh();
    },
    onError: (err: Error) => {
      setEditError(err.message);
    },
  });

  const photoMutation = useMutation({
    mutationFn: (file: File) => uploadMyProfilePhoto(file),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.me.profile(), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.me.sessionSummary() });
      router.refresh();
    },
  });

  const displayName = profile.full_name?.trim() || "Your profile";
  const memberSince = new Date(profile.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const busy = patchMutation.isPending || photoMutation.isPending;

  const startEdit = () => {
    setEditError(null);
    setDraftName(profile.full_name ?? "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditError(null);
    setDraftName(profile.full_name ?? "");
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Photo and name are shown in the app. Email is managed at sign-in.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="shrink-0">
              <ClientProfilePhotoSlot
                kind="avatar"
                url={profile.avatar_url}
                disabled={busy}
                variant="round"
                uploadAriaLabel="Upload profile photo"
                onPickFile={async (file) => {
                  await photoMutation.mutateAsync(file);
                }}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="text-xl">{displayName}</CardTitle>
              <CardDescription className="break-all font-mono text-xs">
                {profile.email ?? "—"}
              </CardDescription>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {!editing ? (
              <Button type="button" size="toolbar" variant="outline" onClick={startEdit}>
                Edit
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  size="toolbar"
                  disabled={patchMutation.isPending}
                  onClick={() => patchMutation.mutate()}
                >
                  {patchMutation.isPending ? "Saving…" : "Save"}
                </Button>
                <Button
                  type="button"
                  size="toolbar"
                  variant="ghost"
                  disabled={patchMutation.isPending}
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-6">
              <div className="text-sm text-muted-foreground">Full name</div>
              <div className="min-w-0">
                {editing ? (
                  <Input
                    id="account-profile-full-name"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    disabled={patchMutation.isPending}
                    autoComplete="name"
                    className="max-w-md font-medium"
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground">
                    {profile.full_name?.trim() || "—"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-6">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="min-w-0">
                <Input
                  readOnly
                  value={profile.email ?? ""}
                  className="max-w-md cursor-not-allowed bg-muted/50 font-medium text-muted-foreground opacity-100"
                  tabIndex={-1}
                  aria-readonly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-6">
              <div className="text-sm text-muted-foreground">Member since</div>
              <p className="text-sm font-medium text-foreground">{memberSince}</p>
            </div>
          </div>

          {editError ? (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle>Could not save</AlertTitle>
              <AlertDescription>{editError}</AlertDescription>
            </Alert>
          ) : null}

          {photoMutation.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Upload failed</AlertTitle>
              <AlertDescription>
                {photoMutation.error instanceof Error
                  ? photoMutation.error.message
                  : "Could not upload photo"}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="border-t border-border pt-6">
            <Button
              render={<Link href="/account/security" />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              Security — change password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
