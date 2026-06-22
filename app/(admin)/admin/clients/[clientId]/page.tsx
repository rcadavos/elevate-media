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

export default async function AdminClientDetailPage({ params }: PageProps) {
  const { clientId } = await params;
  const client = await getClientById(clientId);

  if (!client) {
    notFound();
  }

  const [metrics, feedback] = await Promise.all([
    getClientWeeklyMetrics(clientId),
    getClientFeedback(clientId),
  ]);

  return (
    <ClientDetail
      client={client}
      metrics={metrics}
      feedback={feedback}
      basePath="/admin/clients"
      editable
    />
  );
}
