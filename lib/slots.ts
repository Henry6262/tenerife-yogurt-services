import { db } from "./db";

interface Schedule {
  id: string;
  staff_id: string;
  weekday: number;
  start_minute: number;
  end_minute: number;
}

interface Override {
  id: string;
  staff_id: string;
  date: string;
  is_closed: boolean;
  start_minute: number | null;
  end_minute: number | null;
}

interface BookingSlot {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
}

interface GetSlotsInput {
  schedules: Schedule[];
  overrides: Override[];
  bookings: BookingSlot[];
  durationMinutes: number;
  dateStr: string;
  leadTimeMinutes?: number;
  now?: Date;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getAvailableSlots(input: GetSlotsInput): { starts_at: string }[] {
  const { schedules, overrides, bookings, durationMinutes, dateStr, leadTimeMinutes = 60, now = new Date() } = input;

  const date = new Date(dateStr + "T00:00:00");
  const weekday = date.getDay();

  // Find schedule for this weekday
  const daySchedule = schedules.find((s) => s.weekday === weekday);
  if (!daySchedule) return [];

  let dayStart = daySchedule.start_minute;
  let dayEnd = daySchedule.end_minute;

  // Apply override
  const dayOverride = overrides.find((o) => o.date === dateStr);
  if (dayOverride) {
    if (dayOverride.is_closed) return [];
    if (dayOverride.start_minute !== null) dayStart = dayOverride.start_minute;
    if (dayOverride.end_minute !== null) dayEnd = dayOverride.end_minute;
  }

  // Build busy intervals from bookings
  const busyIntervals = bookings
    .filter((b) => b.status !== "cancelled")
    .map((b) => ({
      start: timeToMinutes(new Date(b.starts_at).toISOString().slice(11, 16)),
      end: timeToMinutes(new Date(b.ends_at).toISOString().slice(11, 16)),
    }));

  // Generate candidate slots
  const slots: { starts_at: string }[] = [];
  const slotInterval = 30; // 30-min grid

  const todayStr = now.toISOString().slice(0, 10);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let start = dayStart; start + durationMinutes <= dayEnd; start += slotInterval) {
    const end = start + durationMinutes;

    // Skip if in the past (with lead time)
    if (dateStr === todayStr && start < currentMinutes + leadTimeMinutes) {
      continue;
    }

    // Check conflicts
    const hasConflict = busyIntervals.some(
      (busy) => start < busy.end && end > busy.start
    );

    if (!hasConflict) {
      slots.push({
        starts_at: `${dateStr}T${minutesToTime(start)}:00.000Z`,
      });
    }
  }

  return slots;
}

export async function loadSlotsForStaff(
  staffId: string,
  dateStr: string,
  serviceId: string
): Promise<{ slots: { time: string; isoStart: string }[]; error?: string }> {
  const staff = await db.staff.findFirst({
    where: { id: staffId, isActive: true },
  });
  if (!staff) return { slots: [], error: "Staff not found" };

  const service = await db.service.findFirst({
    where: { id: serviceId, isActive: true },
  });
  if (!service) return { slots: [], error: "Service not found" };

  const schedules = await db.staffSchedule.findMany({ where: { staffId } });
  const overrides = await db.staffOverride.findMany({
    where: { staffId, date: dateStr },
  });

  const bookings = await db.booking.findMany({
    where: {
      staffId,
      startsAt: {
        gte: new Date(dateStr + "T00:00:00.000Z"),
        lt: new Date(dateStr + "T23:59:59.000Z"),
      },
      status: { not: "cancelled" },
    },
  });

  const slots = getAvailableSlots({
    schedules: schedules.map((s) => ({
      id: s.id,
      staff_id: s.staffId,
      weekday: s.weekday,
      start_minute: s.startMinute,
      end_minute: s.endMinute,
    })),
    overrides: overrides.map((o) => ({
      id: o.id,
      staff_id: o.staffId,
      date: o.date,
      is_closed: o.isClosed,
      start_minute: o.startMinute,
      end_minute: o.endMinute,
    })),
    bookings: bookings.map((b) => ({
      id: b.id,
      starts_at: b.startsAt.toISOString(),
      ends_at: b.endsAt.toISOString(),
      status: b.status,
    })),
    durationMinutes: service.durationMinutes,
    dateStr,
  });

  return {
    slots: slots.map((s) => ({
      time: s.starts_at.slice(11, 16),
      isoStart: s.starts_at,
    })),
  };
}

export async function loadSlotsForAnyStaff(
  dateStr: string,
  serviceId: string
): Promise<{ slots: { time: string; isoStart: string }[]; staffId: string }> {
  const service = await db.service.findFirst({
    where: { id: serviceId, isActive: true },
    include: { staffServices: { select: { staffId: true } } },
  });
  if (!service) return { slots: [], staffId: "" };

  const staffIds = service.staffServices.map((s) => s.staffId);
  let bestSlots: { time: string; isoStart: string }[] = [];
  let bestStaffId = "";
  let earliestTime = "";

  for (const sid of staffIds) {
    const result = await loadSlotsForStaff(sid, dateStr, serviceId);
    if (result.slots.length === 0) continue;
    if (!earliestTime || result.slots[0].isoStart < earliestTime) {
      earliestTime = result.slots[0].isoStart;
      bestStaffId = sid;
      bestSlots = result.slots;
    }
  }

  return { slots: bestSlots, staffId: bestStaffId };
}
