import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/admin/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950 md:flex-row">
      <aside className="shrink-0 border-b border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <AdminSidebar />
      </aside>
      <main className="min-h-0 min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
