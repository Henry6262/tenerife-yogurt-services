import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
export const stripe = stripeSecretKey && !stripeSecretKey.includes("REPLACE")
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-04-22.dahlia" })
  : null;

export function isStripeEnabled(): boolean {
  return !!stripe;
}

export async function createBookingPaymentIntent({
  amount,
  bookingId,
  customerName,
  customerEmail,
  serviceName,
}: {
  amount: number; // in cents
  bookingId: string;
  customerName: string;
  customerEmail?: string | null;
  serviceName: string;
}) {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "eur",
    automatic_payment_methods: { enabled: true },
    metadata: {
      bookingId,
      type: "booking_deposit",
    },
    description: `Depósito para ${serviceName} — ${customerName}`,
    receipt_email: customerEmail || undefined,
  });

  return paymentIntent;
}
