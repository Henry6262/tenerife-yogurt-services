import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { createBusiness } from "../actions";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const existing = await db.business.findFirst({ where: { ownerId: userId } });
  if (existing) redirect("/admin");

  return (
    <main className="text-stone-900">
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Bienvenido a Bookit AI</h1>
          <p className="text-stone-500">Crea tu negocio para empezar a recibir reservas con IA</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <form action={createBusiness} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nombre del negocio</label>
              <input
                name="name"
                required
                placeholder="Bella Tenerife Beauty"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Slug (URL)</label>
              <input
                name="slug"
                required
                placeholder="bella-tenerife"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-xs text-stone-400 mt-1">tu-agente será accesible en /agent/tu-slug</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de negocio</label>
              <select
                name="type"
                required
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="salon">Salón de belleza</option>
                <option value="spa">Spa</option>
                <option value="barbershop">Barbería</option>
                <option value="nail_studio">Nail Studio</option>
                <option value="wellness">Bienestar</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Dirección</label>
              <input
                name="address"
                required
                placeholder="Calle de la Constitución, 12, Santa Cruz"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono</label>
              <input
                name="phone"
                required
                placeholder="+34 612 345 678"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="hola@tunegocio.com"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 transition"
            >
              Crear mi negocio
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
