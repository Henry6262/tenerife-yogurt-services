import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, MapPin, Scissors, User, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import { BookingPayment } from "@/components/booking-payment";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({ params }: PageProps) {
  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: { service: true, staff: true, business: true },
  });

  if (!booking) notFound();

  const dateStr = booking.startsAt.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeStr = booking.startsAt.toISOString().slice(11, 16);

  const needsPayment = booking.depositAmount > 0 && booking.paymentStatus === "pending" && booking.stripeClientSecret;

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-stone-900">¡Reserva confirmada!</h1>
          <p className="text-stone-500 text-sm">{booking.business.name}</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <Scissors className="w-4 h-4 text-stone-400" />
            {booking.service.name}
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <Calendar className="w-4 h-4 text-stone-400" />
            {dateStr}
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <Clock className="w-4 h-4 text-stone-400" />
            {timeStr} ({booking.service.durationMinutes} min)
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <User className="w-4 h-4 text-stone-400" />
            Con {booking.staff.name}
          </div>
          {booking.business.address && (
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <MapPin className="w-4 h-4 text-stone-400" />
              {booking.business.address}
            </div>
          )}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-sm font-medium text-stone-700">Total servicio</span>
            <span className="text-lg font-bold text-stone-900">{booking.service.price}€</span>
          </div>
        </div>

        {needsPayment && booking.stripeClientSecret && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-stone-900">Depósito pendiente</h2>
            </div>
            <p className="text-sm text-stone-500 mb-3">
              Para garantizar tu cita, paga un depósito de <strong>{booking.depositAmount}€</strong>
            </p>
            <BookingPayment
              clientSecret={booking.stripeClientSecret}
              amount={booking.depositAmount}
              onSuccess={() => {}}
            />
          </div>
        )}

        {booking.paymentStatus === "paid" && (
          <div className="bg-emerald-50 rounded-xl p-3 text-center mb-4">
            <p className="text-sm text-emerald-700 font-medium">✅ Depósito de {booking.depositAmount}€ pagado</p>
          </div>
        )}

        <div className="text-center space-y-2">
          <Link
            href={`/bookings/${booking.customerPhone.replace(/\D/g, "")}`}
            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
          >
            <ArrowLeft className="w-3 h-3" /> Ver todas mis citas
          </Link>
          <p className="text-xs text-stone-400">
            ¿Preguntas? Llama al <a href={`tel:${booking.business.phone}`} className="text-emerald-600 hover:underline">{booking.business.phone}</a>
          </p>
        </div>
      </div>
    </main>
  );
}
