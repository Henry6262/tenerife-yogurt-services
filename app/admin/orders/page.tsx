import { db } from "@/lib/db";
import { updateOrderStatus } from "@/app/yogurt/actions";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Gestión de Pedidos — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const statusLabels: Record<string, { text: string; color: string }> = {
    pending: { text: "Pendiente", color: "bg-amber-100 text-amber-700" },
    confirmed: { text: "Confirmado", color: "bg-blue-100 text-blue-700" },
    preparing: { text: "Preparando", color: "bg-purple-100 text-purple-700" },
    out_for_delivery: { text: "En reparto", color: "bg-orange-100 text-orange-700" },
    delivered: { text: "Entregado", color: "bg-emerald-100 text-emerald-700" },
    cancelled: { text: "Cancelado", color: "bg-red-100 text-red-700" },
  };

  async function updateStatus(formData: FormData) {
    "use server";
    const orderId = formData.get("orderId") as string;
    const status = formData.get("status") as string;
    await updateOrderStatus(orderId, status);
    revalidatePath("/admin/orders");
  }

  const revenue = orders
    .filter((o) => o.paymentStatus === "paid" && o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pedidos</h1>
            <p className="text-stone-500">Gestión de pedidos y entregas</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-500">Ingresos totales</p>
            <p className="text-2xl font-bold text-emerald-700">€{revenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pendientes", count: orders.filter((o) => o.status === "pending").length },
            { label: "En preparación", count: orders.filter((o) => o.status === "preparing").length },
            { label: "En reparto", count: orders.filter((o) => o.status === "out_for_delivery").length },
            { label: "Entregados", count: orders.filter((o) => o.status === "delivered").length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="text-sm text-stone-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.count}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-100 text-stone-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Productos</th>
                  <th className="px-4 py-3 text-left font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => {
                  const status = statusLabels[order.status] || { text: order.status, color: "bg-stone-100 text-stone-600" };
                  return (
                    <tr key={order.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-stone-400">{order.customerPhone}</p>
                        {order.address && <p className="text-xs text-stone-400 mt-0.5">📍 {order.address}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {order.items.map((item) => (
                          <p key={item.id} className="text-xs">
                            {item.productName} × {item.quantity}
                          </p>
                        ))}
                        {order.deliveryTimeSlot && (
                          <p className="text-xs text-emerald-600 mt-1">🕐 {order.deliveryTimeSlot}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">€{order.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <form action={updateStatus} className="flex gap-2">
                          <input type="hidden" name="orderId" value={order.id} />
                          <select
                            name="status"
                            defaultValue={order.status}
                            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="preparing">Preparando</option>
                            <option value="out_for_delivery">En reparto</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 transition"
                          >
                            OK
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="py-16 text-center text-stone-400">
              <div className="text-4xl mb-3">📦</div>
              <p>Aún no hay pedidos</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
