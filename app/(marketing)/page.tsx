import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const pillars = [
  {
    title: "See the day before it runs you",
    body: "Alerts, priorities, and client signals surface first — so the team opens one screen and knows what matters.",
  },
  {
    title: "Built for pockets of chaos",
    body: "Pipeline, retainers, standups, and client comms live in one rhythm instead of five tabs and a group chat.",
  },
  {
    title: "Feels good on a phone",
    body: "Check revenue health, nudge a follow-up, or log outreach between meetings without squinting at a spreadsheet.",
  },
];

const modules = [
  {
    name: "Dashboard",
    description:
      "Revenue pulse, client health, and the exceptions that need a human today — not buried three folders deep.",
  },
  {
    name: "Client Hub",
    description:
      "Every client story in one profile: money in, performance out, updates in flight, and what was said last.",
  },
  {
    name: "Sales Pipeline",
    description:
      "Leads, touches, sequences, and momentum — so outreach stays consistent when the week gets loud.",
  },
  {
    name: "Finance",
    description:
      "Payments, expenses, contractors, and projections with the context of who it belonged to and why.",
  },
  {
    name: "Operations",
    description:
      "Standups that stick, tasks anchored to clients, and weekly reporting that writes itself from real work.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight transition group-hover:text-violet-700 dark:group-hover:text-violet-300">
              elev8temedia
            </span>
            <span className="hidden text-xs font-medium text-zinc-400 sm:inline dark:text-zinc-500">
              E‑commerce growth
            </span>
          </Link>
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle compact />
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-600/20 transition hover:bg-violet-500 sm:px-4"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800">
          <div
            className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-35"
            aria-hidden
          >
            <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl dark:bg-violet-600/20" />
            <div className="absolute bottom-0 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-400/15 blur-3xl dark:bg-fuchsia-500/10" />
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/10 blur-3xl dark:bg-amber-500/5" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-800 dark:border-violet-500/30 dark:bg-violet-950/50 dark:text-violet-200">
              Meta · SMS · Site optimization
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.06] lg:text-[3.25rem]">
              The quiet command center for brands you scale.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg sm:leading-relaxed">
              elev8temedia helps e‑commerce teams turn paid social, SMS, and
              site optimization into repeatable growth. This workspace is where
              your pod plans the week, protects margin, and keeps every client
              story coherent — from first touch to finance.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500 hover:shadow-violet-600/40"
              >
                Start your workspace
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200/90 bg-white/90 px-6 py-3.5 text-sm font-semibold text-zinc-800 backdrop-blur-sm transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Sign in to elev8temedia
              </Link>
            </div>
            <p className="mt-5 max-w-xl text-xs leading-relaxed text-zinc-500 dark:text-zinc-500 sm:text-sm">
              No clutter. No “where did that number come from?” moments. Just a
              layout your team will actually open before coffee goes cold.
            </p>
          </div>
        </section>

        <section className="border-b border-zinc-200/70 bg-white py-14 dark:border-zinc-800 dark:bg-zinc-900/35">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-3 sm:gap-8 sm:px-6">
            {pillars.map((p) => (
              <div key={p.title} className="relative pl-4 sm:pl-5">
                <span
                  className="absolute left-0 top-1.5 h-[calc(100%-0.25rem)] w-0.5 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500 opacity-80"
                  aria-hidden
                />
                <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
              Inside the workspace
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Modules shaped like your week — not like generic software.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
              Each surface is designed to be edited in place, scanned in seconds,
              and expanded when you are ready for deeper reporting and
              automation.
            </p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, i) => (
              <li
                key={m.name}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition hover:border-violet-300/80 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-violet-500/25"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {m.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {m.description}
                </p>
                <span className="mt-4 text-xs font-medium text-violet-600 opacity-0 transition group-hover:opacity-100 dark:text-violet-400">
                  Explore in the live demo →
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="relative overflow-hidden border-t border-zinc-200/80 bg-gradient-to-br from-zinc-900 via-zinc-900 to-violet-950 py-16 text-white dark:border-zinc-800">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
          >
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />
          </div>
          <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Bring the team. We will meet you at clarity.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
                Whether you are protecting a handful of hero accounts or scaling
                a roster, this is the calm layer that keeps revenue, delivery,
                and sales honest with each other.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[200px]">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100"
              >
                Create an account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                I already have access
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/80 bg-zinc-50 py-8 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} elev8temedia. All rights reserved.</p>
          <p className="text-xs sm:text-sm">
            Meta Ads · SMS · Site optimization for modern commerce brands.
          </p>
        </div>
      </footer>
    </div>
  );
}
