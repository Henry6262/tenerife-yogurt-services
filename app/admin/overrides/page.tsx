import { redirect } from "next/navigation";
import { getCurrentUserBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { createOverride, deleteOverride } from "../actions";

export const metadata = {
  title: "Excepciones — Admin",
};

export const dynamic = "force-dynamic";

export default async function OverridesPage() {
  const business = await getCurrentUserBusiness();
  if (!business) redirect("/admin/onboarding");

  const overrides = await db.staffOverride.findMany({
    where: {
      staff: { businessId: business.id },
      date: { gte: new Date().toISOString().slice(0, 10) },
    },
    include: { staff: true },
    orderBy: { date: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Excepciones de horario</h1>
        <p className="text-gray-500 text-sm">Marca días libres o cambios de horario para tu equipo</p>
      </div>

      {/* Create form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">Añadir excepción</h2>
        <form action={createOverride} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Profesional</label>
            <select name="staffId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {business.staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" name="date" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
            <select name="isClosed" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="true">Cerrado / Libre</option>
              <option value="false">Horario especial</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Inicio (opcional)</label>
            <input type="time" name="startMinute" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fin (opcional)</label>
            <input type="time" name="endMinute" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="lg:col-span-5">
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
              Añadir excepción
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Próximas excepciones</h2>
        </div>
        {overrides.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            No hay excepciones programadas.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {overrides.map((o) => (
              <div key={o.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{o.staff.name}</div>
                  <div className="text-xs text-gray-500">
                    {o.date} · {o.isClosed ? "Cerrado / Libre" : `Horario especial: ${minutesToTime(o.startMinute)} - ${minutesToTime(o.endMinute)}`}
                  </div>
                </div>
                <form action={deleteOverride}>
                  <input type="hidden" name="id" value={o.id} />
                  <button type="submit" className="text-xs text-red-600 hover:text-red-700">
                    Eliminar
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function minutesToTime(minutes: number | null): string {
  if (minutes === null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
