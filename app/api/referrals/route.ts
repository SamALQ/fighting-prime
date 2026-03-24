import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateCode(): string {
  return "FP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ referrals: [], code: null });

  let { data: existing } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", user.id)
    .is("referred_id", null)
    .limit(1);

  let code: string;
  if (existing && existing.length > 0) {
    code = existing[0].code;
  } else {
    code = generateCode();
    await supabase.from("referrals").insert({
      referrer_id: user.id,
      code,
    });
  }

  const { data: allReferrals } = await supabase
    .from("referrals")
    .select("id, code, referred_id, bonus_awarded, created_at")
    .eq("referrer_id", user.id)
    .not("referred_id", "is", null);

  return NextResponse.json({
    code,
    referrals: allReferrals ?? [],
    totalReferred: (allReferrals ?? []).length,
    bonusEarned: (allReferrals ?? []).filter((r) => r.bonus_awarded).length * 500,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const { data: referral } = await supabase
    .from("referrals")
    .select("*")
    .eq("code", code)
    .is("referred_id", null)
    .single();

  if (!referral) return NextResponse.json({ error: "Invalid or used code" }, { status: 400 });
  if (referral.referrer_id === user.id) return NextResponse.json({ error: "Cannot use own code" }, { status: 400 });

  await supabase
    .from("referrals")
    .update({ referred_id: user.id, bonus_awarded: true })
    .eq("id", referral.id);

  await supabase.from("referrals").insert({
    referrer_id: referral.referrer_id,
    code: generateCode(),
  });

  return NextResponse.json({ success: true, bonusPoints: 500 });
}
