import { MetaTracking } from "@/components/agency/meta-tracking";
import { getClients } from "@/lib/data/agency";

export default async function AdminMetaPage() {
  const clients = await getClients();

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Meta Tracking
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Meta Tracking
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Ad performance and creatives, logged per client per week.
        </p>
      </header>

      <MetaTracking clients={clients} />
    </div>
  );
}
