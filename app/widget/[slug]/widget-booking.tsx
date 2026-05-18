"use client";

import { useState } from "react";
import { createWidgetBooking } from "./actions";
import { BookingPayment } from "@/components/booking-payment";
import { Calendar, Clock, User, CheckCircle, ArrowLeft, Scissors } from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  services: { id: string; name: string; durationMinutes: number; price: number; description: string | null; colorCode: string }[];
  staff: { id: string; name: string; colorCode: string; staffServices: { serviceId: string }[] }[];
}

export function WidgetBooking({
  business,
  preselectedService,
  preselectedStaff,
  preselectedDate,
}: {
  business: BusinessData;
  preselectedService?: string;
  preselectedStaff?: string;
  preselectedDate?: string;
}) {
  const [step, setStep] = useState(preselectedService ? 2 : 1);
  const [selectedService, setSelectedService] = useState(preselectedService || "");
  const [selectedStaff, setSelectedStaff] = useState(preselectedStaff || "");
  const [selectedDate, setSelectedDate] = useState(preselectedDate || "");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<{ time: string; iso: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);

  const service = business.services.find((s) => s.id === selectedService);
  const staffList = selectedService
    ? business.staff.filter((s) => s.staffServices.some((ss) => ss.serviceId === selectedService))
    : business.staff;

  const loadSlots = async (staffId: string, date: string) => {
    if (!service) return;
    setLoadingSlots(true);
    setSlotsError("");
    try {
      const res = await fetch(`/api/slots?staffId=${staffId}&date=${date}&serviceId=${service.id}`);
      const data = await res.json();
      if (data.error) {
        setSlotsError("Error al cargar horarios");
        setSlots([]);
      } else {
        setSlots(data.slots || []);
      }
    } catch {
      setSlotsError("Error de conexión. Inténtalo de nuevo.");
      setSlots([]);
    }
    setLoadingSlots(false);
  };

  const handleBook = async () => {
    if (!customerName || !customerPhone || !selectedTime) {
      setError("Completa todos los campos obligatorios");
      return;
    }
    setBookingLoading(true);
    setError("");

    const result = await createWidgetBooking({
      businessId: business.id,
      serviceId: selectedService,
      staffId: selectedStaff,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      startsAt: selectedTime,
      notes: notes || undefined,
    });

    setBookingLoading(false);
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
      setError("No se pudo completar la reserva");
    }
  };

  if (done && bookingId) {
    return (
      <div className="p-6 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-1">¡Reserva confirmada!</h2>
        <p className="text-sm text-gray-500 mb-4">Te esperamos en {business.name}</p>
        <a
          href={`/bookings/confirmation/${bookingId}`}
          target="_blank"
          className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          Ver detalles de mi cita
        </a>
      </div>
    );
  }

  if (paymentRequired && clientSecret && bookingId) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Depósito requerido</h2>
        <p className="text-sm text-gray-500 mb-4">
          Para garantizar tu cita, paga un depósito de <strong>{depositAmount}€</strong>
        </p>
        <BookingPayment clientSecret={clientSecret} amount={depositAmount} onSuccess={() => setDone(true)} />
      </div>
    );
  }

  // Step 1: Service selection
  if (step === 1) {
    return (
      <div className="p-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">{business.name}</h2>
          <p className="text-sm text-gray-500">Reserva tu cita online</p>
        </div>
        <div className="space-y-2">
          {business.services.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelectedService(s.id); setStep(2); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition text-left"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: s.colorCode }}>
                <Scissors className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{s.name}</div>
                <div className="text-xs text-gray-500">{s.durationMinutes} min · {s.price}€</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Staff and date
  if (step === 2 && service) {
    return (
      <div className="p-4">
        <button onClick={() => setStep(1)} className="text-sm text-gray-500 flex items-center gap-1 mb-3">
          <ArrowLeft className="w-3 h-3" /> Volver
        </button>
        <h2 className="text-lg font-bold text-gray-900 mb-1">{service.name}</h2>
        <p className="text-sm text-gray-500 mb-4">Elige profesional y fecha</p>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Profesional</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {staffList.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedStaff(s.id); setSelectedDate(""); setSlots([]); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  selectedStaff === s.id
                    ? "text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={selectedStaff === s.id ? { backgroundColor: s.colorCode } : {}}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {selectedStaff && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (e.target.value) loadSlots(selectedStaff, e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        )}

        {loadingSlots && <p className="text-sm text-gray-400 text-center py-4">Cargando horarios...</p>}

        {slotsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-sm text-red-600">{slotsError}</p>
            <button
              onClick={() => selectedStaff && selectedDate && loadSlots(selectedStaff, selectedDate)}
              className="mt-2 text-xs text-red-700 underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {slots.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Horario</label>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.iso}
                  onClick={() => { setSelectedTime(slot.iso); setStep(3); }}
                  className={`py-2 rounded-lg text-sm font-medium transition ${
                    selectedTime === slot.iso
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDate && !loadingSlots && slots.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No hay horarios disponibles</p>
        )}
      </div>
    );
  }

  // Step 3: Customer details
  if (step === 3 && service && selectedTime) {
    const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const displayTime = selectedTime.slice(11, 16);

    return (
      <div className="p-4">
        <button onClick={() => setStep(2)} className="text-sm text-gray-500 flex items-center gap-1 mb-3">
          <ArrowLeft className="w-3 h-3" /> Volver
        </button>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Confirma tu reserva</h2>

        <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1 text-sm">
          <div className="flex items-center gap-2"><Scissors className="w-4 h-4 text-gray-400" /> {service.name}</div>
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> {displayDate}</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> {displayTime}</div>
          <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> {business.staff.find((s) => s.id === selectedStaff)?.name}</div>
          <div className="font-bold text-gray-900 pt-1">{service.price}€</div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono *</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="+34 600 000 000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={2}
              placeholder="Alergias, preferencias..."
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <button
          onClick={handleBook}
          disabled={bookingLoading}
          className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {bookingLoading ? "Confirmando..." : "Confirmar reserva"}
        </button>
      </div>
    );
  }

  return null;
}
