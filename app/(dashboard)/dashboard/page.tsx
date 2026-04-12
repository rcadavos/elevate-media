import { Suspense } from "react";
import { DashboardPage } from "@/components/dashboard/dashboard-page";

export default function DashboardRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        </div>
      }
    >
      <DashboardPage />
    </Suspense>
  );
}
