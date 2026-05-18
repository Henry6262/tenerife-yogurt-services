import { redirect } from "next/navigation";
import { getCurrentUserBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateBookingStatus, deleteBooking, updateBookingNotes } from "../actions";

export const metadata = {
  title: "Calendario — Admin",
};

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const business = await getCurrentUserBusiness();
  if (!business) redirect("/admin/onboarding");

  const { week } = await searchParams;

  // Calculate week start (Monday)
  const today = new Date();
  const weekOffset = week ? Number(week) : 0;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const bookings = await db.booking.findMany({
    where: {
      businessId: business.id,
      startsAt: { gte: weekStart, lte: weekEnd },
    },
    include: { service: true, staff: true },
    orderBy: { startsAt: "asc" },
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const prevWeek = weekOffset - 1;
  const nextWeek = weekOffset + 1;

  return (
    <main className="text-stone-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Calendario</h1>
            <p className="text-stone-500">
              {weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} —{" "}
              {weekEnd.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`/admin/calendar?week=${prevWeek}`}
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
            >
              ← Semana anterior
            </a>
            <a
              href="/admin/calendar"
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
            >
              Hoy
            </a>
            <a
              href={`/admin/calendar?week=${nextWeek}`}
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
            >
              Semana siguiente →
            </a>
            <form
              action="/api/export-bookings"
              className="flex items-center gap-2"
            >
              <input type="date" name="from" defaultValue={weekStart.toISOString().slice(0, 10)} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm" />
              <input type="date" name="to" defaultValue={weekEnd.toISOString().slice(0, 10)} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm" />
              <button
                type="submit"
                className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
              >
                📥 CSV
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {days.map((day, i) => {
            const dayBookings = bookings.filter(
              (b) => b.startsAt.toISOString().slice(0, 10) === day.toISOString().slice(0, 10)
            );
            const isToday = day.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);

            return (
              <div key={i} className={`rounded-2xl border bg-white p-4 ${isToday ? "border-emerald-300 ring-1 ring-emerald-100" : "border-stone-200"}`}>
                <div className="mb-3 text-center">
                  <p className="text-xs font-medium text-stone-400">{WEEKDAYS[i]}</p>
                  <p className={`text-xl font-bold ${isToday ? "text-emerald-600" : "text-stone-800"}`}>
                    {day.getDate()}
                  </p>
                </div>

                <div className="space-y-2">
                  {dayBookings.map((b) => (
                    <details key={b.id} className="group">
                      <summary className="cursor-pointer rounded-lg p-2 text-xs" style={{ backgroundColor: `${b.staff?.colorCode || "#3b82f6"}15`, borderLeft: `3px solid ${b.staff?.colorCode || "#3b82f6"}` }}>
                        <p className="font-medium text-stone-800">{b.startsAt.toISOString().slice(11, 16)}</p>
                        <p className="text-stone-500">{b.service.name}</p>
                        <p className="text-stone-400">{b.customerName}</p>
                      </summary>
                      <div className="mt-2 space-y-2 rounded-lg bg-stone-50 p-2">
                        <p className="text-xs text-stone-500">
                          📞 <a href={`tel:${b.customerPhone}`} className="text-emerald-600 hover:underline">{b.customerPhone}</a>
                        </p>
                        {b.customerEmail && <p className="text-xs text-stone-500">✉️ <a href={`mailto:${b.customerEmail}`} className="text-emerald-600 hover:underline">{b.customerEmail}</a></p>}
                        <form action={updateBookingNotes} className="flex gap-1">
                          <input type="hidden" name="id" value={b.id} />
                          <input
                            name="notes"
                            defaultValue={b.notes || ""}
                            placeholder="Notas..."
                            className="flex-1 rounded border border-stone-200 bg-white px-2 py-1 text-xs"
                          />
                          <button type="submit" className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 transition">
                            💾
                          </button>
                        </form>
                        <div className="flex gap-2 pt-1">
                          <form action={updateBookingStatus}>
                            <input type="hidden" name="id" value={b.id} />
                            <input type="hidden" name="status" value={b.status === "confirmed" ? "completed" : "confirmed"} />
                            <button
                              type="submit"
                              className={`rounded px-2 py-1 text-xs font-medium ${
                                b.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {b.status === "confirmed" ? "✅ Completar" : "Confirmar"}
                            </button>
                          </form>
                          <form action={updateBookingStatus}>
                            <input type="hidden" name="id" value={b.id} />
                            <input type="hidden" name="status" value="cancelled" />
                            <button type="submit" className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                              Cancelar
                            </button>
                          </form>
                          <form action={deleteBooking}>
                            <input type="hidden" name="id" value={b.id} />
                            <button type="submit" className="rounded bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
                              🗑️
                            </button>
                          </form>
                        </div>
                      </div>
                    </details>
                  ))}
                  {dayBookings.length === 0 && (
                    <p className="text-center text-xs text-stone-300 py-4">Sin citas</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
