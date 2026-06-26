import { ClientRoster } from "@/components/agency/client-roster";
import { getClients } from "@/lib/data/agency";

export default async function AdminClientsPage() {
  const clients = await getClients();

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Client Hub
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Clients
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Master roster — {clients.length} brands across Meta Ads and SMS, with
          billing model and break-even targets.
        </p>
      </header>

      <ClientRoster clients={clients} basePath="/admin/clients" editable />
    </div>
  );
}
