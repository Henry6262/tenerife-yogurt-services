import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBookingReminder, isWhatsAppEnabled } from "@/lib/whatsapp-booking";

/**
 * POST /api/bookings/reminders
 * Body: { cronSecret: string }
 *
 * Sends WhatsApp reminders for bookings starting in ~24h.
 * Call this from a cron job (Vercel Cron, GitHub Actions, etc.)
 */
export async function POST(req: NextRequest) {
  const { cronSecret } = await req.json().catch(() => ({}));
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWhatsAppEnabled()) {
    return NextResponse.json({ sent: 0, error: "WhatsApp not configured" });
  }

  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const bookings = await db.booking.findMany({
    where: {
      startsAt: { gte: tomorrowStart, lte: tomorrowEnd },
      status: { in: ["confirmed", "pending"] },
    },
    include: { service: true, staff: true, business: true },
  });

  const results = [];
  for (const b of bookings) {
    const dateStr = b.startsAt.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeStr = b.startsAt.toISOString().slice(11, 16);

    const res = await sendBookingReminder({
      phone: b.customerPhone,
      customerName: b.customerName,
      serviceName: b.service.name,
      staffName: b.staff.name,
      date: dateStr,
      time: timeStr,
      businessName: b.business.name,
      businessAddress: b.business.address,
    });

    results.push({ bookingId: b.id, sent: res.sent, error: res.error });
  }

  return NextResponse.json({ sent: results.filter((r) => r.sent).length, results });
}
