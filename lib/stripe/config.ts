// Test mode price IDs (used with sk_test_ keys)
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

// Live mode price IDs (swap to these when going live with sk_live_ keys)
// const LIVE_PRICES = {
//   athletePro: {
//     monthly: "price_1RTE0N044DGFCmBE7TaZb6zK",
//     yearly: "price_1RTE1J044DGFCmBEx2kauwbp",
//   },
//   fighterElite: {
//     monthly: "price_1RTE96044DGFCmBEE0xQhdDS",
//     yearly: "price_1RTEA9044DGFCmBEaSlVp09W",
//   },
// };
//
// const LIVE_PRODUCTS = {
//   athletePro: "prod_SO00Qj7Q3bkT7d",
//   fighterElite: "prod_SO09Z0C2JLNvbU",
// };

export const STRIPE_PRICES = TEST_PRICES;
export const STRIPE_PRODUCTS = TEST_PRODUCTS;

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
