import { db } from "@/lib/db";
import { cancelSubscription } from "@/app/yogurt/actions";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Suscripciones — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const subs = await db.yogurtSubscription.findMany({
    include: { lead: true },
    orderBy: { nextDelivery: "asc" },
  });

  const statusLabels: Record<string, { text: string; color: string }> = {
    active: { text: "Activa", color: "bg-emerald-100 text-emerald-700" },
    paused: { text: "Pausada", color: "bg-amber-100 text-amber-700" },
    cancelled: { text: "Cancelada", color: "bg-red-100 text-red-700" },
  };

  async function handleCancel(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await cancelSubscription(id);
    revalidatePath("/admin/subscriptions");
  }

  const activeCount = subs.filter((s) => s.status === "active").length;
  const monthlyRecurring = activeCount * 8 * 4; // €8/week * 4 weeks

  return (
    <main className="text-stone-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Suscripciones</h1>
            <p className="text-stone-500">Gestión de suscripciones semanales</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-500">MRR estimado</p>
            <p className="text-2xl font-bold text-emerald-700">€{monthlyRecurring.toFixed(0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Activas", count: activeCount, color: "text-emerald-700" },
            { label: "Pausadas", count: subs.filter((s) => s.status === "paused").length, color: "text-amber-700" },
            { label: "Canceladas", count: subs.filter((s) => s.status === "cancelled").length, color: "text-red-700" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="text-sm text-stone-500">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-100 text-stone-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">WhatsApp</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Frecuencia</th>
                  <th className="px-4 py-3 text-left font-medium">Próxima entrega</th>
                  <th className="px-4 py-3 text-left font-medium">Stripe ID</th>
                  <th className="px-4 py-3 text-left font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {subs.map((sub) => {
                  const status = statusLabels[sub.status] || { text: sub.status, color: "bg-stone-100 text-stone-600" };
                  return (
                    <tr key={sub.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-medium">{sub.lead.name}</td>
                      <td className="px-4 py-3 text-stone-500">{sub.lead.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-500 capitalize">{sub.frequency}</td>
                      <td className="px-4 py-3">
                        {sub.nextDelivery ? (
                          <span className="text-emerald-700 font-medium">
                            {new Date(sub.nextDelivery).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-stone-400">{sub.stripeSubscriptionId.slice(0, 12)}...</td>
                      <td className="px-4 py-3">
                        {sub.status === "active" && (
                          <form action={handleCancel}>
                            <input type="hidden" name="id" value={sub.id} />
                            <button
                              type="submit"
                              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded transition font-medium"
                            >
                              Cancelar
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {subs.length === 0 && (
            <div className="py-16 text-center text-stone-400">
              <div className="text-4xl mb-3">🥛</div>
              <p>Aún no hay suscripciones</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
