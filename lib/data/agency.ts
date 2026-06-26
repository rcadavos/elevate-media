/**
 * Server-side accessors for agency CRM data. Reads from Supabase when the
 * tables exist and the request is authenticated; otherwise falls back to the
 * imported seed fixtures in `lib/demo-data/agency.ts` so the UI always renders
 * (e.g. before the migration is applied, or for an unauthenticated demo view).
 */

import { createClient } from "@/lib/supabase/server";
import {
  agencyClients,
  clientFeedback as demoFeedback,
  clientWeeklyMetrics as demoMetrics,
  sopCategories as demoSopCategories,
  sops as demoSops,
} from "@/lib/demo-data/agency";
import type {
  AgencyClient,
  ClientFeedback,
  ClientService,
  ClientWeeklyMetric,
  FeedbackStatus,
  Sop,
  SopCategory,
} from "@/lib/types/agency";

export type ClientRow = {
  id: string;
  name: string;
  status: string;
  service: string;
  contact: string | null;
  email: string | null;
  channel: string | null;
  profit_margin: number;
  fee_on_revenue: number;
  fee_on_profit: number;
  billing_day: number;
  target_revenue: number;
  target_roas: number;
  next_drop_date: string | null;
  next_drop_name: string | null;
  next_drop_time: string | null;
  profile_note: string | null;
  notes: string | null;
  archived: boolean;
  logo_url: string | null;
  theme_bg: string | null;
  theme_accent: string | null;
  theme_initial: string | null;
};

export function mapClientRow(row: ClientRow): AgencyClient {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    service: (row.service === "SMS" ? "SMS" : "META") as ClientService,
    contact: row.contact ?? "",
    email: row.email ?? "",
    channel: row.channel ?? "WhatsApp",
    profitMargin: row.profit_margin,
    feeOnRevenue: row.fee_on_revenue,
    feeOnProfit: row.fee_on_profit,
    billingDay: row.billing_day,
    targetRevenue: Number(row.target_revenue),
    targetRoas: Number(row.target_roas),
    nextDropDate: row.next_drop_date,
    nextDropName: row.next_drop_name,
    nextDropTime: row.next_drop_time,
    profileNote: row.profile_note ?? "",
    notes: row.notes ?? "",
    archived: row.archived,
    logoUrl: row.logo_url,
    theme: {
      bg: row.theme_bg ?? "#F4F4F5",
      accent: row.theme_accent ?? "#3F3F46",
      initial: row.theme_initial ?? "#E4E4E7",
    },
  };
}

export async function getClients(): Promise<AgencyClient[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("archived", false)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) {
      return agencyClients;
    }
    return (data as ClientRow[]).map(mapClientRow);
  } catch {
    return agencyClients;
  }
}

export async function getClientById(
  id: string,
): Promise<AgencyClient | undefined> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      return agencyClients.find((c) => c.id === id);
    }
    return mapClientRow(data as ClientRow);
  } catch {
    return agencyClients.find((c) => c.id === id);
  }
}

type SopRow = { id: string; title: string; category_id: string | null };
type SopStepRow = {
  sop_id: string;
  step_key: string;
  position: number;
  body: string;
  checked: boolean;
  template: string | null;
};
type SopCategoryRow = {
  id: string;
  name: string;
  emoji: string | null;
  bg: string | null;
  accent: string | null;
  initial: string | null;
};

export async function getSopCategories(): Promise<SopCategory[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sop_categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) {
      return demoSopCategories;
    }
    return (data as SopCategoryRow[]).map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji ?? "📄",
      bg: c.bg ?? "#F4F4F5",
      accent: c.accent ?? "#3F3F46",
      initial: c.initial ?? "#E4E4E7",
    }));
  } catch {
    return demoSopCategories;
  }
}

export async function getSops(): Promise<Sop[]> {
  try {
    const supabase = await createClient();
    const [{ data: sopRows, error: sopErr }, { data: stepRows, error: stepErr }] =
      await Promise.all([
        supabase.from("sops").select("*").order("sort_order", { ascending: true }),
        supabase
          .from("sop_steps")
          .select("*")
          .order("position", { ascending: true }),
      ]);
    if (sopErr || stepErr || !sopRows || sopRows.length === 0) {
      return demoSops;
    }
    const steps = (stepRows ?? []) as SopStepRow[];
    return (sopRows as SopRow[]).map((s) => ({
      id: s.id,
      title: s.title,
      categoryId: s.category_id ?? "",
      steps: steps
        .filter((st) => st.sop_id === s.id)
        .map((st) => ({
          id: `${st.sop_id}-${st.step_key}`,
          key: st.step_key,
          body: st.body,
          checked: st.checked,
          template: st.template,
        })),
    }));
  } catch {
    return demoSops;
  }
}

export async function getClientWeeklyMetrics(
  clientId: string,
): Promise<ClientWeeklyMetric[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("client_weekly_metrics")
      .select("*")
      .eq("client_id", clientId)
      .order("week_start", { ascending: false });
    if (error || !data) {
      return demoMetrics.filter((m) => m.clientId === clientId);
    }
    return data.map((m) => ({
      id: m.id as string,
      clientId: m.client_id as string,
      weekStart: m.week_start as string,
      spend: Number(m.spend),
      revenue: Number(m.revenue),
      launched: m.launched as number,
      optimized: m.optimized as number,
      killed: m.killed as number,
      notes: (m.notes as string) ?? "",
    }));
  } catch {
    return demoMetrics.filter((m) => m.clientId === clientId);
  }
}

export async function getClientFeedback(
  clientId: string,
): Promise<ClientFeedback[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("client_feedback")
      .select("*")
      .eq("client_id", clientId)
      .order("feedback_date", { ascending: false });
    if (error || !data) {
      return demoFeedback.filter((f) => f.clientId === clientId);
    }
    return data.map((f) => ({
      id: f.id as string,
      clientId: f.client_id as string,
      date: f.feedback_date as string,
      summary: f.summary as string,
      actionItems: (f.action_items as string) ?? "",
      status: f.status as FeedbackStatus,
      tag: (f.tag as string) ?? null,
    }));
  } catch {
    return demoFeedback.filter((f) => f.clientId === clientId);
  }
}
