import { db } from "@/lib/db";
import { createPromoCode, deletePromoCode, togglePromoCode } from "./actions";

export const metadata = {
  title: "Códigos Promocionales — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const promos = await db.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="text-stone-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Códigos Promocionales</h1>
          <p className="text-stone-500">Descuentos para eventos y campañas</p>
        </div>

        {/* Create form */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Crear código</h2>
          <form action={createPromoCode} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Código</label>
              <input
                name="code"
                required
                placeholder="ROMERIA10"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm uppercase focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Tipo</label>
              <select
                name="discountType"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed_amount">Importe fijo (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Valor</label>
              <input
                name="discountValue"
                type="number"
                step="0.01"
                required
                placeholder="10"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Usos máximos</label>
              <input
                name="maxUses"
                type="number"
                placeholder="Sin límite"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-500 mb-1">Descripción</label>
              <input
                name="description"
                placeholder="Descuento para Romería Valle San Lorenzo"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Evento / Tag</label>
              <input
                name="eventTag"
                placeholder="romeria2026"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                Crear código
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-100 text-stone-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Código</th>
                  <th className="px-4 py-3 text-left font-medium">Descuento</th>
                  <th className="px-4 py-3 text-left font-medium">Usos</th>
                  <th className="px-4 py-3 text-left font-medium">Tag</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <p className="font-mono font-bold">{promo.code}</p>
                      <p className="text-xs text-stone-400">{promo.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      {promo.discountType === "percentage" ? (
                        <span className="font-semibold text-emerald-700">{promo.discountValue}%</span>
                      ) : (
                        <span className="font-semibold text-emerald-700">€{promo.discountValue}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-stone-600">
                        {promo.usedCount}
                        {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {promo.eventTag ? (
                        <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          {promo.eventTag}
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          promo.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {promo.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <form action={togglePromoCode}>
                          <input type="hidden" name="id" value={promo.id} />
                          <button
                            type="submit"
                            className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded transition"
                          >
                            {promo.isActive ? "Desactivar" : "Activar"}
                          </button>
                        </form>
                        <form action={deletePromoCode}>
                          <input type="hidden" name="id" value={promo.id} />
                          <button
                            type="submit"
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded transition"
                          >
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {promos.length === 0 && (
            <div className="py-16 text-center text-stone-400">
              <div className="text-4xl mb-3">🏷️</div>
              <p>Aún no hay códigos promocionales</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
