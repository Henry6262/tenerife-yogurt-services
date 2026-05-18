import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cancelBooking, rescheduleBooking } from "@/app/admin/actions";
import { Calendar, Clock, MapPin, Scissors, User, CreditCard, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ phone: string }>;
}

export const dynamic = "force-dynamic";

export default async function CustomerBookingsPage({ params }: PageProps) {
  const { phone } = await params;
  const cleanPhone = decodeURIComponent(phone).replace(/\D/g, "");

  const bookings = await db.booking.findMany({
    where: { customerPhone: { contains: cleanPhone } },
    include: { service: true, staff: true, business: true },
    orderBy: { startsAt: "desc" },
  });

  if (bookings.length === 0) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-stone-500 mb-4">No encontramos citas con ese teléfono.</p>
          <Link href="/bookings" className="text-emerald-600 hover:underline text-sm">
            ← Probar otro teléfono
          </Link>
        </div>
      </main>
    );
  }

  const now = new Date();

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link href="/bookings" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <h1 className="text-2xl font-bold text-stone-900 mb-1">Mis Citas</h1>
        <p className="text-stone-500 text-sm mb-6">{bookings[0].customerName || "Cliente"}</p>

        <div className="space-y-3">
          {bookings.map((b) => {
            const isPast = b.startsAt < now;
            const isUpcoming = !isPast && b.status !== "cancelled";
            const dateStr = b.startsAt.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });
            const timeStr = b.startsAt.toISOString().slice(11, 16);

            return (
              <div
                key={b.id}
                className={`rounded-2xl border bg-white p-4 ${
                  isUpcoming ? "border-emerald-200 ring-1 ring-emerald-50" : "border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      b.status === "confirmed" && isUpcoming
                        ? "bg-emerald-100 text-emerald-700"
                        : b.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : b.status === "completed"
                        ? "bg-stone-100 text-stone-600"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {b.status === "confirmed" && isUpcoming
                      ? "Próxima"
                      : b.status === "cancelled"
                      ? "Cancelada"
                      : b.status === "completed"
                      ? "Completada"
                      : "Pendiente"}
                  </span>
                  {b.depositAmount > 0 && (
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {b.paymentStatus === "paid"
                        ? `${b.depositAmount}€ pagado`
                        : `${b.depositAmount}€ depósito pendiente`}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-stone-700">
                    <Scissors className="w-4 h-4 text-stone-400" />
                    {b.service.name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-700">
                    <Calendar className="w-4 h-4 text-stone-400" />
                    {dateStr}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-700">
                    <Clock className="w-4 h-4 text-stone-400" />
                    {timeStr} ({b.service.durationMinutes} min)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-700">
                    <User className="w-4 h-4 text-stone-400" />
                    Con {b.staff.name}
                  </div>
                  {b.business.address && (
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      {b.business.address}
                    </div>
                  )}
                </div>

                {isUpcoming && (
                  <div className="mt-3 space-y-2">
                    <form action={cancelBooking}>
                      <input type="hidden" name="id" value={b.id} />
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                      >
                        Cancelar cita
                      </button>
                    </form>
                    <form action={rescheduleBooking} className="flex gap-2">
                      <input type="hidden" name="id" value={b.id} />
                      <input
                        type="date"
                        name="newDate"
                        min={new Date().toISOString().slice(0, 10)}
                        required
                        className="flex-1 rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
                      />
                      <input
                        type="time"
                        name="newTime"
                        required
                        className="w-20 rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200 transition"
                      >
                        Mover
                      </button>
                    </form>
                  </div>
                )}

                {b.notes && (
                  <p className="mt-3 text-xs text-stone-400 bg-stone-50 rounded-lg p-2">
                    📝 {b.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
