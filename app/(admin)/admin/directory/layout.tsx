export default function AdminDirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Directory
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Pick a user type in the sidebar, then add accounts or review who is
          already in each segment.
        </p>
      </header>
      <div className="mt-8">{children}</div>
    </div>
  );
}
