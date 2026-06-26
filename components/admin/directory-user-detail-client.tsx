"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import type { ProfileRow } from "@/lib/types/profile";
import {
  fetchAdminProfiles,
  mergeProfileIntoRoleCache,
  patchAdminProfile,
  uploadAdminClientProfilePhoto,
} from "@/lib/query/admin-profiles";
import { ClientProfilePhotoSlot } from "@/components/admin/client-profile-photo-slot";
import { queryKeys } from "@/lib/query/query-keys";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DirectoryUserDetailClientProps = {
  role: DirectoryRole;
  profile: ProfileRow;
};

function normalizeProfile(p: ProfileRow): ProfileRow {
  return { ...p, is_active: p.is_active !== false };
}

export function DirectoryUserDetailClient({
  role,
  profile: initialProfile,
}: DirectoryUserDetailClientProps) {
  const queryClient = useQueryClient();
  const listQuery = useQuery({
    queryKey: queryKeys.admin.profiles(role),
    queryFn: () => fetchAdminProfiles(role),
  });

  const displayProfile = useMemo(() => {
    const fromCache = listQuery.data?.find((p) => p.id === initialProfile.id);
    return normalizeProfile(fromCache ?? initialProfile);
  }, [listQuery.data, initialProfile]);

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(
    () => initialProfile.full_name ?? "",
  );
  const [draftActive, setDraftActive] = useState(
    () => initialProfile.is_active !== false,
  );

  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const patchMutation = useMutation({
    mutationFn: () =>
      patchAdminProfile(initialProfile.id, {
        role,
        full_name: draftName.trim(),
        is_active: draftActive,
      }),
    onSuccess: (updated) => {
      setEditError(null);
      mergeProfileIntoRoleCache(queryClient, role, updated);
      setDraftName(updated.full_name ?? "");
      setDraftActive(updated.is_active !== false);
      setEditing(false);
    },
    onError: (err: Error) => {
      setEditError(err.message);
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/admin/profiles/${encodeURIComponent(initialProfile.id)}/send-onboarding`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ role }),
        },
      );
      const data = (await res.json()) as {
        error?: string;
        inviteUrl?: string;
        message?: string;
        sentAt?: string;
        emailSent?: boolean;
        emailError?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not create invite");
      }
      return data;
    },
    onSuccess: (data) => {
      setSendError(null);
      setNotice(data.message ?? "Onboarding invite created.");
      setInviteUrl(
        typeof data.inviteUrl === "string" && data.inviteUrl ? data.inviteUrl : null,
      );
      const sentAt = data.sentAt;
      if (sentAt) {
        queryClient.setQueryData<ProfileRow[]>(
          queryKeys.admin.profiles(role),
          (old) =>
            old?.map((p) =>
              p.id === initialProfile.id
                ? { ...p, onboarding_sent_at: sentAt }
                : p,
            ),
        );
      }
    },
    onError: (err: Error) => {
      setNotice(null);
      setInviteUrl(null);
      setSendError(err.message);
    },
  });

  const segmentLabel = DIRECTORY_ROLE_LABELS[role];
  const sentLabel = displayProfile.onboarding_sent_at
    ? new Date(displayProfile.onboarding_sent_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const startEdit = () => {
    setEditError(null);
    setDraftName(displayProfile.full_name ?? "");
    setDraftActive(displayProfile.is_active);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditError(null);
    setDraftName(displayProfile.full_name ?? "");
    setDraftActive(displayProfile.is_active);
    setEditing(false);
  };

  const resendLabel =
    displayProfile.onboarding_sent_at ? "Resend onboarding" : "Send onboarding";

  const activeRadioName = `dir-${role}-active-${initialProfile.id}`;

  const onboardingBlock = (
    <>
      {sendError ? (
        <Alert variant="destructive">
          <AlertTitle>Send failed</AlertTitle>
          <AlertDescription>{sendError}</AlertDescription>
        </Alert>
      ) : null}

      {notice && !sendMutation.isPending ? (
        <div
          className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
          role="status"
        >
          {notice}
        </div>
      ) : null}

      {inviteUrl ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-xs break-all text-muted-foreground">
          <span className="font-medium text-foreground">Invite link:</span>{" "}
          {inviteUrl}
        </div>
      ) : null}
    </>
  );

  const handleAdminProfilePhoto = useCallback(
    async (kind: "business_logo" | "avatar", file: File) => {
      const updated = await uploadAdminClientProfilePhoto(
        initialProfile.id,
        kind,
        file,
      );
      mergeProfileIntoRoleCache(queryClient, role, updated);
    },
    [initialProfile.id, queryClient, role],
  );

  const staffNameDisplay = displayProfile.full_name?.trim() || "—";
  const staffDateJoinedViewLabel = new Date(
    displayProfile.date_joined ?? displayProfile.created_at,
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const staffDateAddedLabel = new Date(displayProfile.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
  const staffPhotoBusy = patchMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          render={<Link href={`/admin/directory/${role}`} />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="inline-flex w-fit items-center gap-1.5 px-0 text-muted-foreground"
        >
          <ChevronLeft className="size-4 shrink-0" aria-hidden />
          Back to {segmentLabel} directory
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-0 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
              <div className="shrink-0 self-center sm:self-auto">
                <ClientProfilePhotoSlot
                  kind="avatar"
                  url={displayProfile.avatar_url}
                  disabled={staffPhotoBusy}
                  variant="round"
                  uploadAriaLabel="Upload user avatar"
                  onPickFile={(file) => handleAdminProfilePhoto("avatar", file)}
                />
              </div>
              <div className="w-full min-w-0 flex-1 space-y-1 sm:w-auto">
                {editing ? (
                  <Input
                    id={`dir-staff-name-${initialProfile.id}`}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    disabled={patchMutation.isPending}
                    autoComplete="name"
                    placeholder="Full name"
                    aria-label="Full name"
                    className="h-11 min-h-11 shrink-0 py-1 text-center text-lg font-semibold leading-tight sm:h-9 sm:py-1 sm:text-left"
                  />
                ) : (
                  <p className="truncate text-xl font-semibold tracking-tight text-foreground">
                    {staffNameDisplay}
                  </p>
                )}
                <p className="break-all text-center font-mono text-xs text-muted-foreground sm:text-left">
                  {displayProfile.id}
                </p>
                <p className="text-center text-xs text-muted-foreground sm:text-left">
                  <span className="font-medium text-foreground">{segmentLabel}</span>
                  {" · "}
                  <span
                    className={
                      displayProfile.is_active
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }
                  >
                    {displayProfile.is_active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              {!editing ? (
                <div className="flex w-full gap-2 sm:contents">
                  <Button
                    type="button"
                    variant="outline"
                    size="toolbar"
                    disabled={sendMutation.isPending}
                    className="min-h-11 min-w-0 flex-1 basis-0 sm:h-9 sm:flex-none sm:basis-auto"
                    onClick={() => {
                      setSendError(null);
                      setNotice(null);
                      setInviteUrl(null);
                      sendMutation.mutate();
                    }}
                  >
                    {sendMutation.isPending ? "Working…" : resendLabel}
                  </Button>
                  <Button
                    type="button"
                    size="toolbar"
                    className="min-h-11 min-w-0 flex-1 basis-0 sm:h-9 sm:flex-none sm:basis-auto"
                    onClick={startEdit}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex w-full gap-2 sm:contents">
                  <Button
                    type="button"
                    variant="outline"
                    size="toolbar"
                    disabled={sendMutation.isPending}
                    className="min-h-11 min-w-0 flex-[2] basis-0 sm:h-9 sm:flex-none sm:basis-auto"
                    onClick={() => {
                      setSendError(null);
                      setNotice(null);
                      setInviteUrl(null);
                      sendMutation.mutate();
                    }}
                  >
                    {sendMutation.isPending ? "Working…" : resendLabel}
                  </Button>
                  <Button
                    type="button"
                    size="toolbar"
                    disabled={patchMutation.isPending}
                    className="min-h-11 min-w-0 flex-1 basis-0 sm:h-9 sm:flex-none sm:basis-auto"
                    onClick={() => patchMutation.mutate()}
                  >
                    {patchMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="toolbar"
                    disabled={patchMutation.isPending}
                    className="min-h-11 min-w-0 flex-1 basis-0 sm:h-9 sm:flex-none sm:basis-auto"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div
            className="my-6 border-b border-border"
            role="separator"
            aria-hidden
          />

          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-6">
              <div className="text-sm text-muted-foreground">Avatar</div>
              <div className="min-w-0">
                <ClientProfilePhotoSlot
                  kind="avatar"
                  url={displayProfile.avatar_url}
                  disabled={staffPhotoBusy}
                  variant="round"
                  compact
                  uploadAriaLabel="Upload user avatar"
                  onPickFile={(file) => handleAdminProfilePhoto("avatar", file)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-6">
              <div className="text-sm text-muted-foreground">Active profile</div>
              <div className="min-w-0">
                {editing ? (
                  <fieldset className="border-0 p-0">
                    <legend className="sr-only">Active profile</legend>
                    <div className="flex flex-row flex-wrap gap-6">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                        <input
                          type="radio"
                          name={activeRadioName}
                          checked={draftActive}
                          onChange={() => setDraftActive(true)}
                          disabled={patchMutation.isPending}
                          className="size-4 accent-primary"
                        />
                        Yes
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                        <input
                          type="radio"
                          name={activeRadioName}
                          checked={!draftActive}
                          onChange={() => setDraftActive(false)}
                          disabled={patchMutation.isPending}
                          className="size-4 accent-primary"
                        />
                        No
                      </label>
                    </div>
                  </fieldset>
                ) : (
                  <p className="text-sm font-medium text-foreground">
                    {displayProfile.is_active ? "Yes" : "No"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-center sm:gap-6">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="min-w-0 break-all text-sm font-medium text-foreground">
                {displayProfile.email ?? "—"}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-start sm:gap-6">
              <Label
                htmlFor={`dir-staff-date-joined-${initialProfile.id}`}
                className="text-sm text-muted-foreground sm:pt-2"
              >
                Date joined
              </Label>
              <div className="min-w-0">
                <p
                  id={`dir-staff-date-joined-${initialProfile.id}`}
                  className="text-sm font-medium text-foreground sm:pt-2"
                >
                  {staffDateJoinedViewLabel}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-start sm:gap-6">
              <div className="text-sm text-muted-foreground sm:pt-2">Date added</div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground sm:pt-2">
                  {staffDateAddedLabel}
                </p>
              </div>
            </div>
          </div>

          {editError ? (
            <Alert variant="destructive" className="mt-6">
              <AlertTitle>Could not save</AlertTitle>
              <AlertDescription>{editError}</AlertDescription>
            </Alert>
          ) : null}

          {sentLabel ? (
            <div className="mt-6 border-t border-border pt-6 text-sm">
              <span className="text-muted-foreground">Last onboarding sent</span>
              <p className="mt-1 font-medium text-foreground">{sentLabel}</p>
            </div>
          ) : null}

          <div className="mt-6 space-y-3 border-t border-border pt-6">
            {onboardingBlock}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
