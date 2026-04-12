import type { Metadata } from "next";
import { RoleWorkspacePlaceholder } from "@/components/role-workspaces/role-workspace-placeholder";

export const metadata: Metadata = {
  title: "Operations workspace",
  robots: { index: false, follow: false },
};

export default function OperationsWorkspacePage() {
  return <RoleWorkspacePlaceholder role="operations" />;
}
