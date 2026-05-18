"use server";

import { db } from "@/lib/db";
import { getAgentPersonality, agentSearch } from "@/lib/agent-personality";
import { createBookingPaymentIntent, isStripeEnabled } from "@/lib/stripe-booking";
import { sendBookingConfirmation, sendAdminBookingAlert, isWhatsAppEnabled } from "@/lib/whatsapp-booking";
import { sendBookingConfirmationEmail, isEmailEnabled } from "@/lib/email-booking";

export async function agentTalk(
  businessSlug: string,
  text: string,
  history: { role: "user" | "assistant"; content: string }[] = []
) {
  const personality = await getAgentPersonality(businessSlug);
  if (!personality) {
    return { text: "Lo siento, este negocio aún no tiene un agente configurado.", type: "fallback" as const };
  }
  return agentSearch(businessSlug, text, personality, history);
}

export async function agentBook(
  businessSlug: string,
  optionId: string,
  customerName: string,
  customerPhone: string,
  customerEmail?: string
) {
  const [staffId, isoStart] = optionId.split("_");
  if (!staffId || !isoStart) return { success: false, error: "Invalid option" };

  const staff = await db.staff.findUnique({
    where: { id: staffId },
    include: { staffServices: { include: { service: true } } },
  });
  if (!staff) return { success: false, error: "Staff not found" };

  const service = staff.staffServices[0]?.service;
  if (!service) return { success: false, error: "No service found" };

  const startsAt = new Date(isoStart);
  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60000);

  // Check for double-booking
  const existing = await db.booking.findFirst({
    where: {
      staffId: staff.id,
      status: { not: "cancelled" },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  if (existing) {
    return { success: false, error: "Este horario ya no está disponible. Por favor, elige otro." };
  }

  // Default deposit: 20% of service price, min 5€, max 30€
  const depositAmount = Math.min(30, Math.max(5, Math.round(service.price * 0.2)));

  const booking = await db.booking.create({
    data: {
      businessId: staff.businessId,
      serviceId: service.id,
      staffId: staff.id,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      startsAt,
      endsAt,
      depositAmount,
      paymentStatus: depositAmount > 0 ? "pending" : "waived",
    },
  });

  await db.customer.upsert({
    where: { phone: customerPhone },
    update: { name: customerName, email: customerEmail || undefined },
    create: { phone: customerPhone, name: customerName, email: customerEmail || undefined },
  });

  // Create Stripe payment intent if deposit required
  let clientSecret: string | null = null;
  if (depositAmount > 0 && isStripeEnabled()) {
    try {
      const pi = await createBookingPaymentIntent({
        amount: depositAmount * 100,
        bookingId: booking.id,
        customerName,
        customerEmail,
        serviceName: service.name,
      });
      clientSecret = pi.client_secret;
      await db.booking.update({
        where: { id: booking.id },
        data: { stripePaymentIntentId: pi.id, stripeClientSecret: pi.client_secret },
      });
    } catch {
      // Stripe failed — booking still created, payment can be collected later
    }
  }

  // Send WhatsApp confirmation
  const business = await db.business.findUnique({ where: { slug: businessSlug } });
  if (business && isWhatsAppEnabled()) {
    const dateStr = startsAt.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    const timeStr = startsAt.toISOString().slice(11, 16);

    await sendBookingConfirmation({
      phone: customerPhone,
      customerName,
      serviceName: service.name,
      staffName: staff.name,
      date: dateStr,
      time: timeStr,
      businessName: business.name,
      businessAddress: business.address,
      depositAmount: clientSecret ? depositAmount : undefined,
    });

    // Admin alert
    if (business.phone) {
      await sendAdminBookingAlert({
        adminPhone: business.phone,
        customerName,
        serviceName: service.name,
        staffName: staff.name,
        date: dateStr,
        time: timeStr,
        businessName: business.name,
      });
    }

    // Email confirmation
    if (customerEmail && isEmailEnabled()) {
      await sendBookingConfirmationEmail({
        to: customerEmail,
        customerName,
        serviceName: service.name,
        staffName: staff.name,
        date: dateStr,
        time: timeStr,
        businessName: business.name,
        businessAddress: business.address,
        depositAmount: clientSecret ? depositAmount : undefined,
      });
    }
  }

  return {
    success: true,
    bookingId: booking.id,
    depositAmount,
    clientSecret,
    paymentRequired: depositAmount > 0 && !!clientSecret,
  };
}
