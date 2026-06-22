import { NextResponse } from "next/server";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { mapClientRow, type ClientRow } from "@/lib/data/agency";

const ALLOWED_STATUS = ["Active", "Paused", "Inactive"];
const ALLOWED_SERVICE = ["META", "SMS"];

type PatchBody = Record<string, unknown>;

function asNumber(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  const auth = await assertCallerIsAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const { clientId } = await context.params;
  if (!clientId) {
    return NextResponse.json({ error: "Missing client id" }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.contact === "string") patch.contact = body.contact.trim();
  if (typeof body.email === "string") patch.email = body.email.trim();
  if (typeof body.profileNote === "string") patch.profile_note = body.profileNote;
  if (typeof body.notes === "string") patch.notes = body.notes;
  if (typeof body.status === "string" && ALLOWED_STATUS.includes(body.status)) {
    patch.status = body.status;
  }
  if (typeof body.service === "string" && ALLOWED_SERVICE.includes(body.service)) {
    patch.service = body.service;
  }

  const profitMargin = asNumber(body.profitMargin);
  if (profitMargin !== undefined) patch.profit_margin = profitMargin;
  const feeOnRevenue = asNumber(body.feeOnRevenue);
  if (feeOnRevenue !== undefined) patch.fee_on_revenue = feeOnRevenue;
  const feeOnProfit = asNumber(body.feeOnProfit);
  if (feeOnProfit !== undefined) patch.fee_on_profit = feeOnProfit;
  const billingDay = asNumber(body.billingDay);
  if (billingDay !== undefined) patch.billing_day = billingDay;
  const targetRevenue = asNumber(body.targetRevenue);
  if (targetRevenue !== undefined) patch.target_revenue = targetRevenue;
  const targetRoas = asNumber(body.targetRoas);
  if (targetRoas !== undefined) patch.target_roas = targetRoas;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No editable fields provided" },
      { status: 400 },
    );
  }
  patch.updated_at = new Date().toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .update(patch)
    .eq("id", clientId)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ client: mapClientRow(data as ClientRow) });
}
