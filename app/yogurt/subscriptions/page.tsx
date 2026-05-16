"use client";

import { useState } from "react";
import { getSubscriptionsByPhone, createPortalSession } from "../actions";

export default function SubscriptionsPage() {
  const [phone, setPhone] = useState("");
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getSubscriptionsByPhone(phone);
      setSubs(data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const statusLabels: Record<string, { text: string; color: string }> = {
    active: { text: "Activa", color: "bg-emerald-100 text-emerald-700" },
    paused: { text: "Pausada", color: "bg-amber-100 text-amber-700" },
    cancelled: { text: "Cancelada", color: "bg-red-100 text-red-700" },
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Mis suscripciones</h1>
          <p className="text-stone-500">Gestiona tu suscripción semanal de Yogurt Griego</p>
        </div>

        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 612 345 678"
              className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>

        {searched && subs.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-stone-500">No encontramos suscripciones con este número.</p>
            <p className="text-sm text-stone-400 mt-1">
              Asegúrate de introducir el mismo número que usaste al suscribirte.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {subs.map((sub) => {
            const status = statusLabels[sub.status] || { text: sub.status, color: "bg-stone-100 text-stone-600" };
            return (
              <div key={sub.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-stone-400">Suscripción #{sub.id.slice(0, 8)}</p>
                    <p className="text-sm text-stone-400">
                      {sub.frequency === "weekly" ? "Semanal" : sub.frequency}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                    {status.text}
                  </span>
                </div>

                {sub.nextDelivery && (
                  <div className="mb-4 rounded-xl bg-emerald-50 p-3">
                    <p className="text-sm text-emerald-800 font-medium">
                      🚚 Próxima entrega:{" "}
                      {new Date(sub.nextDelivery).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {sub.status === "active" && sub.stripeCustomerId && (
                    <form action={createPortalSession} className="flex-1">
                      <input type="hidden" name="subscriptionId" value={sub.id} />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        Administrar suscripción
                      </button>
                    </form>
                  )}
                </div>

                <p className="mt-3 text-xs text-stone-400">
                  Desde aquí puedes pausar, cambiar la frecuencia o cancelar tu suscripción.
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a href="/yogurt" className="text-sm text-stone-400 hover:text-stone-600">
            ← Volver a la tienda
          </a>
        </div>
      </div>
    </main>
  );
}
