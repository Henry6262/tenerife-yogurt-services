import { redirect } from "next/navigation";
import { getCurrentUserBusiness } from "@/lib/auth";
import Link from "next/link";
import { Calendar, Users, Scissors, TrendingUp, Bot, ArrowRight, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareAgent } from "@/components/share-agent";

export default async function AdminPage() {
  const business = await getCurrentUserBusiness();
  if (!business) redirect("/admin/onboarding");

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBookings = business.bookings.filter((b) => b.startsAt.toISOString().slice(0, 10) === todayStr);
  const upcomingBookings = business.bookings.filter((b) => b.startsAt >= new Date() && b.status !== "cancelled");
  const totalRevenue = business.bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.service?.price || 0), 0);
  const depositsCollected = business.bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.depositAmount, 0);

  // Weekly stats
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  const thisWeekBookings = business.bookings.filter((b) => b.startsAt >= weekStart && b.startsAt <= weekEnd && b.status !== "cancelled");
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekEnd);
  lastWeekEnd.setDate(weekEnd.getDate() - 7);
  const lastWeekBookings = business.bookings.filter((b) => b.startsAt >= lastWeekStart && b.startsAt <= lastWeekEnd && b.status !== "cancelled");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
          <p className="text-gray-500 text-sm">{business.name}</p>
        </div>
        <Link href="/admin/agent">
          <Button>
            <Bot className="w-4 h-4 mr-2" />
            Configurar AI Agent
          </Button>
        </Link>
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
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><TrendingUp className="w-4 h-4" /> Esta semana</div>
            <div className="text-2xl font-bold text-slate-900">{thisWeekBookings.length}</div>
            <div className="text-xs text-slate-400">{lastWeekBookings.length} la semana pasada</div>
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
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><TrendingUp className="w-4 h-4" /> Ingresos</div>
            <div className="text-2xl font-bold text-slate-900">{totalRevenue}€</div>
            <div className="text-xs text-slate-400">{depositsCollected}€ depósitos</div>
          </CardContent>
        </Card>
      </div>

      {/* Getting started checklist */}
      {(business.services.length === 0 || business.staff.length === 0 || !business.agentConfig) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Primeros pasos</h3>
          <div className="space-y-3">
            <ChecklistItem
              done={business.services.length > 0}
              href="/admin/services"
              label="Añade tus servicios"
              description="Corte de pelo, manicura, masajes..."
            />
            <ChecklistItem
              done={business.staff.length > 0}
              href="/admin/staff"
              label="Añade tu equipo"
              description="Profesionales que atienden citas"
            />
            <ChecklistItem
              done={!!business.agentConfig}
              href="/admin/agent"
              label="Configura tu IA"
              description="Personaliza el chatbot para tus clientes"
            />
          </div>
        </div>
      )}

      {/* Share agent */}
      {business.agentConfig && business.services.length > 0 && business.staff.length > 0 && (
        <div className="mb-6">
          <ShareAgent
            businessSlug={business.slug}
            businessName={business.name}
            agentName={business.agentConfig.agentName}
            primaryColor={business.agentConfig.primaryColor}
          />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <div className="md:col-span-2">
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

        {/* Top services */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Servicios más reservados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {business.services.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    Aún no hay servicios.
                  </div>
                ) : (
                  business.services.map((s) => {
                    const count = business.bookings.filter((b) => b.serviceId === s.id && b.status !== "cancelled").length;
                    return (
                      <div key={s.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.colorCode }} />
                          <span className="text-sm text-slate-700">{s.name}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{count}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({
  done,
  href,
  label,
  description,
}: {
  done: boolean;
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 rounded-lg transition ${
        done ? "bg-gray-50 opacity-60" : "bg-blue-50 hover:bg-blue-100"
      }`}
    >
      {done ? (
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
      ) : (
        <Circle className="w-5 h-5 text-blue-500 shrink-0" />
      )}
      <div>
        <div className={`text-sm font-medium ${done ? "text-gray-500 line-through" : "text-blue-900"}`}>
          {label}
        </div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </Link>
  );
}
