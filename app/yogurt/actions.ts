"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { stripe, BASE_URL } from "@/lib/stripe";
import { sendWhatsAppMessage, TEMPLATES } from "@/lib/whatsapp";

export async function createYogurtLead(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string | null;
  const address = formData.get("address") as string;
  const source = (formData.get("source") as string) || "qr";
  const eventLocation = (formData.get("eventLocation") as string) || null;
  const orderType = (formData.get("orderType") as string) || "one-time";

  if (!name || !phone || !address) {
    redirect("/yogurt?error=missing-fields");
  }

  const cleanPhone = phone.trim().replace(/\s/g, "");
  const normalizedPhone = cleanPhone.startsWith("+")
    ? cleanPhone
    : cleanPhone.startsWith("00")
    ? "+" + cleanPhone.slice(2)
    : "+34" + cleanPhone.replace(/^0/, "");

  let lead;
  try {
    lead = await db.yogurtLead.create({
      data: {
        name: name.trim(),
        phone: normalizedPhone,
        email: email?.trim() || null,
        address: address.trim(),
        source,
        eventLocation,
        orderType,
      },
    });
  } catch (err: any) {
    console.error("Lead save error:", err);
    redirect("/yogurt?error=save-failed");
  }

  const isSubscription = orderType === "subscription";

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: isSubscription ? 800 : 1000,
            product_data: {
              name: isSubscription
                ? "Caja Semanal Yogurt Griego — 4 tarros"
                : "Pack Yogurt Griego Artesanal — 4 tarros",
              description: "Entrega gratis en Santa Cruz / La Laguna",
            },
            ...(isSubscription && {
              recurring: { interval: "week" },
            }),
          },
          quantity: 1,
        },
      ],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${BASE_URL}/yogurt/success?session_id={CHECKOUT_SESSION_ID}&lead_id=${lead.id}&mode=${isSubscription ? "sub" : "payment"}`,
      cancel_url: `${BASE_URL}/yogurt?error=cancelled`,
      customer_email: email?.trim() || undefined,
      metadata: {
        leadId: lead.id,
        name: name.trim(),
        phone: normalizedPhone,
        event: eventLocation || "",
        orderType,
      },
    });
  } catch (err: any) {
    console.error("Stripe session error:", err);
    redirect("/yogurt?error=stripe-failed");
  }

  if (!session.url) {
    redirect("/yogurt?error=stripe-failed");
  }

  redirect(session.url);
}

export async function getYogurtLeads() {
  return db.yogurtLead.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateLeadStatus(id: string, status: string, notes?: string) {
  return db.yogurtLead.update({
    where: { id },
    data: { status, ...(notes && { notes }) },
  });
}

export async function sendLeadWhatsApp(leadId: string, template: "orderConfirmation" | "leadFollowUp" | "deliveryReminder") {
  const lead = await db.yogurtLead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  const message = TEMPLATES[template](lead.name, `${BASE_URL}/yogurt?lead=${lead.id}`);
  const result = await sendWhatsAppMessage(lead.phone, message);

  if (!result.success) {
    throw new Error(result.error || "Failed to send WhatsApp");
  }

  await db.yogurtLead.update({
    where: { id: leadId },
    data: { status: "contacted" },
  });
}

export async function getDeliveryLeads() {
  return db.yogurtLead.findMany({
    where: {
      status: "converted",
      deliveredAt: null,
      address: { not: null },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function markDelivered(leadId: string) {
  await db.yogurtLead.update({
    where: { id: leadId },
    data: { deliveredAt: new Date() },
  });
}
