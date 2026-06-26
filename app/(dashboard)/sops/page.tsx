import type { Metadata } from "next";
import { SopsView } from "@/components/agency/sops-view";
import { getSopCategories, getSops } from "@/lib/data/agency";

export const metadata: Metadata = {
  title: "Playbooks · Agency OS",
  robots: { index: false, follow: false },
};

export default async function SopsPage() {
  const [sops, categories] = await Promise.all([getSops(), getSopCategories()]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Operations
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Playbooks &amp; SOPs
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Step-by-step playbooks for onboarding, calls, and drop days — with the
          exact message templates the team sends. Check off steps as you run them
          and copy templates straight into WhatsApp or email.
        </p>
      </header>

      <SopsView sops={sops} categories={categories} />
    </div>
  );
}
