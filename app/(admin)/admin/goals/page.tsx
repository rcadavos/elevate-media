import { GoalsBoard } from "@/components/agency/goals-board";
import { getClients } from "@/lib/data/agency";

export default async function AdminGoalsPage() {
  const clients = await getClients();

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Goals
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Goals
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Per-client monthly targets and next scale moves — where the strategy
          lives.
        </p>
      </header>

      <GoalsBoard clients={clients} />
    </div>
  );
}
