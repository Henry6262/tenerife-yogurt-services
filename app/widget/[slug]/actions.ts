"use server";

import { db } from "@/lib/db";
import { createBookingPaymentIntent, isStripeEnabled } from "@/lib/stripe-booking";
import { sendBookingConfirmation, sendAdminBookingAlert, isWhatsAppEnabled } from "@/lib/whatsapp-booking";
import { sendBookingConfirmationEmail, isEmailEnabled } from "@/lib/email-booking";

export async function createWidgetBooking(input: {
  businessId: string;
  serviceId: string;
  staffId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startsAt: string;
  notes?: string;
}) {
  const service = await db.service.findUnique({
    where: { id: input.serviceId },
    include: { business: true },
  });
  const staff = await db.staff.findUnique({ where: { id: input.staffId } });

  if (!service || !staff) {
    return { success: false, error: "Service or staff not found" };
  }

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60000);

  // Check for double-booking
  const existing = await db.booking.findFirst({
    where: {
      staffId: input.staffId,
      status: { not: "cancelled" },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  if (existing) {
    return { success: false, error: "Este horario ya no está disponible. Por favor, elige otro." };
  }

  const depositAmount = Math.min(30, Math.max(5, Math.round(service.price * 0.2)));

  const booking = await db.booking.create({
    data: {
      businessId: input.businessId,
      serviceId: input.serviceId,
      staffId: input.staffId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || null,
      startsAt,
      endsAt,
      notes: input.notes,
      depositAmount,
      paymentStatus: depositAmount > 0 ? "pending" : "waived",
    },
  });

  await db.customer.upsert({
    where: { phone: input.customerPhone },
    update: { name: input.customerName, email: input.customerEmail || undefined },
    create: {
      phone: input.customerPhone,
      name: input.customerName,
      email: input.customerEmail || undefined,
    },
  });

  let clientSecret: string | null = null;
  if (depositAmount > 0 && isStripeEnabled()) {
    try {
      const pi = await createBookingPaymentIntent({
        amount: depositAmount * 100,
        bookingId: booking.id,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        serviceName: service.name,
      });
      clientSecret = pi.client_secret;
      await db.booking.update({
        where: { id: booking.id },
        data: { stripePaymentIntentId: pi.id, stripeClientSecret: pi.client_secret },
      });
    } catch {
      // Stripe failed
    }
  }

  const business = service.business;
  if (isWhatsAppEnabled()) {
    const dateStr = startsAt.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeStr = startsAt.toISOString().slice(11, 16);

    await sendBookingConfirmation({
      phone: input.customerPhone,
      customerName: input.customerName,
      serviceName: service.name,
      staffName: staff.name,
      date: dateStr,
      time: timeStr,
      businessName: business.name,
      businessAddress: business.address,
      depositAmount: clientSecret ? depositAmount : undefined,
    });

    if (business.phone) {
      await sendAdminBookingAlert({
        adminPhone: business.phone,
        customerName: input.customerName,
        serviceName: service.name,
        staffName: staff.name,
        date: dateStr,
        time: timeStr,
        businessName: business.name,
      });
    }
  }

  if (input.customerEmail && isEmailEnabled()) {
    const dateStr = startsAt.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeStr = startsAt.toISOString().slice(11, 16);

    await sendBookingConfirmationEmail({
      to: input.customerEmail,
      customerName: input.customerName,
      serviceName: service.name,
      staffName: staff.name,
      date: dateStr,
      time: timeStr,
      businessName: business.name,
      businessAddress: business.address,
      depositAmount: clientSecret ? depositAmount : undefined,
    });
  }

  return {
    success: true,
    bookingId: booking.id,
    depositAmount,
    clientSecret,
    paymentRequired: depositAmount > 0 && !!clientSecret,
  };
}
