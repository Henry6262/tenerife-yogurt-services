import { redirect } from "next/navigation";
import { getCurrentUserBusiness } from "@/lib/auth";
import { db } from "@/lib/db";
import { createStaff, updateStaff, deleteStaff, updateStaffSchedule } from "../actions";

export const metadata = {
  title: "Staff — Admin",
};

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function parseTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export default async function AdminStaffPage() {
  const business = await getCurrentUserBusiness();
  if (!business) redirect("/admin/onboarding");

  const staffWithSchedules = await db.staff.findMany({
    where: { businessId: business.id },
    include: { schedules: true, staffServices: { include: { service: true } } },
    orderBy: { createdAt: "desc" },
  });

  const services = await db.service.findMany({ where: { businessId: business.id, isActive: true } });

  return (
    <main className="text-stone-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Staff</h1>
          <p className="text-stone-500">Gestiona tu equipo y horarios</p>
        </div>

        {/* Create form */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Añadir miembro</h2>
          <form action={createStaff} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input type="hidden" name="businessId" value={business.id} />
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Nombre</label>
              <input name="name" required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
              <input name="email" type="email" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Teléfono</label>
              <input name="phone" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Color</label>
              <input name="colorCode" type="color" defaultValue="#3b82f6" className="w-full h-9 rounded-lg border border-stone-200 px-2" />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-medium text-stone-500 mb-1">Bio</label>
              <input name="bio" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                Añadir miembro
              </button>
            </div>
          </form>
        </div>

        {/* Staff list */}
        <div className="space-y-6">
          {staffWithSchedules.map((member) => (
            <div key={member.id} className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
              <div className="p-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-white font-bold text-lg" style={{ backgroundColor: member.colorCode }}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{member.name}</p>
                    <p className="text-sm text-stone-500">{member.email} · {member.phone}</p>
                    {member.bio && <p className="text-xs text-stone-400 mt-1">{member.bio}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${member.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                    {member.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              {/* Schedule */}
              <div className="border-t border-stone-100 px-6 py-4">
                <p className="text-sm font-medium text-stone-700 mb-3">Horario semanal</p>
                <div className="grid grid-cols-7 gap-2">
                  {WEEKDAYS.map((day, i) => {
                    const schedule = member.schedules.find((s) => s.weekday === i);
                    return (
                      <form key={i} action={updateStaffSchedule} className="rounded-lg border border-stone-200 p-2">
                        <input type="hidden" name="staffId" value={member.id} />
                        <input type="hidden" name="weekday" value={i} />
                        <p className="text-xs font-medium text-stone-500 text-center mb-2">{day}</p>
                        <input
                          name="startMinute"
                          type="time"
                          defaultValue={schedule ? formatTime(schedule.startMinute) : "09:00"}
                          className="w-full rounded border border-stone-200 px-1 py-0.5 text-xs mb-1"
                          onChange={(e) => {
                            const form = e.target.closest("form") as HTMLFormElement;
                            form.requestSubmit();
                          }}
                        />
                        <input
                          name="endMinute"
                          type="time"
                          defaultValue={schedule ? formatTime(schedule.endMinute) : "18:00"}
                          className="w-full rounded border border-stone-200 px-1 py-0.5 text-xs"
                          onChange={(e) => {
                            const form = e.target.closest("form") as HTMLFormElement;
                            form.requestSubmit();
                          }}
                        />
                      </form>
                    );
                  })}
                </div>
              </div>

              {/* Edit/Delete */}
              <div className="border-t border-stone-100 px-6 py-4">
                <details className="group">
                  <summary className="cursor-pointer text-xs text-blue-600 hover:underline">Editar datos</summary>
                  <form action={updateStaff} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input type="hidden" name="id" value={member.id} />
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Nombre</label>
                      <input name="name" defaultValue={member.name} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
                      <input name="email" type="email" defaultValue={member.email || ""} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Teléfono</label>
                      <input name="phone" defaultValue={member.phone || ""} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Color</label>
                      <input name="colorCode" type="color" defaultValue={member.colorCode} className="w-full h-9 rounded-lg border border-stone-200 px-2" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <label className="block text-xs font-medium text-stone-500 mb-1">Bio</label>
                      <input name="bio" defaultValue={member.bio || ""} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div className="flex items-center gap-4 lg:col-span-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="isActive" defaultChecked={member.isActive} className="rounded border-stone-300" />
                        Activo
                      </label>
                      <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                        Guardar
                      </button>
                      <form action={deleteStaff}>
                        <input type="hidden" name="id" value={member.id} />
                        <button type="submit" className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 transition">
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </form>
                </details>
              </div>
            </div>
          ))}

          {staffWithSchedules.length === 0 && (
            <div className="py-16 text-center text-stone-400">
              <div className="text-4xl mb-3">👥</div>
              <p>Aún no hay miembros en el equipo</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
