import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export default async function CalendarPage() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const bookings = await db.booking.findMany({
    where: {
      startsAt: {
        gte: new Date(startOfWeek.toISOString().slice(0, 10) + "T00:00:00Z"),
        lt: new Date(endOfWeek.toISOString().slice(0, 10) + "T00:00:00Z"),
      },
    },
    include: { service: true, staff: true },
    orderBy: { startsAt: "asc" },
  });

  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver al panel
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendario semanal</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ChevronLeft className="w-4 h-4" />
          {startOfWeek.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          const dateStr = d.toISOString().slice(0, 10);
          const dayBookings = bookings.filter((b) => b.startsAt.toISOString().slice(0, 10) === dateStr);

          return (
            <div key={day} className="bg-white border border-gray-200 rounded-xl p-3 min-h-[200px]">
              <div className="text-center mb-3">
                <div className="text-xs text-gray-500">{day}</div>
                <div className="text-lg font-bold text-gray-900">{d.getDate()}</div>
              </div>
              <div className="space-y-2">
                {dayBookings.map((b) => (
                  <div key={b.id} className="text-xs bg-rose-50 text-rose-800 rounded-lg p-2 border border-rose-100">
                    <div className="font-semibold">{b.startsAt.toISOString().slice(11, 16)}</div>
                    <div className="truncate">{b.service.name}</div>
                    <div className="text-rose-600">{b.staff.name}</div>
                  </div>
                ))}
                {dayBookings.length === 0 && (
                  <div className="text-xs text-gray-300 text-center py-4">Sin citas</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
