import { db } from "@/lib/db";
import Link from "next/link";
import { Calendar, Users, Scissors, TrendingUp, Bot, ExternalLink, ArrowRight, ShoppingBag, Package, Milk } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareAgent } from "@/components/share-agent";

export default async function AdminPage() {
  const businesses = await db.business.findMany({
    include: {
      services: true,
      staff: true,
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { service: true, staff: true },
      },
      agentConfig: true,
    },
  });

  const products = await db.product.findMany();
  const orders = await db.order.findMany({ include: { items: true } });
  const yogurtRevenue = orders
    .filter((o) => o.paymentStatus === "paid" && o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "preparing").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
          <p className="text-gray-500 text-sm">Gestiona tus negocios y agentes IA</p>
        </div>
        <Link href="/admin/agent">
          <Button>
            <Bot className="w-4 h-4 mr-2" />
            Configurar AI Agent
          </Button>
        </Link>
      </div>

      {businesses.map((business) => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayBookings = business.bookings.filter((b) => b.startsAt.toISOString().slice(0, 10) === todayStr);
        const cfg = business.agentConfig;

        return (
          <div key={business.id} className="mb-10">
            {/* Business header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{business.name}</h2>
                <p className="text-sm text-slate-500">{business.address}</p>
              </div>
              {cfg && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: `${cfg.primaryColor}15`, color: cfg.primaryColor }}>
                  <Bot className="w-4 h-4" />
                  {cfg.agentName} está activo
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><Calendar className="w-4 h-4" /> Hoy</div>
                  <div className="text-2xl font-bold text-slate-900">{todayBookings.length}</div>
                  <div className="text-xs text-slate-400">citas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><TrendingUp className="w-4 h-4" /> Total</div>
                  <div className="text-2xl font-bold text-slate-900">{business.bookings.length}</div>
                  <div className="text-xs text-slate-400">reservas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><Scissors className="w-4 h-4" /> Servicios</div>
                  <div className="text-2xl font-bold text-slate-900">{business.services.length}</div>
                  <div className="text-xs text-slate-400">activos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><Users className="w-4 h-4" /> Staff</div>
                  <div className="text-2xl font-bold text-slate-900">{business.staff.length}</div>
                  <div className="text-xs text-slate-400">miembros</div>
                </CardContent>
              </Card>
            </div>

            {/* Share agent */}
            {cfg && (
              <div className="mb-6">
                <ShareAgent
                  businessSlug={business.slug}
                  businessName={business.name}
                  agentName={cfg.agentName}
                  primaryColor={cfg.primaryColor}
                />
              </div>
            )}

            {/* Recent bookings */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Reservas recientes</CardTitle>
                  <Link href="/admin/calendar" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    Ver calendario <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-slate-100">
                  {business.bookings.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      Aún no hay reservas. Comparte tu agente con clientes.
                    </div>
                  ) : (
                    business.bookings.map((b) => (
                      <div key={b.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{
                            backgroundColor: b.status === "confirmed" ? "#10b981" : b.status === "cancelled" ? "#ef4444" : "#f59e0b"
                          }} />
                          <div>
                            <div className="text-sm font-medium text-slate-900">{b.service.name}</div>
                            <div className="text-xs text-slate-500">{b.customerName} · {b.customerPhone}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900">{b.startsAt.toISOString().slice(11, 16)}</div>
                          <div className="text-xs text-slate-500">{b.startsAt.toISOString().slice(0, 10)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}

      {/* Yogurt E-commerce Section */}
      <div className="mt-12 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Milk className="w-5 h-5 text-emerald-600" />
              Yogurt Griego — E-commerce
            </h2>
            <p className="text-gray-500 text-sm">Pedidos, productos y suscripciones</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Pedidos
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Productos
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><TrendingUp className="w-4 h-4" /> Ingresos</div>
              <div className="text-2xl font-bold text-emerald-700">€{yogurtRevenue.toFixed(0)}</div>
              <div className="text-xs text-slate-400">pagados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><ShoppingBag className="w-4 h-4" /> Pedidos</div>
              <div className="text-2xl font-bold text-slate-900">{orders.length}</div>
              <div className="text-xs text-slate-400">total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><Package className="w-4 h-4" /> Productos</div>
              <div className="text-2xl font-bold text-slate-900">{products.length}</div>
              <div className="text-xs text-slate-400">{products.filter((p) => p.isActive).length} activos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><Calendar className="w-4 h-4" /> Pendientes</div>
              <div className="text-2xl font-bold text-amber-600">{pendingOrders}</div>
              <div className="text-xs text-slate-400">por entregar</div>
            </CardContent>
          </Card>
        </div>

        {/* Low stock alerts */}
        {products.some((p) => p.stock <= 5 && p.isActive) && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Stock bajo</p>
            <div className="flex flex-wrap gap-2">
              {products.filter((p) => p.stock <= 5 && p.isActive).map((p) => (
                <Link key={p.id} href="/admin/products">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
                    {p.name}: {p.stock} restantes
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent yogurt orders */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Pedidos recientes</CardTitle>
              <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  Aún no hay pedidos. Comparte la tienda con clientes.
                </div>
              ) : (
                orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        o.status === "delivered" ? "bg-emerald-500" :
                        o.status === "cancelled" ? "bg-red-500" : "bg-amber-500"
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{o.customerName}</div>
                        <div className="text-xs text-slate-500">{o.items.map((i) => i.productName).join(", ")}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-emerald-700">€{o.total.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">{o.status}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
