export type DashboardKpi = {
  id: string;
  label: string;
  value: string;
  hint: string;
  /** Shown next to the trending-up indicator (e.g. vs prior period). */
  trendPercent: string;
};

export type DashboardOperationalNotice = {
  id: string;
  kind: "critical" | "warning";
  title: string;
  description: string;
};

export type DashboardSalesActivity = {
  id: string;
  timeLabel: string;
  leadName: string;
  summary: string;
  outcome: "booked" | "follow_up" | "no_answer" | "lost";
};

/** Admin dashboard performance chart — one row per weekday (demo). */
export const ADMIN_PERFORMANCE_WEEKDAYS = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
] as const;

export type AdminPerformanceWeekday = (typeof ADMIN_PERFORMANCE_WEEKDAYS)[number];

export type AdminWeeklyPerformancePoint = {
  day: AdminPerformanceWeekday;
  /** Primary series (e.g. blended delivery score 0–300). */
  thisWeek: number;
  lastWeek: number;
};

/** Demo curves shaped like a “this week vs last week” comparison chart. */
export const adminWeeklyPerformanceDemo: AdminWeeklyPerformancePoint[] = [
  { day: "SUN", thisWeek: 52, lastWeek: 42 },
  { day: "MON", thisWeek: 218, lastWeek: 252 },
  { day: "TUE", thisWeek: 292, lastWeek: 92 },
  { day: "WED", thisWeek: 168, lastWeek: 78 },
  { day: "THU", thisWeek: 102, lastWeek: 58 },
  { day: "FRI", thisWeek: 282, lastWeek: 64 },
  { day: "SAT", thisWeek: 202, lastWeek: 186 },
];

export const dashboardKpis: DashboardKpi[] = [
  {
    id: "mrr",
    label: "Retainer MRR",
    value: "$48.2k",
    hint: "vs. last month — recurring revenue on track",
    trendPercent: "+6%",
  },
  {
    id: "clients",
    label: "Active clients",
    value: "14",
    hint: "2 in onboarding",
    trendPercent: "+8%",
  },
  {
    id: "delivery_health",
    label: "Delivery health score",
    value: "94%",
    hint: "On-time milestones across active retainers this quarter",
    trendPercent: "+3%",
  },
  {
    id: "pipeline",
    label: "Weighted pipeline",
    value: "$126k",
    hint: "Next 60 days",
    trendPercent: "+14%",
  },
];

export const dashboardOperationalNotices: DashboardOperationalNotice[] = [
  {
    id: "payment",
    kind: "critical",
    title: "Overdue payment",
    description:
      "Northwind Supply Co. — Invoice #1042 ($8,400) is 6 days past due. Pause new deliverables until finance clears.",
  },
  {
    id: "standup",
    kind: "warning",
    title: "Missed standup",
    description:
      "Ops standup for 2026-04-11 has no log entry from the assigned lead. Add notes in Operations before EOD.",
  },
];

export const dashboardSalesActivity: DashboardSalesActivity[] = [
  {
    id: "1",
    timeLabel: "9:14 AM",
    leadName: "Lumen Athletics",
    summary: "Discovery call — Meta + SMS scope",
    outcome: "follow_up",
  },
  {
    id: "2",
    timeLabel: "11:02 AM",
    leadName: "Harbor Home Goods",
    summary: "Follow-up email — sent revised proposal",
    outcome: "follow_up",
  },
  {
    id: "3",
    timeLabel: "1:40 PM",
    leadName: "Wildgrain Pantry",
    summary: "Outbound — booked strategy session Thu",
    outcome: "booked",
  },
  {
    id: "4",
    timeLabel: "3:55 PM",
    leadName: "Studio North",
    summary: "Cold DM sequence — reply, needs pricing",
    outcome: "follow_up",
  },
  {
    id: "5",
    timeLabel: "4:30 PM",
    leadName: "Cove Skincare",
    summary: "LinkedIn touch — no response yet",
    outcome: "no_answer",
  },
];

const outcomeLabels: Record<DashboardSalesActivity["outcome"], string> = {
  booked: "Booked",
  follow_up: "Follow up",
  no_answer: "No answer",
  lost: "Lost",
};

export function formatSalesOutcome(
  outcome: DashboardSalesActivity["outcome"],
): string {
  return outcomeLabels[outcome];
}
