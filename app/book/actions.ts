"use server";

import { db } from "@/lib/db";
import { loadSlotsForStaff, loadSlotsForAnyStaff } from "@/lib/slots";

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
  // Lookup business from service
  const service = await db.service.findUnique({
    where: { id: input.serviceId },
    select: { businessId: true },
  });
  const businessId = input.businessId || service?.businessId || "";

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

  return { success: true, bookingId: booking.id };
}
