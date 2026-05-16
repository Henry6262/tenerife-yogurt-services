"use client";

import { useState } from "react";
import { getOrdersByPhone } from "../actions";

export default function OrderTrackingPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getOrdersByPhone(phone);
      setOrders(data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const statusLabels: Record<string, { text: string; color: string }> = {
    pending: { text: "Pendiente", color: "bg-amber-100 text-amber-700" },
    confirmed: { text: "Confirmado", color: "bg-blue-100 text-blue-700" },
    preparing: { text: "Preparando", color: "bg-purple-100 text-purple-700" },
    out_for_delivery: { text: "En reparto", color: "bg-orange-100 text-orange-700" },
    delivered: { text: "Entregado", color: "bg-emerald-100 text-emerald-700" },
    cancelled: { text: "Cancelado", color: "bg-red-100 text-red-700" },
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Rastrea tu pedido</h1>
          <p className="text-stone-500">Introduce tu número de WhatsApp para ver tus pedidos</p>
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

        {searched && orders.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-stone-500">No encontramos pedidos con este número.</p>
            <p className="text-sm text-stone-400 mt-1">
              Asegúrate de introducir el mismo número que usaste al pagar.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusLabels[order.status] || { text: order.status, color: "bg-stone-100 text-stone-600" };
            return (
              <div key={order.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-stone-400">Pedido #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                    {status.text}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.productName} × {item.quantity}</span>
                      <span className="font-medium">€{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                  <span className="text-sm text-stone-500">Total</span>
                  <span className="text-lg font-bold text-emerald-700">€{order.total.toFixed(2)}</span>
                </div>

                {order.deliveryTimeSlot && (
                  <p className="mt-2 text-xs text-emerald-600">
                    🕐 Entrega: {order.deliveryTimeSlot}
                  </p>
                )}
                {order.address && (
                  <p className="mt-1 text-xs text-stone-400">
                    📍 {order.address}
                  </p>
                )}
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
