import { NextResponse } from "next/server";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import { getClients } from "@/lib/data/agency";

export async function GET() {
  const auth = await assertCallerIsAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const clients = await getClients();
  return NextResponse.json({ clients });
}
