import { ClientWorkspaceChrome } from "@/components/layout/client-workspace-chrome";
import { WorkspaceContentShell } from "@/components/layout/workspace-content-shell";

export default function ClientGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <ClientWorkspaceChrome />
      <WorkspaceContentShell>{children}</WorkspaceContentShell>
    </div>
  );
}
