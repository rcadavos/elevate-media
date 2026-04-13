import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  brandPlacement?: "inside-card" | "outside-card";
  showBackToHome?: boolean;
  edgeThemeToggle?: boolean;
  centerHeaderText?: boolean;
  compactSubtitleTopSpacing?: boolean;
};

export function AuthShell({
  title,
  subtitle,
  children,
  brandPlacement = "inside-card",
  showBackToHome = true,
  edgeThemeToggle = false,
  centerHeaderText = false,
  compactSubtitleTopSpacing = false,
}: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-muted/30 px-4 py-4 sm:px-6 sm:py-8">
      {edgeThemeToggle ? (
        <div className="mb-8 flex w-full justify-end">
          <ThemeToggle />
        </div>
      ) : null}
      <div className="mx-auto w-full max-w-md">
        {showBackToHome || !edgeThemeToggle ? (
          <div className="mb-8 flex items-center justify-between gap-4">
            {showBackToHome ? (
              <Button
                render={<Link href="/landing" />}
                nativeButton={false}
                variant="ghost"
                className="h-auto px-0 text-muted-foreground hover:text-foreground"
              >
                ← Back to home
              </Button>
            ) : (
              <span />
            )}
            {!edgeThemeToggle ? <ThemeToggle /> : null}
          </div>
        ) : null}
        {brandPlacement === "outside-card" ? (
          <p className="mb-4 text-center text-2xl font-semibold tracking-wide text-primary sm:text-3xl">
            elev8temedia
          </p>
        ) : null}
        <Card className="rounded-xl shadow-sm ring-border">
          <CardHeader
            className={cn(
              "border-b border-border pb-6",
              centerHeaderText && "text-center",
            )}
          >
            {brandPlacement === "inside-card" ? (
              <p className="text-xs font-semibold tracking-widest text-primary">
                elev8temedia
              </p>
            ) : null}
            <CardTitle className="mt-2 text-2xl">{title}</CardTitle>
            <CardDescription
              className={cn(
                compactSubtitleTopSpacing ? "mt-1" : "mt-2",
                "text-base leading-relaxed",
              )}
            >
              {subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-2">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
