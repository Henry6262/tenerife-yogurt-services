import { db } from "@/lib/db";
import ProductGrid from "./ProductGrid";

export const metadata = {
  title: "Yogurt Griego Artesanal — Tenerife",
  description: "Hecho a mano en Tenerife. Entrega gratis Santa Cruz / La Laguna.",
};

export default async function YogurtStorePage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      {/* HERO */}
      <section className="bg-gradient-to-b from-emerald-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Entregas activas en Santa Cruz & La Laguna
          </div>
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-6xl">
            Yogurt Griego <span className="text-emerald-600">Artesanal</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-stone-500">
            Hecho a mano en Tenerife con leche local. Sin aditivos. Alto en proteína.
          </p>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-2 text-center text-3xl font-bold">Nuestros packs</h2>
          <p className="mb-10 text-center text-stone-500">
            Elige el que mejor se adapte a ti
          </p>
          <ProductGrid products={products} />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold">Cómo funciona</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Elige tu pack",
                desc: "Selecciona el pack o suscripción que prefieras.",
              },
              {
                step: "2",
                title: "Paga seguro",
                desc: "Pago con Stripe. Recibimos tu pedido al instante.",
              },
              {
                step: "3",
                title: "Recibe mañana",
                desc: "Entrega gratis en Santa Cruz / La Laguna.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                  {s.step}
                </div>
                <h3 className="mb-2 font-semibold">{s.title}</h3>
                <p className="text-sm text-stone-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRACK ORDER CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-md px-6 text-center">
          <h2 className="mb-4 text-2xl font-bold">¿Ya pediste?</h2>
          <p className="mb-6 text-stone-500">
            Rastrea tu pedido con tu número de WhatsApp
          </p>
          <a
            href="/yogurt/orders"
            className="inline-block rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700 transition"
          >
            Ver mis pedidos
          </a>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-10 text-center text-sm text-stone-400">
        <p>Yogurt Griego Artesanal · Tenerife · Hecho a mano con ❤️</p>
      </footer>
    </main>
  );
}
