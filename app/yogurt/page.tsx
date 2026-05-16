import { createYogurtLead } from "./actions";

export const metadata = {
  title: "Yogurt Griego Artesanal — Tenerife",
  description: "4 tarros por €10. Entrega mañana. Hecho en Tenerife.",
};

export default async function YogurtLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParamsResolved = await searchParams;
  const source = (searchParamsResolved.source as string) || "qr";
  const event = (searchParamsResolved.event as string) || "";
  const error = searchParamsResolved.error as string | undefined;

  return (
    <main className="min-h-screen bg-white text-stone-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white pt-16 pb-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Entregas activas en Santa Cruz & La Laguna
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-stone-900 sm:text-6xl">
            Yogurt Griego
            <br />
            <span className="text-emerald-600">Artesanal</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-stone-500">
            Hecho a mano en Tenerife con leche local. Sin aditivos. Alto en proteína.
            El auténtico sabor del Mediterráneo en tu mesa canaria.
          </p>

          <div className="mx-auto max-w-md rounded-3xl bg-white p-2 shadow-xl shadow-emerald-900/5 ring-1 ring-stone-100">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50">
              <img
                src="/yogurt-product-placeholder.svg"
                alt="Yogurt Griego Artesanal"
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: "🐐", title: "Leche local", desc: "De cabras y vacas de Tenerife. Km 0." },
              { icon: "🌿", title: "Sin aditivos", desc: "Fermentación natural. Sin azúcares añadidos." },
              { icon: "⚡", title: "Alto en proteína", desc: "15g de proteína por tarro. Ideal para deportistas." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-stone-100 bg-stone-50 p-6 text-center">
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-1 font-semibold text-stone-900">{f.title}</h3>
                <p className="text-sm text-stone-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 bg-stone-50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-stone-900">Elige tu pack</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* One-time */}
            <div className="rounded-2xl border border-stone-200 bg-white p-8">
              <p className="text-sm font-medium text-stone-500">Pack único</p>
              <p className="mt-2 text-4xl font-extrabold text-stone-900">€10</p>
              <p className="mt-1 text-stone-500">4 tarros de 450g</p>
              <ul className="mt-6 space-y-3 text-sm text-stone-600">
                <li className="flex items-center gap-2">✅ Entrega gratis mañana</li>
                <li className="flex items-center gap-2">✅ Santa Cruz / La Laguna</li>
                <li className="flex items-center gap-2">✅ Paga solo cuando recibas</li>
              </ul>
            </div>
            {/* Subscription */}
            <div className="relative rounded-2xl border-2 border-emerald-600 bg-white p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                MÁS POPULAR
              </div>
              <p className="text-sm font-medium text-stone-500">Suscripción semanal</p>
              <p className="mt-2 text-4xl font-extrabold text-stone-900">€8<span className="text-lg font-normal text-stone-500">/sem</span></p>
              <p className="mt-1 text-stone-500">4 tarros cada semana · Ahorra 20%</p>
              <ul className="mt-6 space-y-3 text-sm text-stone-600">
                <li className="flex items-center gap-2">✅ Todo lo del pack único</li>
                <li className="flex items-center gap-2">✅ Entrega automática semanal</li>
                <li className="flex items-center gap-2">✅ Pausa o cancela cuando quieras</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-md px-6">
          {error ? (
            <div className="rounded-2xl bg-red-50 p-8 text-center border border-red-200">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-lg font-bold text-red-700">Algo falló</h2>
              <p className="mt-2 text-red-600">
                {error === "missing-fields"
                  ? "Faltan datos obligatorios. Rellena nombre, WhatsApp y dirección."
                  : error === "cancelled"
                  ? "No te preocupes. Puedes intentarlo de nuevo."
                  : "Error con el pago. Inténtalo de nuevo o escríbenos por WhatsApp."}
              </p>
              <a href="/yogurt" className="mt-4 inline-block rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white hover:bg-red-700 transition">
                Volver
              </a>
            </div>
          ) : (
            <form
              action={createYogurtLead}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4"
            >
              <h2 className="text-lg font-semibold text-center">Haz tu pedido</h2>

              <input type="hidden" name="source" value={source} />
              <input type="hidden" name="eventLocation" value={event} />

              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <input type="radio" name="orderType" value="one-time" defaultChecked className="peer sr-only" />
                  <div className="rounded-xl border-2 border-stone-200 p-3 text-center peer-checked:border-emerald-600 peer-checked:bg-emerald-50 transition">
                    <p className="text-sm font-semibold">Una vez</p>
                    <p className="text-lg font-bold text-emerald-700">€10</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="orderType" value="subscription" className="peer sr-only" />
                  <div className="rounded-xl border-2 border-stone-200 p-3 text-center peer-checked:border-emerald-600 peer-checked:bg-emerald-50 transition">
                    <p className="text-sm font-semibold">Semanal</p>
                    <p className="text-lg font-bold text-emerald-700">€8<span className="text-xs font-normal text-stone-500">/sem</span></p>
                    <p className="text-xs text-emerald-600 font-medium">Ahorra 20%</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Nombre</label>
                <input name="name" required placeholder="Tu nombre" className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">WhatsApp <span className="text-red-500">*</span></label>
                <input name="phone" type="tel" required placeholder="622 123 456" className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Dirección de entrega <span className="text-red-500">*</span></label>
                <input name="address" required placeholder="Calle, número, barrio" className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-stone-400 mt-1">Santa Cruz / La Laguna</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Email (opcional)</label>
                <input name="email" type="email" placeholder="tú@email.com" className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <button type="submit" className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white hover:bg-emerald-700 transition active:scale-[0.98]">
                Pagar con Stripe — €10
              </button>
              <p className="text-center text-xs text-stone-400">Pago seguro. Cancela cuando quieras.</p>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-100 py-10 text-center text-sm text-stone-400">
        Yogurt Griego Artesanal · Tenerife · Hecho a mano con ❤️
      </footer>
    </main>
  );
}
