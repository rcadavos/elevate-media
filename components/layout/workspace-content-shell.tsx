import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WorkspaceContentShellProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Non-mobile: bounded width + fills most of the viewport so pages read as a
 * consistent canvas. Mobile: full width with comfortable padding.
 */
export function WorkspaceContentShell({
  children,
  className,
}: WorkspaceContentShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col md:min-h-[calc(100dvh-3.5rem)]",
        className,
      )}
    >
      <div className="mx-auto flex w-full min-h-0 min-w-0 max-w-6xl flex-1 flex-col px-4 py-6 md:px-8 md:py-10">
        {children}
      </div>
    </div>
  );
}
