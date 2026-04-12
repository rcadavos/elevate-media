import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/admin/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-full flex-col bg-muted/15 md:flex-row">
      <aside className="flex min-h-0 shrink-0 flex-col border-b border-border bg-card p-4 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <AdminSidebar email={session.email} fullName={session.fullName} />
      </aside>
      <main className="min-h-0 min-w-0 flex-1 bg-background p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
