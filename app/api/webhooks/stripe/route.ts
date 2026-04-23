import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanFromPriceId } from "@/lib/stripe/config";
import Stripe from "stripe";
import {
  fireTransactionalEmail,
  emailSubscriptionCheckoutComplete,
  emailSubscriptionCancelled,
} from "@/lib/email-events";

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
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET env var is not set" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Signature verification failed", detail: message },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) {
          return NextResponse.json({ received: true, skipped: "not a subscription checkout" });
        }

        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const planInfo = priceId ? getPlanFromPriceId(priceId) : null;
        const userId = session.metadata?.supabase_user_id
          || subscription.metadata?.supabase_user_id;

        if (!userId) {
          return NextResponse.json(
            { received: true, error: "No supabase_user_id found in session or subscription metadata" },
            { status: 200 }
          );
        }

        const period = extractPeriod(subscription);

        const { error: upsertError } = await supabase.from("subscriptions").upsert(
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

        if (upsertError) {
          return NextResponse.json(
            { error: "Supabase upsert failed", detail: upsertError.message, code: upsertError.code },
            { status: 500 }
          );
        }

        fireTransactionalEmail(() => emailSubscriptionCheckoutComplete(userId));

        return NextResponse.json({ received: true, action: "subscription_created", userId });
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

        const { error: updateError } = await supabase
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

        if (updateError) {
          return NextResponse.json(
            { error: "Supabase update failed", detail: updateError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ received: true, action: "subscription_updated" });
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error: deleteError } = await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (deleteError) {
          return NextResponse.json(
            { error: "Supabase update failed", detail: deleteError.message },
            { status: 500 }
          );
        }

        const { data: subRow } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();

        if (subRow?.user_id) {
          fireTransactionalEmail(() => emailSubscriptionCancelled(subRow.user_id));
        }

        return NextResponse.json({ received: true, action: "subscription_deleted" });
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        if (!subRef) {
          return NextResponse.json({ received: true, skipped: "no subscription on invoice" });
        }

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

        return NextResponse.json({ received: true, action: "invoice_paid" });
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        if (!subRef) {
          return NextResponse.json({ received: true, skipped: "no subscription on invoice" });
        }

        const subscriptionId = typeof subRef === "string" ? subRef : subRef.id;

        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        return NextResponse.json({ received: true, action: "invoice_payment_failed" });
      }

      default:
        return NextResponse.json({ received: true, skipped: `Unhandled event type: ${event.type}` });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Webhook handler failed", detail: message },
      { status: 500 }
    );
  }
}
