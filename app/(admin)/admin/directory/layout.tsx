export default function AdminDirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
