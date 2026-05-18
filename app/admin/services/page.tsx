import { redirect } from "next/navigation";
import { getCurrentUserBusiness } from "@/lib/auth";
import { createService, updateService, deleteService } from "../actions";

export const metadata = {
  title: "Servicios — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const business = await getCurrentUserBusiness();
  if (!business) redirect("/admin/onboarding");

  return (
    <main className="text-stone-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Servicios</h1>
            <p className="text-stone-500">Gestiona los servicios de {business.name}</p>
          </div>
        </div>

        {/* Create form */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Añadir servicio</h2>
          <form action={createService} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <input type="hidden" name="businessId" value={business.id} />
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Nombre</label>
              <input name="name" required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Duración (min)</label>
              <input name="durationMinutes" type="number" required defaultValue={60} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Precio (€)</label>
              <input name="price" type="number" step="0.01" required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Color</label>
              <input name="colorCode" type="color" defaultValue="#f43f5e" className="w-full h-9 rounded-lg border border-stone-200 px-2" />
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
              <label className="block text-xs font-medium text-stone-500 mb-1">Descripción</label>
              <input name="description" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="flex items-end lg:col-span-5">
              <button type="submit" className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                Añadir servicio
              </button>
            </div>
          </form>
        </div>

        {/* Service list */}
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-100 text-stone-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium">Duración</th>
                  <th className="px-4 py-3 text-left font-medium">Precio</th>
                  <th className="px-4 py-3 text-left font-medium">Color</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {business.services.map((service) => (
                  <tr key={service.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-stone-400">{service.description}</p>
                    </td>
                    <td className="px-4 py-3">{service.durationMinutes} min</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">€{service.price}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block h-4 w-4 rounded-full border border-stone-200" style={{ backgroundColor: service.colorCode }} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${service.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                        {service.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <details className="group">
                        <summary className="cursor-pointer text-xs text-blue-600 hover:underline">Editar</summary>
                        <form action={updateService} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                          <input type="hidden" name="id" value={service.id} />
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Nombre</label>
                            <input name="name" defaultValue={service.name} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Duración</label>
                            <input name="durationMinutes" type="number" defaultValue={service.durationMinutes} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Precio</label>
                            <input name="price" type="number" step="0.01" defaultValue={service.price} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Color</label>
                            <input name="colorCode" type="color" defaultValue={service.colorCode} className="w-full h-9 rounded-lg border border-stone-200 px-2" />
                          </div>
                          <div className="sm:col-span-2 lg:col-span-5">
                            <label className="block text-xs font-medium text-stone-500 mb-1">Descripción</label>
                            <input name="description" defaultValue={service.description || ""} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div className="flex items-center gap-4 lg:col-span-5">
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" name="isActive" defaultChecked={service.isActive} className="rounded border-stone-300" />
                              Activo
                            </label>
                            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                              Guardar
                            </button>
                            <form action={deleteService}>
                              <input type="hidden" name="id" value={service.id} />
                              <button type="submit" className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 transition">
                                Eliminar
                              </button>
                            </form>
                          </div>
                        </form>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {business.services.length === 0 && (
            <div className="py-16 text-center text-stone-400">
              <div className="text-4xl mb-3">✂️</div>
              <p>Aún no hay servicios</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
