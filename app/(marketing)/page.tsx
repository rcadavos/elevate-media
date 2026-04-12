import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight transition group-hover:text-violet-700 dark:group-hover:text-violet-300">
              elev8temedia
            </span>
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              E‑commerce growth
            </span>
          </Link>
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle compact />
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              Sign in
            </Button>
            <Button
              render={<Link href="/signup" />}
              nativeButton={false}
              size="sm"
              className="sm:px-4"
            >
              Get started
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
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
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed">
              elev8temedia helps e‑commerce teams turn paid social, SMS, and
              site optimization into repeatable growth. This workspace is where
              your pod plans the week, protects margin, and keeps every client
              story coherent — from first touch to finance.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                render={<Link href="/signup" />}
                nativeButton={false}
                size="lg"
                className="rounded-xl px-6 py-3.5 text-sm shadow-lg"
              >
                Start your workspace
              </Button>
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                variant="outline"
                size="lg"
                className="rounded-xl border-border bg-card/90 px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm hover:bg-card"
              >
                Sign in to elev8temedia
              </Button>
            </div>
            <p className="mt-5 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              No clutter. No “where did that number come from?” moments. Just a
              layout your team will actually open before coffee goes cold.
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-muted/30 py-14">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-3 sm:gap-8 sm:px-6">
            {pillars.map((p) => (
              <div key={p.title} className="relative pl-4 sm:pl-5">
                <span
                  className="absolute left-0 top-1.5 h-[calc(100%-0.25rem)] w-0.5 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500 opacity-80"
                  aria-hidden
                />
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Each surface is designed to be edited in place, scanned in seconds,
              and expanded when you are ready for deeper reporting and
              automation.
            </p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, i) => (
              <li
                key={m.name}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-base font-semibold text-foreground">
                  {m.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {m.description}
                </p>
                <span className="mt-4 text-xs font-medium text-violet-600 opacity-0 transition group-hover:opacity-100 dark:text-violet-400">
                  Explore in the live demo →
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="relative overflow-hidden border-t border-border bg-gradient-to-br from-zinc-900 via-zinc-900 to-violet-950 py-16 text-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950">
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
              <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                Whether you are protecting a handful of hero accounts or scaling
                a roster, this is the calm layer that keeps revenue, delivery,
                and sales honest with each other.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[200px]">
              <Button
                render={<Link href="/signup" />}
                nativeButton={false}
                size="lg"
                className="rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg hover:bg-zinc-100"
              >
                Create an account
              </Button>
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                variant="outline"
                size="lg"
                className="rounded-xl border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10"
              >
                I already have access
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/30 py-8 text-sm text-muted-foreground">
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
