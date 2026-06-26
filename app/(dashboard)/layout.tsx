import { AgencyOsShell } from "@/components/workspace/agency-os-shell";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AgencyOsShell>{children}</AgencyOsShell>;
}
