import type { Metadata } from "next";
import { RoleWorkspacePlaceholder } from "@/components/role-workspaces/role-workspace-placeholder";

export const metadata: Metadata = {
  title: "Finance workspace",
  robots: { index: false, follow: false },
};

export default function FinanceWorkspacePage() {
  return <RoleWorkspacePlaceholder role="finance" />;
}
