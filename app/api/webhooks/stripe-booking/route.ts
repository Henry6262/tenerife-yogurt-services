import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey && !stripeSecretKey.includes("REPLACE")
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-04-22.dahlia" })
  : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!stripe || !endpointSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const bookingId = pi.metadata?.bookingId;
    if (bookingId) {
      await db.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: "paid" },
      });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const bookingId = pi.metadata?.bookingId;
    if (bookingId) {
      await db.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: "pending" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
