import { redirect } from "next/navigation";

export const metadata = {
  title: "Mis Citas — Bookit AI",
};

export default function BookingsLookupPage() {
  async function lookup(formData: FormData) {
    "use server";
    const phone = formData.get("phone") as string;
    if (!phone) return;
    const clean = phone.replace(/\D/g, "");
    redirect(`/bookings/${clean}`);
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            T
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Mis Citas</h1>
          <p className="text-stone-500 text-sm mt-1">Introduce tu teléfono para ver tus reservas</p>
        </div>

        <form action={lookup} className="space-y-4">
          <input
            name="phone"
            type="tel"
            required
            placeholder="+34 612 345 678"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 transition"
          >
            Buscar mis citas
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6">
          ¿Necesitas una cita nueva? Habla con nuestro{" "}
          <a href="/" className="text-emerald-600 hover:underline">AI Agent</a>
        </p>
      </div>
    </main>
  );
}
