import { NextResponse } from "next/server";
import { assertCallerIsAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin-server";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/profile";

const BUCKET = "profile-assets";
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

function extFromFile(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) {
    return fromName;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const auth = await assertCallerIsAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const { userId } = await context.params;
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  const service = createServiceRoleClient();
  if (!service) {
    return NextResponse.json(
      {
        error:
          "Photo upload requires SUPABASE_SERVICE_ROLE_KEY on the server and a `profile-assets` storage bucket (see latest migration).",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data: row, error: readErr } = await supabase
    .from("profiles")
    .select("id,role")
    .eq("id", userId)
    .maybeSingle();

  if (readErr || !row) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const kindRaw = formData.get("kind");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (typeof kindRaw !== "string") {
    return NextResponse.json({ error: "Missing kind" }, { status: 400 });
  }

  const kind = kindRaw as "business_logo" | "avatar";
  if (kind !== "business_logo" && kind !== "avatar") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return NextResponse.json(
      { error: "Use JPEG, PNG, WebP, or GIF (max 2 MB)" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 2 MB or smaller" }, { status: 400 });
  }

  const ext = extFromFile(file);
  const objectPath = `${userId}/${kind}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await service.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  const { data: pub } = service.storage.from(BUCKET).getPublicUrl(objectPath);
  const publicUrl = pub.publicUrl;

  const column = kind === "business_logo" ? "business_logo_url" : "avatar_url";

  const { data: updated, error: updateErr } = await service
    .from("profiles")
    .update({
      [column]: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(
      "id,email,full_name,business_name,business_logo_url,avatar_url,role,created_at,date_joined,onboarding_sent_at,is_active",
    )
    .single();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: updateErr?.message ?? "Could not update profile" },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile: updated as ProfileRow });
}
