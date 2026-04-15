import { NextResponse } from "next/server";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export async function GET(request: Request) {
  const auth = await assertCallerIsAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSizeRaw = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.isFinite(pageSizeRaw) ? pageSizeRaw : DEFAULT_PAGE_SIZE),
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("sign_in_events")
    .select(
      "id,occurred_at,user_id,user_email,ip_address,location,user_agent,auth_factor,success",
      { count: "exact" },
    )
    .order("occurred_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    entries: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  });
}
