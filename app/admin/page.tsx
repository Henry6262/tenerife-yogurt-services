import { db } from "@/lib/db";
import Link from "next/link";
import { Calendar, Users, Scissors, TrendingUp, Bot, ExternalLink, ArrowRight } from "lucide-react";
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
    </div>
  );
}
