import { NextResponse } from "next/server";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin-server";
import {
  isDirectoryRole,
  type DirectoryRole,
} from "@/lib/constants/directory-roles";

export async function POST(request: Request) {
  const auth = await assertCallerIsAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it to create users from Directory.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { email, password, full_name, role } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }
  if (typeof role !== "string" || !isDirectoryRole(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const fullName =
    typeof full_name === "string" && full_name.trim() ? full_name.trim() : "";

  const { data, error } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: role as DirectoryRole,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { error: profileErr } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      role: role as DirectoryRole,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileErr) {
    return NextResponse.json(
      { error: profileErr.message, user_id: data.user.id },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: data.user.id,
    email: data.user.email,
    role,
  });
}
