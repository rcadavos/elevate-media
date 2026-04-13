import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientHubDetailView } from "@/components/client-hub/client-hub-detail-view";
import { getClientHubDetail } from "@/lib/demo-data/client-hub";

type PageProps = {
  params: Promise<{ clientId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clientId } = await params;
  const detail = getClientHubDetail(clientId);
  if (!detail) {
    return { title: "Client Hub", robots: { index: false, follow: false } };
  }
  return {
    title: `${detail.name} · Client Hub`,
    robots: { index: false, follow: false },
  };
}

export default async function ClientHubDetailPage({ params }: PageProps) {
  const { clientId } = await params;
  const detail = getClientHubDetail(clientId);
  if (!detail) {
    notFound();
  }

  return <ClientHubDetailView detail={detail} />;
}
