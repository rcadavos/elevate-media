import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientDetail } from "@/components/agency/client-detail";
import {
  getClientById,
  getClientFeedback,
  getClientWeeklyMetrics,
} from "@/lib/data/agency";

type PageProps = {
  params: Promise<{ clientId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clientId } = await params;
  const client = await getClientById(clientId);
  return {
    title: client ? `${client.name} · Clients` : "Client · Agency OS",
    robots: { index: false, follow: false },
  };
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { clientId } = await params;
  const client = await getClientById(clientId);

  if (!client) {
    notFound();
  }

  const [metrics, feedback] = await Promise.all([
    getClientWeeklyMetrics(clientId),
    getClientFeedback(clientId),
  ]);

  return <ClientDetail client={client} metrics={metrics} feedback={feedback} />;
}
