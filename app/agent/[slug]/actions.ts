"use server";

import { db } from "@/lib/db";
import { getAgentPersonality, agentSearch } from "@/lib/agent-personality";

export async function agentTalk(businessSlug: string, text: string) {
  const personality = await getAgentPersonality(businessSlug);
  if (!personality) {
    return { text: "Lo siento, este negocio aún no tiene un agente configurado.", type: "fallback" as const };
  }
  return agentSearch(businessSlug, text, personality);
}

export async function agentBook(businessSlug: string, optionId: string, customerName: string, customerPhone: string) {
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

  const booking = await db.booking.create({
    data: {
      businessId: staff.businessId,
      serviceId: service.id,
      staffId: staff.id,
      customerName,
      customerPhone,
      startsAt,
      endsAt,
    },
  });

  await db.customer.upsert({
    where: { phone: customerPhone },
    update: { name: customerName },
    create: { phone: customerPhone, name: customerName },
  });

  return { success: true, bookingId: booking.id };
}
