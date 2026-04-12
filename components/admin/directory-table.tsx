import type { ProfileRow } from "@/lib/types/profile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DirectoryTableProps = {
  rows: ProfileRow[];
};

export function DirectoryTable({ rows }: DirectoryTableProps) {
  if (rows.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground">
        No users in this segment yet. Create the first account above.
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                {row.full_name?.trim() ? row.full_name : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.email ?? "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {new Date(row.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
