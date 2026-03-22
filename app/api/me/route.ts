import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null, subscription: null });
  }

  const [profileResult, subscriptionResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single(),
    supabase
      .from("subscriptions")
      .select(
        "plan, billing_interval, status, stripe_customer_id, current_period_end"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: profileResult.data?.role ?? "user",
    },
    subscription: subscriptionResult.data,
  });
}
