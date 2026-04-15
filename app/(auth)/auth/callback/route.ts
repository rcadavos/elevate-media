import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { recordSuccessfulSignInForRequest } from "@/lib/auth/record-sign-in-event";
import { getPostSignInRedirectPath } from "@/lib/auth/post-sign-in-redirect";
import { readSupabasePublicEnv } from "@/lib/supabase/public-env";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");
  const origin = requestUrl.origin;

  const env = readSupabasePublicEnv();
  if (!code || !env) {
    return NextResponse.redirect(`${origin}/login?error=missing_config`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id && user.email) {
      await recordSuccessfulSignInForRequest(supabase, request, {
        userId: user.id,
        email: user.email,
        authFactor: "email_link",
      });
    }
    const path = await getPostSignInRedirectPath(supabase, nextParam);
    return NextResponse.redirect(`${origin}${path}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
