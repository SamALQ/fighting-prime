/**
 * One-off migration script: import Memberstack users into Supabase auth + profiles
 * and map active paid subscribers into the subscriptions table.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/migrate-memberstack-users.ts \
 *     /path/to/member-export.csv /path/to/member-plans-export.csv
 *
 * Idempotent: skips users that already exist by email.
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const [, , MEMBERS_CSV, PLANS_CSV] = process.argv;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!STRIPE_SECRET_KEY) {
  console.error("Missing env: STRIPE_SECRET_KEY (needed to look up active Stripe subscriptions)");
  process.exit(1);
}
if (!MEMBERS_CSV || !PLANS_CSV) {
  console.error(
    "Usage: tsx scripts/migrate-memberstack-users.ts <members.csv> <plans.csv>"
  );
  process.exit(1);
}

/** Live Stripe price IDs — duplicated from lib/stripe/config.ts to keep this script self-contained */
const LIVE_PRICES = {
  athletePro: {
    monthly: "price_1RTE0N044DGFCmBE7TaZb6zK",
    yearly: "price_1RTE1J044DGFCmBEx2kauwbp",
  },
  fighterElite: {
    monthly: "price_1RTE96044DGFCmBEE0xQhdDS",
    yearly: "price_1RTEA9044DGFCmBEaSlVp09W",
  },
} as const;

