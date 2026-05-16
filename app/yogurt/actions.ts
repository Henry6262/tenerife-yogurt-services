"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendWhatsAppMessage, TEMPLATES } from "@/lib/whatsapp";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/* ─────────────── Order / Checkout ─────────────── */

export async function createOrder(formData: FormData) {
  const productId = formData.get("productId") as string;
  const productName = formData.get("productName") as string;
  const price = Number(formData.get("price"));

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: productName },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${BASE_URL}/yogurt/success?session_id={CHECKOUT_SESSION_ID}&product_id=${productId}`,
    cancel_url: `${BASE_URL}/yogurt?canceled=1`,
    shipping_address_collection: { allowed_countries: ["ES"] },
    metadata: { productId, productName },
  });

  if (!session.url) {
    throw new Error("No checkout URL generated");
  }

  redirect(session.url);
}

export async function checkoutCart(formData: FormData) {
  const itemsJson = formData.get("items") as string;
  const items: { productId: string; name: string; price: number; quantity: number }[] =
    JSON.parse(itemsJson);

  const lineItems = items.map((item) => ({
    price_data: {
      currency: "eur",
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const metadata: Record<string, string> = {};
  items.forEach((item, i) => {
    metadata[`productId_${i}`] = item.productId;
    metadata[`productName_${i}`] = item.name;
    metadata[`quantity_${i}`] = String(item.quantity);
  });

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    success_url: `${BASE_URL}/yogurt/success?session_id={CHECKOUT_SESSION_ID}&cart=1`,
    cancel_url: `${BASE_URL}/yogurt/cart?canceled=1`,
    shipping_address_collection: { allowed_countries: ["ES"] },
    metadata,
  });

  if (!session.url) {
    throw new Error("No checkout URL generated");
  }

  redirect(session.url);
}

export async function createSubscriptionOrder(formData: FormData) {
  const productId = formData.get("productId") as string;
  const productName = formData.get("productName") as string;
  const price = Number(formData.get("price"));

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: productName },
          unit_amount: Math.round(price * 100),
          recurring: { interval: "week" },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${BASE_URL}/yogurt/success?session_id={CHECKOUT_SESSION_ID}&product_id=${productId}&type=subscription`,
    cancel_url: `${BASE_URL}/yogurt?canceled=1`,
    subscription_data: { metadata: { productId, productName } },
  });

  if (!session.url) {
    throw new Error("No checkout URL generated");
  }

  redirect(session.url);
}

export async function getOrdersByPhone(phone: string) {
  const clean = phone.replace(/\D/g, "");
  return db.order.findMany({
    where: {
      OR: [
        { customerPhone: { contains: clean } },
        { customerPhone: { contains: phone } },
      ],
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  await db.order.update({
    where: { id: orderId },
    data: { status },
  });
  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function getAllOrders() {
  return db.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/* ─────────────── Subscription management ─────────────── */

export async function getSubscriptionsByPhone(phone: string) {
  const clean = phone.replace(/\D/g, "");
  return db.yogurtSubscription.findMany({
    where: {
      lead: {
        OR: [{ phone: { contains: clean } }, { phone: { contains: phone } }],
      },
    },
    include: { lead: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllSubscriptions() {
  return db.yogurtSubscription.findMany({
    include: { lead: true },
    orderBy: { nextDelivery: "asc" },
  });
}

export async function cancelSubscription(subscriptionId: string) {
  const sub = await db.yogurtSubscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!sub) return { ok: false, error: "Not found" };

  // Cancel in Stripe
  try {
    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
  } catch {
    // may already be cancelled
  }

  await db.yogurtSubscription.update({
    where: { id: subscriptionId },
    data: { status: "cancelled" },
  });

  revalidatePath("/admin/subscriptions");
  revalidatePath("/yogurt/subscriptions");
  return { ok: true };
}

export async function createPortalSession(formData: FormData) {
  const subscriptionId = formData.get("subscriptionId") as string;
  const sub = await db.yogurtSubscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!sub?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${BASE_URL}/yogurt/subscriptions`,
  });

  if (!portalSession.url) {
    throw new Error("No portal URL generated");
  }

  redirect(portalSession.url);
}

/* ─────────────── Legacy lead actions ─────────────── */

export async function getYogurtLeads() {
  return db.yogurtLead.findMany({ orderBy: { createdAt: "desc" } });
}

export async function sendLeadWhatsApp(formData: FormData) {
  const id = formData.get("id") as string;
  const template = formData.get("template") as string;

  const lead = await db.yogurtLead.findUnique({ where: { id } });
  if (!lead) return;

  const message =
    template === "followup"
      ? TEMPLATES.leadFollowUp(lead.name, `${BASE_URL}/yogurt`)
      : TEMPLATES.deliveryReminder(lead.name);

  await sendWhatsAppMessage(lead.phone, message);

  await db.yogurtLead.update({
    where: { id },
    data: { status: "contacted" },
  });

  revalidatePath("/admin/yogurt-leads");
}

export async function getDeliveryLeads() {
  return db.yogurtLead.findMany({
    where: {
      status: { in: ["converted", "new", "contacted"] },
      deliveredAt: null,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function markDelivered(formData: FormData) {
  const id = formData.get("id") as string;
  await db.yogurtLead.update({
    where: { id },
    data: { status: "converted", deliveredAt: new Date() },
  });
  revalidatePath("/admin/deliveries");
}

export async function markDeliveredById(id: string) {
  await db.yogurtLead.update({
    where: { id },
    data: { status: "converted", deliveredAt: new Date() },
  });
  revalidatePath("/admin/deliveries");
}
