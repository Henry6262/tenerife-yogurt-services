"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSlots, getSlotsAnyStaff } from "./actions";

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
  staff: StaffMember[];
  businessSlug: string;
  selectedStaff?: string;
  selectedDate?: string;
  selectedTime?: string;
}

export function TimePicker({
  service,
  staff,
  businessSlug,
  selectedStaff,
  selectedDate,
  selectedTime,
}: Props) {
  const router = useRouter();
  const [localDate, setLocalDate] = useState<string>(selectedDate ?? "");
  const [localStaff, setLocalStaff] = useState<string>(selectedStaff ?? "");
  const [slots, setSlots] = useState<{ time: string; isoStart: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickedTime, setPickedTime] = useState<string>(selectedTime ?? "");

  // Generate next 14 days
  const days: { label: string; value: string; weekday: string }[] = [];
  const weekdayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: d.getDate().toString(),
      value: d.toISOString().slice(0, 10),
      weekday: weekdayLabels[d.getDay()],
    });
  }

  useEffect(() => {
    if (!localDate) return;
    setLoading(true);
    const fetchSlots = async () => {
      let result;
      if (localStaff) {
        result = await getSlots(localStaff, localDate, service.id);
      } else {
        result = await getSlotsAnyStaff(localDate, service.id);
      }
      setSlots(result.slots);
      setLoading(false);
    };
    fetchSlots();
  }, [localDate, localStaff, service.id]);

  const handlePickTime = (isoStart: string) => {
    setPickedTime(isoStart);
    const url = new URL(window.location.href);
    url.searchParams.set("time", isoStart);
    url.searchParams.set("step", "3");
    router.push(url.toString());
  };

  return (
    <div className="space-y-6">
      {/* Staff picker */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Especialista</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLocalStaff("")}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
              !localStaff
                ? "border-rose-500 bg-rose-50 text-rose-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            Cualquiera disponible
          </button>
          {staff.map((s) => (
            <button
              key={s.id}
              onClick={() => setLocalStaff(s.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                localStaff === s.id
                  ? "border-rose-500 bg-rose-50 text-rose-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Date picker */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Fecha</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((day) => (
            <button
              key={day.value}
              onClick={() => {
                setLocalDate(day.value);
                setPickedTime("");
              }}
              className={`flex flex-col items-center min-w-[56px] p-2 rounded-xl border transition ${
                localDate === day.value
                  ? "border-rose-500 bg-rose-50 text-rose-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="text-xs text-gray-500">{day.weekday}</span>
              <span className="text-lg font-bold">{day.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slots */}
      {localDate && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Horarios disponibles</h3>
          {loading ? (
            <p className="text-gray-400 text-sm">Cargando horarios...</p>
          ) : slots.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No hay horarios disponibles para esta fecha. Prueba con otra.
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.isoStart}
                  onClick={() => handlePickTime(slot.isoStart)}
                  className={`py-2 rounded-lg text-sm font-medium border transition ${
                    pickedTime === slot.isoStart
                      ? "border-rose-500 bg-rose-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-rose-300 hover:text-rose-600"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
