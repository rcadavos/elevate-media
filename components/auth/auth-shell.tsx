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

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-muted/30 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="ghost"
            className="h-auto px-0 text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </Button>
          <ThemeToggle />
        </div>
        <Card className="shadow-sm ring-border">
          <CardHeader className="border-b border-border pb-6">
            <p className="text-xs font-semibold tracking-widest text-primary">
              elev8temedia
            </p>
            <CardTitle className="mt-2 text-2xl">{title}</CardTitle>
            <CardDescription className="mt-2 text-base leading-relaxed">
              {subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
