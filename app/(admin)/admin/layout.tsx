import { AdminChromeBrand } from "@/components/admin/admin-chrome-brand";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopNavbar } from "@/components/admin/admin-top-navbar";
import { ResponsiveAppSidebar } from "@/components/layout/responsive-app-sidebar";
import { requireAdmin } from "@/lib/admin/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-muted/15">
      {/* One border under brand + navbar (desktop only) */}
      <div className="hidden w-full shrink-0 items-stretch border-b border-border bg-card md:flex">
        <div className="flex w-60 shrink-0 items-stretch border-r border-border bg-card">
          <AdminChromeBrand />
        </div>
        <div className="min-w-0 flex-1 bg-background">
          <AdminTopNavbar showBottomBorder={false} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <ResponsiveAppSidebar>
          <AdminSidebar email={session.email} fullName={session.fullName} />
        </ResponsiveAppSidebar>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
          <AdminTopNavbar className="shrink-0 md:hidden" />
          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto w-full min-h-full max-w-6xl md:min-h-[calc(100dvh-8.5rem)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
