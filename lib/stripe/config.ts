// Test mode price IDs (used with sk_test_ keys — kept for local dev rollback)
const TEST_PRICES = {
  athletePro: {
    monthly: "price_1TDdgs044DGFCmBE8bHBVMAG",
    yearly: "price_1TDdgu044DGFCmBEuLO68iVK",
  },
  fighterElite: {
    monthly: "price_1TDdgw044DGFCmBEYAuD7NA0",
    yearly: "price_1TDdgy044DGFCmBEc6P1M91J",
  },
} as const;

const TEST_PRODUCTS = {
  athletePro: "prod_UC1kzTHdZN5dtJ",
  fighterElite: "prod_UC1key814j5yW8",
} as const;

// Live mode price IDs (verified against Stripe live dashboard 2026-04-28)
// ATHLETE PRO: $20/mo, $120/yr
// FIGHTER ELITE +: $50/mo, $450/yr
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

const LIVE_PRODUCTS = {
  athletePro: "prod_SO00Qj7Q3bkT7d",
  fighterElite: "prod_SO09Z0C2JLNvbU",
} as const;

// Use the publishable key (NEXT_PUBLIC_*) to gate test vs live so the same value
// is selected in both server and client bundles. The secret key is server-only
// and would resolve to "" in the browser, causing client/server price mismatches.
const USE_LIVE = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "").startsWith(
  "pk_live_"
);

export const STRIPE_PRICES = USE_LIVE ? LIVE_PRICES : TEST_PRICES;
export const STRIPE_PRODUCTS = USE_LIVE ? LIVE_PRODUCTS : TEST_PRODUCTS;

// Suppress unused-var warnings when only one set is selected at runtime.
void TEST_PRICES;
void TEST_PRODUCTS;
void LIVE_PRICES;
void LIVE_PRODUCTS;

export type PlanTier = "athlete_pro" | "fighter_elite";
export type BillingInterval = "monthly" | "yearly";

export function getPriceId(tier: PlanTier, interval: BillingInterval): string {
  if (tier === "athlete_pro") return STRIPE_PRICES.athletePro[interval];
  return STRIPE_PRICES.fighterElite[interval];
}

export function getPlanFromPriceId(priceId: string): { tier: PlanTier; interval: BillingInterval } | null {
  if (priceId === STRIPE_PRICES.athletePro.monthly) return { tier: "athlete_pro", interval: "monthly" };
  if (priceId === STRIPE_PRICES.athletePro.yearly) return { tier: "athlete_pro", interval: "yearly" };
  if (priceId === STRIPE_PRICES.fighterElite.monthly) return { tier: "fighter_elite", interval: "monthly" };
  if (priceId === STRIPE_PRICES.fighterElite.yearly) return { tier: "fighter_elite", interval: "yearly" };
  return null;
}

export function getPlanFromProductId(productId: string): PlanTier | null {
  if (productId === STRIPE_PRODUCTS.athletePro) return "athlete_pro";
  if (productId === STRIPE_PRODUCTS.fighterElite) return "fighter_elite";
  return null;
}
