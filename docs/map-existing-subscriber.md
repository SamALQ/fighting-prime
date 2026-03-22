# Mapping the Existing Stripe Subscriber to Supabase

## Background

There is one active subscriber who was paying before the Supabase migration:

| Field | Value |
|---|---|
| Stripe Customer | `cus_SvLPfwObsy6sbR` |
| Stripe Subscription | `sub_1RzUjI044DGFCmBEphCd9RjP` |
| Plan | Athlete Pro Yearly (`price_1RTE1J044DGFCmBEx2kauwbp`) |
| Status | Active |

Their billing continues uninterrupted through Stripe. The only step is to link their Stripe data to their Supabase account so the app recognizes their subscription.

## Steps

### 1. Have the subscriber create an account

They need to sign up at `/signup` using the **same email** that is on their Stripe customer record. (Alternatively, you can create their Supabase account manually in the Supabase Dashboard under Authentication > Users.)

### 2. Get their Supabase user ID

After they sign up, find their `user_id` in the Supabase Dashboard:

- Go to **Authentication > Users**
- Find the user by email
- Copy their `id` (UUID)

### 3. Insert the subscription row

Run this SQL in the Supabase SQL Editor (replace `<SUPABASE_USER_ID>` with the actual UUID):

```sql
INSERT INTO subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_price_id,
  plan,
  billing_interval,
  status,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
)
VALUES (
  '<SUPABASE_USER_ID>',
  'cus_SvLPfwObsy6sbR',
  'sub_1RzUjI044DGFCmBEphCd9RjP',
  'price_1RTE1J044DGFCmBEx2kauwbp',
  'athlete_pro',
  'yearly',
  'active',
  now(),
  now() + interval '1 year',
  now(),
  now()
);
```

> **Note**: The `current_period_start` and `current_period_end` values above are approximate. Once the next invoice fires, the Stripe webhook will automatically update these to the exact values from Stripe.

### 4. Verify

- The user should now see "Athlete Pro" in their dashboard subscription card
- Premium episodes should be unlocked
- The "Manage Subscription" button should open the Stripe Customer Portal
- Their Stripe billing is completely unaffected — no changes needed on the payment side

### 5. Update Stripe customer metadata (optional)

To ensure webhooks can always map back to the correct Supabase user, update the Stripe customer metadata:

```
stripe customers update cus_SvLPfwObsy6sbR --metadata[supabase_user_id]=<SUPABASE_USER_ID>
```

Or do this in the Stripe Dashboard under the customer's detail page > Metadata.
