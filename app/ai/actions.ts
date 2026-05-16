"use server";

import { db } from "@/lib/db";
import { loadSlotsForStaff, loadSlotsForAnyStaff } from "@/lib/slots";
import { parseIntent, type ParsedIntent } from "@/lib/ai-parser";

export interface AIResult {
  type: "success" | "no_slots" | "no_service" | "error";
  message: string;
  options?: SlotOption[];
  intent?: ParsedIntent;
}

export interface SlotOption {
  id: string; // composite key: staffId + slot time
  staffId: string;
  staffName: string;
  staffBio: string | null;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  startTime: string; // ISO
  displayTime: string; // HH:mm
  displayDate: string;
  businessName: string;
  businessAddress: string;
}

function getDateRange(urgency: ParsedIntent["urgency"], timeOfDay: ParsedIntent["timeOfDay"]): string[] {
  const dates: string[] = [];
  const today = new Date();

  if (urgency === "now" || urgency === "today") {
    dates.push(today.toISOString().slice(0, 10));
  }
  if (urgency === "tomorrow") {
    const t = new Date(today);
    t.setDate(today.getDate() + 1);
    dates.push(t.toISOString().slice(0, 10));
  }
  if (urgency === "this_week" || urgency === "any") {
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const ds = d.toISOString().slice(0, 10);
      if (!dates.includes(ds)) dates.push(ds);
    }
  }

  return dates;
}

function timeOfDayToMinutes(tod: ParsedIntent["timeOfDay"]): { min: number; max: number } | null {
  switch (tod) {
    case "morning": return { min: 0, max: 720 }; // 00:00 - 12:00
    case "afternoon": return { min: 720, max: 1080 }; // 12:00 - 18:00
    case "evening": return { min: 1080, max: 1440 }; // 18:00 - 24:00
    default: return null;
  }
}

export async function aiSearchSlots(text: string): Promise<AIResult> {
  const intent = parseIntent(text);

  // Map service type to service names
  const serviceTypeMap: Record<string, string[]> = {
    hair: ["Corte de Pelo Mujer", "Corte de Pelo Hombre", "Tinte Completo", "Mechas"],
    nails: ["Manicura", "Pedicura"],
    massage: ["Masaje Relajante"],
    facial: ["Tratamiento Facial"],
    waxing: [],
    makeup: [],
    any: [],
  };

  const targetServiceNames = intent.serviceType
    ? serviceTypeMap[intent.serviceType] || []
    : [];

  // Find matching services
  const services = await db.service.findMany({
    where: {
      isActive: true,
      ...(targetServiceNames.length > 0
        ? { name: { in: targetServiceNames } }
        : {}),
      ...(intent.budget ? { price: { lte: intent.budget } } : {}),
    },
    include: {
      business: true,
      staffServices: {
        include: {
          staff: {
            include: { staffServices: true },
          },
        },
      },
    },
  });

  if (services.length === 0) {
    return {
      type: "no_service",
      message: `No encontré servicios de ${intent.serviceType || "ese tipo"} disponibles. Prueba con otra búsqueda.`,
      intent,
    };
  }

  // Build options by checking slots across dates
  const dates = getDateRange(intent.urgency, intent.timeOfDay);
  const todRange = timeOfDayToMinutes(intent.timeOfDay);
  const options: SlotOption[] = [];

  for (const service of services) {
    const qualifiedStaff = service.staffServices
      .map((ss) => ss.staff)
      .filter((s) => s.isActive)
      .filter((s) =>
        intent.staffPreference
          ? normalize(s.name).includes(normalize(intent.staffPreference))
          : true
      );

    for (const staff of qualifiedStaff) {
      for (const dateStr of dates) {
        const slotResult = await loadSlotsForStaff(staff.id, dateStr, service.id);
        if (slotResult.error) continue;

        for (const slot of slotResult.slots) {
          // Filter by specific time preference
          if (intent.specificTime) {
            const slotTime = slot.time;
            const diff = Math.abs(
              parseInt(slotTime.replace(":", "")) - parseInt(intent.specificTime.replace(":", ""))
            );
            if (diff > 100) continue; // within ~1 hour
          }

          // Filter by time of day
          if (todRange) {
            const slotMinutes = parseInt(slot.time.split(":")[0]) * 60 + parseInt(slot.time.split(":")[1]);
            if (slotMinutes < todRange.min || slotMinutes > todRange.max) continue;
          }

          options.push({
            id: `${staff.id}_${slot.isoStart}`,
            staffId: staff.id,
            staffName: staff.name,
            staffBio: staff.bio,
            serviceId: service.id,
            serviceName: service.name,
            servicePrice: service.price,
            serviceDuration: service.durationMinutes,
            startTime: slot.isoStart,
            displayTime: slot.time,
            displayDate: dateStr,
            businessName: service.business.name,
            businessAddress: service.business.address,
          });
        }
      }
    }
  }

  // Sort: urgency first = sort by earliest time
  options.sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Take top 5
  const topOptions = options.slice(0, 5);

  if (topOptions.length === 0) {
    return {
      type: "no_slots",
      message: `Lo siento, no hay citas disponibles para ${intent.serviceType || "eso"} en esas fechas/horas. ¿Puedo buscar en otro horario?`,
      intent,
    };
  }

  // Build natural response
  const first = topOptions[0];
  const sameDay = topOptions.every((o) => o.displayDate === first.displayDate);
  const response = sameDay
    ? `¡Perfecto! Encontré ${topOptions.length} opcion${topOptions.length > 1 ? "es" : ""} para ${first.serviceName.toLowerCase()} hoy. La más temprana es a las ${first.displayTime} con ${first.staffName}.`
    : `Encontré ${topOptions.length} opcion${topOptions.length > 1 ? "es" : ""} para ${first.serviceName.toLowerCase()}. La más pronto es el ${first.displayDate} a las ${first.displayTime} con ${first.staffName}.`;

  return {
    type: "success",
    message: response,
    options: topOptions,
    intent,
  };
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function aiBook(optionId: string, customerName: string, customerPhone: string): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  // Parse composite id
  const [staffId, isoStart] = optionId.split("_");
  if (!staffId || !isoStart) return { success: false, error: "Invalid option" };

  // Find the service this staff does at this time
  const staff = await db.staff.findUnique({
    where: { id: staffId },
    include: { staffServices: { include: { service: true } } },
  });
  if (!staff) return { success: false, error: "Staff not found" };

  // For simplicity, book the first matching service
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
