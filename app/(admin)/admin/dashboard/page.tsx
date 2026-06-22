import Link from "next/link";
import { AdminDashboardContent } from "@/components/admin/admin-dashboard-content";
import { getClients } from "@/lib/data/agency";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const clients = await getClients();

  return (
    <div>
      <AdminDashboardContent clients={clients} />

      <Card className="mt-12 max-w-full border-primary/20 bg-primary/5 shadow-sm">
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
