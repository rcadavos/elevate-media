import type { Metadata } from "next";
import { RoleWorkspacePlaceholder } from "@/components/role-workspaces/role-workspace-placeholder";

export const metadata: Metadata = {
  title: "Sales workspace",
  robots: { index: false, follow: false },
};

export default function SalesWorkspacePage() {
  return <RoleWorkspacePlaceholder role="sales" />;
}
