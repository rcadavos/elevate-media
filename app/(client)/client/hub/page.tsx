import type { Metadata } from "next";
import { ClientHubList } from "@/components/client-hub/client-hub-list";
import { getClientHubSummaries } from "@/lib/demo-data/client-hub";

export const metadata: Metadata = {
  title: "Client Hub",
  robots: { index: false, follow: false },
};

export default function ClientHubListPage() {
  const items = getClientHubSummaries();

  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          elev8temedia
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Client Hub
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Each card is a program or brand workspace with revenue, payments,
          performance, weekly updates, and communication history. Demo data is
          static until your account is wired to live reporting.
        </p>
      </div>
      <ClientHubList items={items} />
    </div>
  );
}
