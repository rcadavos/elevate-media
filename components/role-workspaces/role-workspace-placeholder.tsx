import Link from "next/link";
import {
  DIRECTORY_ROLE_LABELS,
  type DirectoryRole,
} from "@/lib/constants/directory-roles";
import { Button } from "@/components/ui/button";

type NonAdminWorkspaceRole = Exclude<DirectoryRole, "admin">;

export function RoleWorkspacePlaceholder({
  role,
  title,
}: {
  role: NonAdminWorkspaceRole;
  /** Overrides the default “{Label} workspace” heading. */
  title?: string;
}) {
  const label = DIRECTORY_ROLE_LABELS[role];
  const heading = title?.trim() || `${label} workspace`;

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col bg-background px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        elev8temedia
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {heading}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        This URL is reserved for {label.toLowerCase()}-specific modules. Add
        nested routes beside this page inside the matching{" "}
        <code className="rounded bg-muted px-1 text-xs text-foreground">
          ({role})
        </code>{" "}
        route group in the app directory.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button render={<Link href="/dashboard" />} nativeButton={false}>
          Workspace home
        </Button>
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          variant="outline"
        >
          Marketing home
        </Button>
      </div>
    </div>
  );
}
