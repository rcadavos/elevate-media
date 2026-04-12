import type { ProfileRow } from "@/lib/types/profile";

type DirectoryTableProps = {
  rows: ProfileRow[];
};

export function DirectoryTable({ rows }: DirectoryTableProps) {
  if (rows.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 px-4 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400">
        No users in this segment yet. Create the first account above.
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Added</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="text-zinc-800 dark:text-zinc-200 [&>td]:px-4 [&>td]:py-3"
            >
              <td className="font-medium">
                {row.full_name?.trim() ? row.full_name : "—"}
              </td>
              <td className="text-zinc-600 dark:text-zinc-400">
                {row.email ?? "—"}
              </td>
              <td className="whitespace-nowrap text-zinc-500 dark:text-zinc-500">
                {new Date(row.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
