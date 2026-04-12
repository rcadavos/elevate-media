import Link from "next/link";

const cards = [
  {
    title: "Active clients",
    value: "—",
    hint: "Hook to Client Hub when ready",
  },
  {
    title: "Open alerts",
    value: "—",
    hint: "Payments, standups, outreach",
  },
  {
    title: "Pipeline touches (7d)",
    value: "—",
    hint: "Sales Pipeline activity",
  },
  {
    title: "Standups logged (week)",
    value: "—",
    hint: "Operations rhythm",
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <header className="max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Admin dashboard
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          High-level view for running elev8temedia. Numbers are placeholders until
          modules write real data.
        </p>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {c.title}
            </p>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {c.value}
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
              {c.hint}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-12 max-w-2xl rounded-2xl border border-violet-200/80 bg-violet-50/60 p-6 dark:border-violet-900/40 dark:bg-violet-950/30">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Directory
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Create and review users by role — admin, client, sales, finance, and
          operations — from the sidebar under Directory.
        </p>
        <Link
          href="/admin/directory/admin"
          className="mt-4 inline-flex rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          Open directory
        </Link>
      </section>
    </div>
  );
}
