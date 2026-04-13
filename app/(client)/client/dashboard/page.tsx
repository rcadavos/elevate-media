import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientPortalHome } from "@/components/client-hub/client-portal-home";

export const metadata: Metadata = {
  title: "Client overview",
  robots: { index: false, follow: false },
};

export default function ClientDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-col justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ClientPortalHome />
    </Suspense>
  );
}
