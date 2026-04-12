import type { Metadata } from "next";
import { RoleWorkspacePlaceholder } from "@/components/role-workspaces/role-workspace-placeholder";

export const metadata: Metadata = {
  title: "Client workspace",
  robots: { index: false, follow: false },
};

export default function ClientWorkspacePage() {
  return <RoleWorkspacePlaceholder role="client" />;
}
