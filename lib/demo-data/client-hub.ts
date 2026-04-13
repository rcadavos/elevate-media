/**
 * Demo fixtures for the client-facing Client Hub (per-brand / program view).
 * Replace with API + DB reads when wiring real client data.
 */

export type ClientHubSummary = {
  id: string;
  name: string;
  tagline: string;
  health: "strong" | "watch" | "at_risk";
  /** ISO date string */
  lastActivityDate: string;
};

export type RevenueSnapshot = {
  label: string;
  value: string;
  hint: string;
};

export type PaymentRow = {
  id: string;
  /** ISO date */
  date: string;
  description: string;
  amount: string;
  status: "paid" | "scheduled" | "overdue";
};

export type PerformanceMetric = {
  id: string;
  label: string;
  value: string;
  period: string;
  deltaLabel: string;
};

export type WeeklyUpdate = {
  id: string;
  /** e.g. "Week of Apr 7" */
  weekLabel: string;
  summary: string;
  highlights: string[];
};

export type CommunicationEntry = {
  id: string;
  /** ISO datetime */
  at: string;
  channel: "email" | "slack" | "call" | "sms";
  subject: string;
  excerpt: string;
};

export type ClientHubDetail = ClientHubSummary & {
  revenue: {
    snapshots: RevenueSnapshot[];
    footnote: string;
  };
  payments: {
    rows: PaymentRow[];
    nextInvoiceNote: string;
  };
  performance: {
    metrics: PerformanceMetric[];
    narrative: string;
  };
  weeklyUpdates: WeeklyUpdate[];
  communications: CommunicationEntry[];
};

const summaries: ClientHubSummary[] = [
  {
    id: "aurora-lane",
    name: "Aurora Lane Co.",
    tagline: "DTC apparel · Meta + SMS",
    health: "strong",
    lastActivityDate: "2026-04-11",
  },
  {
    id: "northwind-supply",
    name: "Northwind Supply",
    tagline: "B2B replenishment · site CRO",
    health: "watch",
    lastActivityDate: "2026-04-09",
  },
];

