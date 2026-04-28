import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback handler.
 *
 * Supabase redirects here after a successful Google sign-in with a `code`
 * query param. We exchange that code for a session (cookies are set
 * automatically by the SSR client) and then bounce the user to their
 * intended destination — `next` if provided, otherwise `/dashboard`.
 *
 * If the exchange fails we send them to /login with an error code.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const errorParam = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const safeNext = next.startsWith("/") ? next : "/dashboard";

  if (errorParam) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", errorDescription ?? errorParam);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", "Missing authorization code");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
