import { WorkspaceContentShell } from "@/components/layout/workspace-content-shell";
import { WorkspaceMobileNav } from "@/components/layout/workspace-mobile-nav";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <WorkspaceMobileNav />
      <WorkspaceContentShell>{children}</WorkspaceContentShell>
    </div>
  );
}