const detailsById: Record<string, ClientHubDetail> = {
  "aurora-lane": {
    ...summaries[0]!,
    revenue: {
      snapshots: [
        {
          label: "Retainer (this month)",
          value: "$12,500",
          hint: "On pace vs. contracted scope",
        },
        {
          label: "Attributed revenue (30d)",
          value: "$186k",
          hint: "Blended channel; directional only",
        },
        {
          label: "MER (30d)",
          value: "3.1",
          hint: "Above Q1 target band",
        },
      ],
      footnote:
        "Figures are illustrative for the demo. Your finance team reconciles invoices in the Finance module.",
    },
    payments: {
      rows: [
        {
          id: "inv-1040",
          date: "2026-04-01",
          description: "April retainer — Aurora Lane",
          amount: "$12,500",
          status: "paid",
        },
        {
          id: "inv-1055",
          date: "2026-04-28",
          description: "May retainer — scheduled draft",
          amount: "$12,500",
          status: "scheduled",
        },
      ],
      nextInvoiceNote:
        "Next retainer draft is scheduled for Apr 28. Reply to your AM if PO details changed.",
    },
    performance: {
      metrics: [
        {
          id: "roas",
          label: "Blended ROAS (7d)",
          value: "2.4×",
          period: "Last 7 days",
          deltaLabel: "+0.2 vs prior week",
        },
        {
          id: "sms",
          label: "SMS click rate",
          value: "11.2%",
          period: "Last send",
          deltaLabel: "Healthy vs. list baseline",
        },
        {
          id: "site",
          label: "Checkout completion",
          value: "54%",
          period: "Last 14 days",
          deltaLabel: "CRO sprint in progress",
        },
      ],
      narrative:
        "Spend is stable with a slight shift toward prospecting. Creative refresh for the hero bundle is testing ahead of the April promo window.",
    },
    weeklyUpdates: [
      {
        id: "wu-2026-04-07",
        weekLabel: "Week of Apr 7",
        summary:
          "Wrapped creative QA for the spring drop; SMS journey #2 went live with conservative caps.",
        highlights: [
          "Meta: new UGC set beating control on thumb-stop (+18%).",
          "Site: PDP load improved after image compression pass.",
          "Ops: weekly sync moved to Thursdays — calendar invite sent.",
        ],
      },
      {
        id: "wu-2026-03-31",
        weekLabel: "Week of Mar 31",
        summary:
          "Paused one underperforming ad set; reallocated budget to proven ASC+ shopping.",
        highlights: [
          "Finance: March retainer marked paid.",
          "Creative: shot list approved for April lifestyle assets.",
        ],
      },
    ],
    communications: [
      {
        id: "c-1",
        at: "2026-04-11T15:20:00.000Z",
        channel: "email",
        subject: "April pacing + promo calendar",
        excerpt:
          "Sharing the one-pager with pacing vs. targets and the proposed promo ladder for Apr 18–25.",
      },
      {
        id: "c-2",
        at: "2026-04-10T18:05:00.000Z",
        channel: "slack",
        subject: "#aurora-lane-delivery",
        excerpt:
          "Design approved the SMS hero swap — scheduled for Tuesday 10am ET send.",
      },
      {
        id: "c-3",
        at: "2026-04-08T14:00:00.000Z",
        channel: "call",
        subject: "Weekly strategy (30 min)",
        excerpt:
          "Agreed to hold prospecting budget flat until checkout fixes ship next sprint.",
      },
    ],
  },
  "northwind-supply": {
    ...summaries[1]!,
    revenue: {
      snapshots: [
        {
          label: "Retainer (this month)",
          value: "$8,400",
          hint: "Past due — see Payments",
        },
        {
          label: "Pipeline influenced (90d)",
          value: "$42k",
          hint: "Self-reported; not invoiced",
        },
        {
          label: "Site sessions",
          value: "28.4k",
          hint: "MoM +4%",
        },
      ],
      footnote:
        "Northwind is in a watch state until the open invoice is resolved. Demo copy only.",
    },
    payments: {
      rows: [
        {
          id: "inv-1042",
          date: "2026-03-22",
          description: "March retainer — Northwind",
          amount: "$8,400",
          status: "overdue",
        },
        {
          id: "inv-1058",
          date: "2026-04-22",
          description: "April retainer — draft",
          amount: "$8,400",
          status: "scheduled",
        },
      ],
      nextInvoiceNote:
        "Finance has paused new deliverables until March retainer is cleared. Contact your AM for a payment plan.",
    },
    performance: {
      metrics: [
        {
          id: "leads",
          label: "Qualified form fills",
          value: "62",
          period: "Last 30 days",
          deltaLabel: "−8 vs prior 30d",
        },
        {
          id: "cpc",
          label: "Search CPC",
          value: "$2.10",
          period: "Last 14 days",
          deltaLabel: "Stable",
        },
        {
          id: "lp",
          label: "LP bounce rate",
          value: "61%",
          period: "Last 14 days",
          deltaLabel: "CRO test queued",
        },
      ],
      narrative:
        "Lead volume softened after the industry event cycle. We are staging a landing refresh and tightening geo bids on high-intent terms.",
    },
    weeklyUpdates: [
      {
        id: "wu-nw-2026-04-07",
        weekLabel: "Week of Apr 7",
        summary:
          "Documented the checkout friction points from Hotjar; kickoff with dev scheduled.",
        highlights: [
          "Paid search: negative keyword pass reduced wasted spend ~9%.",
          "Content: one-pager download funnel A/B live.",
        ],
      },
    ],
    communications: [
      {
        id: "c-nw-1",
        at: "2026-04-09T11:00:00.000Z",
        channel: "email",
        subject: "Invoice #1042 — reminder",
        excerpt:
          "Friendly reminder: March retainer is outstanding. Let us know if AP needs updated banking details.",
      },
      {
        id: "c-nw-2",
        at: "2026-04-08T16:40:00.000Z",
        channel: "call",
        subject: "Finance + delivery sync",
        excerpt:
          "Aligned on pausing net-new creative until payment status is green.",
      },
    ],
  },
};

export function getClientHubSummaries(): ClientHubSummary[] {
  return [...summaries];
}

export function getClientHubDetail(clientId: string): ClientHubDetail | undefined {
  return detailsById[clientId];
}

export function clientHubDetailIds(): string[] {
  return Object.keys(detailsById);
}
