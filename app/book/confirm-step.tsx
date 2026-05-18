"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "./actions";
import { BookingPayment } from "@/components/booking-payment";
import { Calendar, Clock, User, Phone, Mail, CheckCircle, CreditCard } from "lucide-react";

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  colorCode: string;
}

interface StaffMember {
  id: string;
  name: string;
  bio: string | null;
  colorCode: string;
}

interface Props {
  service: Service;
  staff: StaffMember | null;
  dateStr: string;
  timeStr: string;
  businessSlug: string;
}

export function ConfirmStep({ service, staff, dateStr, timeStr, businessSlug }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);

  if (done && bookingId) {
    return (
      <div className="text-center py-10">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva confirmada!</h2>
        <p className="text-gray-500 mb-6">
          Te esperamos el {dateStr} a las {timeStr.slice(11, 16)}
        </p>
        <button
          onClick={() => router.push(`/bookings/confirmation/${bookingId}`)}
          className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition"
        >
          Ver detalles de mi cita
        </button>
      </div>
    );
  }

  if (paymentRequired && clientSecret && bookingId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Depósito requerido</h1>
        <p className="text-gray-500 text-center mb-6">
          Para garantizar tu cita, paga un depósito de <strong>{depositAmount}€</strong>
        </p>
        <BookingPayment
          clientSecret={clientSecret}
          amount={depositAmount}
          onSuccess={() => setDone(true)}
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setError("Nombre y teléfono son obligatorios");
      return;
    }
    setLoading(true);
    setError("");

    const startsAt = new Date(timeStr);
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60000);

    const result = await createBooking({
      businessId: "", // filled below from service lookup
      serviceId: service.id,
      staffId: staff?.id ?? "",
      customerName: name,
      customerPhone: phone,
      customerEmail: email || undefined,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      notes: notes || undefined,
    });

    setLoading(false);
    if (result.success) {
      setBookingId(result.bookingId || null);
      if (result.paymentRequired && result.clientSecret) {
        setPaymentRequired(true);
        setClientSecret(result.clientSecret);
        setDepositAmount(result.depositAmount || 0);
      } else {
        setDone(true);
      }
    } else {
      setError("No se pudo completar la reserva. Inténtalo de nuevo.");
    }
  };

  const displayDate = new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Confirma tu reserva</h1>
      <p className="text-gray-500 text-center mb-8">Revisa los detalles y completa tus datos</p>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: service.colorCode }}>
            <Calendar className="w-4 h-4" />
          </div>
          <span className="font-medium text-gray-900">{service.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          {displayDate} a las {timeStr.slice(11, 16)} · {service.durationMinutes} min
        </div>
        {staff && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            Con {staff.name}
          </div>
        )}
        <div className="text-lg font-bold text-gray-900 pt-1">{service.price}€</div>
        {service.price > 0 && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Depósito de garantía: {Math.min(30, Math.max(5, Math.round(service.price * 0.2)))}€
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="+34 600 000 000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            rows={2}
            placeholder="Alergias, preferencias..."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition disabled:opacity-50"
        >
          {loading ? "Confirmando..." : "Confirmar reserva"}
        </button>
      </form>
    </div>
  );
}
