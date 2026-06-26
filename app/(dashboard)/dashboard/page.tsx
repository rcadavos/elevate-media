import type { Metadata } from "next";
import { AgencyDashboard } from "@/components/agency/agency-dashboard";
import { getClients } from "@/lib/data/agency";

export const metadata: Metadata = {
  title: "Dashboard · Agency OS",
  robots: { index: false, follow: false },
};

export default async function DashboardRoutePage() {
  const clients = await getClients();
  return <AgencyDashboard clients={clients} />;
}
