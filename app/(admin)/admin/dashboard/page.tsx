import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Admin dashboard
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          High-level view for running elev8temedia. Numbers are placeholders until
          modules write real data.
        </p>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title} size="sm" className="shadow-sm">
            <CardHeader className="pb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {c.title}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-semibold tabular-nums text-foreground">
                {c.value}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{c.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="mt-12 max-w-2xl border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Directory</CardTitle>
          <CardDescription>
            Create and review users by role — admin, client, sales, finance, and
            operations — from the sidebar under Directory.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button render={<Link href="/admin/directory/admin" />} nativeButton={false}>
            Open directory
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
