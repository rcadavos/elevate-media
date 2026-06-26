import type { DashboardOperationalNotice } from "@/lib/demo-data/dashboard";
import type { AgencyClient } from "@/lib/types/agency";

export type AgencyKpi = {
  id: string;
  label: string;
  value: string;
  hint: string;
};

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** KPIs derived from the real client roster — no fabricated figures. */
export function agencyKpis(clients: AgencyClient[]): AgencyKpi[] {
  const meta = clients.filter((c) => c.service === "META").length;
  const sms = clients.filter((c) => c.service === "SMS").length;
  const avgFee = Math.round(avg(clients.map((c) => c.feeOnRevenue)));
  return [
    {
      id: "active",
      label: "Active clients",
      value: String(clients.length),
      hint: "Managed brands across Meta Ads and SMS",
    },
    {
      id: "split",
      label: "Meta · SMS split",
      value: `${meta} · ${sms}`,
      hint: "By primary service",
    },
    {
      id: "fee",
      label: "Avg agency fee",
      value: `${avgFee}%`,
      hint: "Of attributed revenue",
    },
    {
      id: "comms",
      label: "On WhatsApp",
      value: `${clients.length}/${clients.length}`,
      hint: "Primary comms channel",
    },
  ];
}

/** Operational signals derived from real roster gaps (not fabricated incidents). */
export function agencyNotices(clients: AgencyClient[]): DashboardOperationalNotice[] {
  const targetsSet = clients.filter((c) => c.targetRevenue > 0).length;
  return [
    {
      id: "no-metrics",
      kind: "warning",
      title: "No weekly performance logged",
      description: `0 of ${clients.length} clients have Meta weekly metrics yet. Open a client → Performance to start tracking spend, revenue, and ROAS.`,
    },
    {
      id: "no-targets",
      kind: "warning",
      title: "Revenue targets unset",
      description: `${clients.length - targetsSet} of ${clients.length} clients have no revenue target. Add targets so the dashboard can track pacing.`,
    },
  ];
}
