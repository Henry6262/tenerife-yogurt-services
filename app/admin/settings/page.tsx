import { redirect } from "next/navigation";
import { getCurrentUserBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Configuración — Admin",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const business = await getCurrentUserBusiness();
  if (!business) redirect("/admin/onboarding");

  async function updateBusiness(formData: FormData) {
    "use server";
    const business = await getCurrentUserBusiness();
    if (!business) redirect("/admin/onboarding");

    await db.business.update({
      where: { id: business.id },
      data: {
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        timezone: formData.get("timezone") as string,
      },
    });

    revalidatePath("/admin/settings");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-gray-500 text-sm">Gestiona los datos de tu negocio</p>
      </div>

      <form action={updateBusiness} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Datos del negocio</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              name="name"
              defaultValue={business.name}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              name="address"
              defaultValue={business.address}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                name="phone"
                defaultValue={business.phone}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={business.email || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
            <select
              name="timezone"
              defaultValue={business.timezone}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Atlantic/Canary">Canarias (GMT+0/+1)</option>
              <option value="Europe/Madrid">Madrid (CET/CEST)</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Identidad</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Slug</span>
              <p className="font-medium text-gray-900">{business.slug}</p>
            </div>
            <div>
              <span className="text-gray-500">Tipo</span>
              <p className="font-medium text-gray-900 capitalize">{business.type}</p>
            </div>
            <div>
              <span className="text-gray-500">Moneda</span>
              <p className="font-medium text-gray-900">{business.currency}</p>
            </div>
            <div>
              <span className="text-gray-500">Creado</span>
              <p className="font-medium text-gray-900">{business.createdAt.toLocaleDateString("es-ES")}</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
