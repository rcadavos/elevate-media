export default function AdminDirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Directory
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Pick a user type in the sidebar, then add accounts or review who is
          already in each segment.
        </p>
      </header>
      <div className="mt-8">{children}</div>
    </div>
  );
}