/** Minimal CSV parser supporting quoted fields with embedded commas. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (ch === "\r") {
        // skip
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.length > 0));
}

interface Member {
  memberId: string;
  email: string;
  createdAt: string;
  verified: boolean;
  stripeCustomerId: string | null;
  firstName: string;
  lastName: string;
}

interface Plan {
  memberId: string;
  stripeSubscriptionId: string | null;
  status: string;
  planType: string;
}

function parseMembers(text: string): Member[] {
  const rows = parseCsv(text);
  const [, ...data] = rows;
  return data
    .map((r) => ({
      memberId: (r[0] ?? "").trim(),
      email: (r[1] ?? "").trim().toLowerCase(),
      createdAt: (r[2] ?? "").trim(),
      verified: (r[3] ?? "").trim() === "true",
      stripeCustomerId: (r[4] ?? "").trim() || null,
      firstName: (r[9] ?? "").trim(),
      lastName: (r[10] ?? "").trim(),
    }))
    .filter((m) => m.email && m.memberId);
}

function parsePlans(text: string): Plan[] {
  const rows = parseCsv(text);
  const [, ...data] = rows;
  return data
    .map((r) => ({
      memberId: (r[0] ?? "").trim(),
      stripeSubscriptionId: (r[1] ?? "").trim() || null,
      status: (r[4] ?? "").trim(),
      planType: (r[5] ?? "").trim(),
    }))
    .filter((p) => p.memberId);
}

function planFromPriceId(priceId: string): "athlete_pro" | "fighter_elite" | null {
  if (
    priceId === LIVE_PRICES.athletePro.monthly ||
    priceId === LIVE_PRICES.athletePro.yearly
  )
    return "athlete_pro";
  if (
    priceId === LIVE_PRICES.fighterElite.monthly ||
    priceId === LIVE_PRICES.fighterElite.yearly
  )
    return "fighter_elite";
  return null;
}

async function main() {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const stripe = new Stripe(STRIPE_SECRET_KEY!);

  const membersText = readFileSync(MEMBERS_CSV!, "utf8");
  const plansText = readFileSync(PLANS_CSV!, "utf8");
  const members = parseMembers(membersText);
  const plans = parsePlans(plansText);

  const plansByMember = new Map<string, Plan[]>();
  for (const p of plans) {
    const arr = plansByMember.get(p.memberId) ?? [];
    arr.push(p);
    plansByMember.set(p.memberId, arr);
  }

  console.log(`Loaded ${members.length} members and ${plans.length} plan rows.`);

  // Fetch existing auth users once to short-circuit duplicates.
  const { data: existingPage, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    console.error("Failed to list existing users:", listErr.message);
    process.exit(1);
  }
  const existingByEmail = new Map<string, string>();
  for (const u of existingPage.users) {
    if (u.email) existingByEmail.set(u.email.toLowerCase(), u.id);
  }
  console.log(`Found ${existingByEmail.size} existing auth users (will skip).`);

  let created = 0;
  let skipped = 0;
  let failed = 0;
  let subsCreated = 0;
  const failures: { email: string; reason: string }[] = [];

  for (const m of members) {
    const fullName = `${m.firstName} ${m.lastName}`.trim() || null;
    let userId = existingByEmail.get(m.email);

    if (userId) {
      console.log(`SKIP  ${m.email} (exists)`);
      skipped++;
    } else {
      const tempPassword = randomUUID() + randomUUID();
      const { data: createdData, error: createErr } =
        await supabase.auth.admin.createUser({
          email: m.email,
          password: tempPassword,
          email_confirm: m.verified,
          user_metadata: {
            full_name: fullName,
            memberstack_id: m.memberId,
            memberstack_created_at: m.createdAt,
            migrated_from: "memberstack",
          },
        });
      if (createErr || !createdData.user) {
        console.error(`FAIL  ${m.email}: ${createErr?.message ?? "unknown"}`);
        failures.push({ email: m.email, reason: createErr?.message ?? "unknown" });
        failed++;
        continue;
      }
      userId = createdData.user.id;
      console.log(
        `CREATE ${m.email}  ${userId}  confirmed=${m.verified ? "yes" : "no"}`
      );
      created++;

      const { error: profErr } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email: m.email,
          full_name: fullName,
        },
        { onConflict: "id" }
      );
      if (profErr) {
        console.warn(`  profile upsert failed: ${profErr.message}`);
      }
    }

    // Map active paid subscriptions
    const memberPlans = plansByMember.get(m.memberId) ?? [];
    const activeSub = memberPlans.find(
      (p) =>
        p.status === "ACTIVE" &&
        p.planType === "SUBSCRIPTION" &&
        p.stripeSubscriptionId
    );
    if (!activeSub || !m.stripeCustomerId) continue;

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existingSub) {
      console.log(`  sub already exists, skipping`);
      continue;
    }

    let stripeSub: Stripe.Subscription;
    try {
      stripeSub = await stripe.subscriptions.retrieve(activeSub.stripeSubscriptionId!);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.warn(`  stripe lookup failed (${activeSub.stripeSubscriptionId}): ${msg}`);
      continue;
    }
    if (stripeSub.status !== "active" && stripeSub.status !== "trialing") {
      console.log(`  stripe sub status=${stripeSub.status}, skipping`);
      continue;
    }

    const item = stripeSub.items.data[0];
    const priceId = item.price.id;
    const plan = planFromPriceId(priceId);
    if (!plan) {
      console.warn(`  unknown price ${priceId} on sub ${stripeSub.id}, skipping`);
      continue;
    }
    const interval = item.price.recurring?.interval;
    const billingInterval =
      interval === "year" ? "yearly" : interval === "month" ? "monthly" : null;

    const { error: subErr } = await supabase.from("subscriptions").insert({
      user_id: userId,
      stripe_customer_id: stripeSub.customer as string,
      stripe_subscription_id: stripeSub.id,
      stripe_price_id: priceId,
      plan,
      status: stripeSub.status,
      billing_interval: billingInterval,
      current_period_start: item.current_period_start
        ? new Date(item.current_period_start * 1000).toISOString()
        : null,
      current_period_end: item.current_period_end
        ? new Date(item.current_period_end * 1000).toISOString()
        : null,
    });
    if (subErr) {
      console.warn(`  sub insert failed: ${subErr.message}`);
    } else {
      console.log(
        `  + subscription ${stripeSub.id} (${plan} ${billingInterval ?? "?"})`
      );
      subsCreated++;
    }

    // Tag the Stripe customer with our supabase_user_id metadata for clean linkage.
    try {
      await stripe.customers.update(stripeSub.customer as string, {
        metadata: { supabase_user_id: userId },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.warn(`  stripe customer metadata update failed: ${msg}`);
    }
  }

  console.log("");
  console.log(
    `Done. created=${created} skipped=${skipped} failed=${failed} subs=${subsCreated}`
  );
  if (failures.length > 0) {
    console.log("Failures:");
    for (const f of failures) console.log(`  ${f.email}: ${f.reason}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
