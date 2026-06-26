/**
 * Types for the agency CRM data imported from the elev8temedia v7.6 prototype.
 * Mirrors the schema in `supabase/migrations/20260622120000_agency_crm.sql`.
 */

export type ClientService = "META" | "SMS";

export type ClientTheme = {
  bg: string;
  accent: string;
  initial: string;
};

export type AgencyClient = {
  id: string;
  name: string;
  status: string;
  service: ClientService;
  contact: string;
  email: string;
  channel: string;
  /** Percentage billing model. */
  profitMargin: number;
  feeOnRevenue: number;
  feeOnProfit: number;
  billingDay: number;
  targetRevenue: number;
  targetRoas: number;
  nextDropDate: string | null;
  nextDropName: string | null;
  nextDropTime: string | null;
  profileNote: string;
  notes: string;
  archived: boolean;
  logoUrl: string | null;
  theme: ClientTheme;
};

export type ClientWeeklyMetric = {
  id: string;
  clientId: string;
  /** ISO date (Monday week start). */
  weekStart: string;
  spend: number;
  revenue: number;
  launched: number;
  optimized: number;
  killed: number;
  notes: string;
};

export type FeedbackStatus = "Open" | "In Progress" | "Resolved";

export type ClientFeedback = {
  id: string;
  clientId: string;
  /** ISO date */
  date: string;
  summary: string;
  actionItems: string;
  status: FeedbackStatus;
  tag: string | null;
};

export type SopCategory = {
  id: string;
  name: string;
  emoji: string;
  bg: string;
  accent: string;
  initial: string;
};

export type SopStep = {
  id: string;
  /** Prototype step key, e.g. "s1". */
  key: string;
  body: string;
  checked: boolean;
  template: string | null;
};

export type Sop = {
  id: string;
  title: string;
  categoryId: string;
  steps: SopStep[];
};
