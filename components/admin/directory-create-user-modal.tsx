"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import type { DirectoryRole } from "@/lib/constants/directory-roles";
import { DIRECTORY_ROLE_LABELS } from "@/lib/constants/directory-roles";
import {
  DirectoryCreateForm,
  directoryCreateIntroDomId,
} from "@/components/admin/directory-create-form";
import {
  Dialog,
  DialogContent,
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
          buttonVariants({ variant: "default", size: "toolbar" }),
          "inline-flex w-full min-w-0 items-center justify-center sm:w-auto",
        )}
      >
        <Plus className="size-4 shrink-0" aria-hidden />
        Add {DIRECTORY_ROLE_LABELS[role]}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle aria-describedby={directoryCreateIntroDomId(role)}>
            Add {DIRECTORY_ROLE_LABELS[role]}
          </DialogTitle>
        </DialogHeader>
        <DirectoryCreateForm
          role={role}
          variant="plain"
          modalFooter
          onCreated={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
