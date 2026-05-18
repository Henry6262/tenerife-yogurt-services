"use server";

import { db } from "@/lib/db";
import { loadSlotsForStaff, loadSlotsForAnyStaff } from "@/lib/slots";
import { createBookingPaymentIntent, isStripeEnabled } from "@/lib/stripe-booking";
import { sendBookingConfirmation, sendAdminBookingAlert, isWhatsAppEnabled } from "@/lib/whatsapp-booking";
import { sendBookingConfirmationEmail, isEmailEnabled } from "@/lib/email-booking";

export async function getSlots(staffId: string, dateStr: string, serviceId: string) {
  return loadSlotsForStaff(staffId, dateStr, serviceId);
}

export async function getSlotsAnyStaff(dateStr: string, serviceId: string) {
  return loadSlotsForAnyStaff(dateStr, serviceId);
}

export async function createBooking(input: {
  businessId?: string;
  serviceId: string;
  staffId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
}) {
  // Lookup business and service
  const service = await db.service.findUnique({
    where: { id: input.serviceId },
    include: { business: true },
  });
  const businessId = input.businessId || service?.businessId || "";
  const business = service?.business;

  // Default deposit: 20% of service price, min 5€, max 30€
  const depositAmount = Math.min(30, Math.max(5, Math.round((service?.price || 0) * 0.2)));

  // Check for double-booking
  const existing = await db.booking.findFirst({
    where: {
      staffId: input.staffId,
      status: { not: "cancelled" },
      startsAt: { lt: new Date(input.endsAt) },
      endsAt: { gt: new Date(input.startsAt) },
    },
  });
  if (existing) {
    return { success: false, error: "Este horario ya no está disponible. Por favor, elige otro." };
  }

  const booking = await db.booking.create({
    data: {
      businessId,
      serviceId: input.serviceId,
      staffId: input.staffId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      notes: input.notes,
      depositAmount,
      paymentStatus: depositAmount > 0 ? "pending" : "waived",
    },
  });

  // Upsert customer
  await db.customer.upsert({
    where: { phone: input.customerPhone },
    update: { name: input.customerName, email: input.customerEmail },
    create: {
      phone: input.customerPhone,
      name: input.customerName,
      email: input.customerEmail,
    },
  });

  // Create Stripe payment intent if deposit required
  let clientSecret: string | null = null;
  if (depositAmount > 0 && isStripeEnabled()) {
    try {
      const pi = await createBookingPaymentIntent({
        amount: depositAmount * 100,
        bookingId: booking.id,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        serviceName: service?.name || "Servicio",
      });
      clientSecret = pi.client_secret;
      await db.booking.update({
        where: { id: booking.id },
        data: { stripePaymentIntentId: pi.id, stripeClientSecret: pi.client_secret },
      });
    } catch {
      // Stripe failed — booking still created
    }
  }

  // Lookup staff name
  const staffMember = await db.staff.findUnique({
    where: { id: input.staffId },
    select: { name: true },
  });
  const staffName = staffMember?.name || "";

  // Send WhatsApp confirmation
  if (business && isWhatsAppEnabled()) {
    const dateStr = booking.startsAt.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeStr = booking.startsAt.toISOString().slice(11, 16);

    await sendBookingConfirmation({
      phone: input.customerPhone,
      customerName: input.customerName,
      serviceName: service?.name || "Servicio",
      staffName,
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
        serviceName: service?.name || "Servicio",
        staffName,
        date: dateStr,
        time: timeStr,
        businessName: business.name,
      });
    }
  }

  // Email confirmation
  if (input.customerEmail && isEmailEnabled()) {
    const dateStr = booking.startsAt.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeStr = booking.startsAt.toISOString().slice(11, 16);

    await sendBookingConfirmationEmail({
      to: input.customerEmail,
      customerName: input.customerName,
      serviceName: service?.name || "Servicio",
      staffName,
      date: dateStr,
      time: timeStr,
      businessName: business?.name || "",
      businessAddress: business?.address,
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
