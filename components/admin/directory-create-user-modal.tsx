"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import { DirectoryCreateForm } from "@/components/admin/directory-create-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DirectoryCreateUserModalProps = {
  role: DirectoryRole;
};

export function DirectoryCreateUserModal({ role }: DirectoryCreateUserModalProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        type="button"
        className={cn(
          buttonVariants({ variant: "default" }),
          "inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3",
        )}
      >
        <Plus className="size-4 shrink-0" aria-hidden />
        Add User
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {DIRECTORY_ROLE_LABELS[role]}</DialogTitle>
          <DialogDescription>
            Creates an account with the{" "}
            <span className="font-medium text-foreground">
              {DIRECTORY_ROLE_LABELS[role]}
            </span>{" "}
            role. The server needs the Supabase service role key configured for
            this action.
          </DialogDescription>
        </DialogHeader>
        <DirectoryCreateForm
          role={role}
          variant="plain"
          onCreated={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
