"use client";

import * as React from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "elev8te_admin_dashboard_tip_dismissed_v1";

export function AdminDashboardDismissibleTip() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="relative mt-4 rounded-lg border border-primary/25 bg-primary/5 px-3 py-3 pr-11 text-sm text-foreground"
      role="region"
      aria-label="Admin tip"
    >
      <div className="flex gap-2">
        <Info
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          <p className="font-medium leading-snug">Directory & invites</p>
          <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
            Use the sidebar Directory links to review profiles, resend onboarding
            emails, and track pending client invites. Alerts above are static demo
            copy until Finance and Operations feeds are connected.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 size-8 shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss notification"
        onClick={dismiss}
      >
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
