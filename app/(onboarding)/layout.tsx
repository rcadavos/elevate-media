import type { ReactNode } from "react";

export default function OnboardingGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex flex-1 flex-col items-center px-4 py-10 md:py-16">
        <div className="w-full max-w-md flex-1">{children}</div>
      </div>
    </div>
  );
}
