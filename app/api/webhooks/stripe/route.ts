import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanFromPriceId } from "@/lib/stripe/config";
import Stripe from "stripe";

function extractPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  return {
    start: new Date(item.current_period_start * 1000).toISOString(),
    end: new Date(item.current_period_end * 1000).toISOString(),
  };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const planInfo = priceId ? getPlanFromPriceId(priceId) : null;
        const userId = session.metadata?.supabase_user_id
          || subscription.metadata?.supabase_user_id;

        if (!userId) {
          console.error("No supabase_user_id in metadata");
          break;
        }

        const period = extractPeriod(subscription);

        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            plan: planInfo?.tier || null,
            billing_interval: planInfo?.interval || null,
            status: subscription.status === "active" ? "active" : "incomplete",
            current_period_start: period.start,
            current_period_end: period.end,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const planInfo = priceId ? getPlanFromPriceId(priceId) : null;
        const period = extractPeriod(subscription);

        const statusMap: Record<string, string> = {
          active: "active",
          past_due: "past_due",
          canceled: "cancelled",
          trialing: "trialing",
          incomplete: "incomplete",
          incomplete_expired: "cancelled",
          unpaid: "past_due",
          paused: "cancelled",
        };

        await supabase
          .from("subscriptions")
          .update({
            stripe_price_id: priceId,
            plan: planInfo?.tier || null,
            billing_interval: planInfo?.interval || null,
            status: statusMap[subscription.status] || "incomplete",
            current_period_start: period.start,
            current_period_end: period.end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        if (!subRef) break;

        const subscriptionId = typeof subRef === "string" ? subRef : subRef.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const period = extractPeriod(subscription);

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_end: period.end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        if (!subRef) break;

        const subscriptionId = typeof subRef === "string" ? subRef : subRef.id;

        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
