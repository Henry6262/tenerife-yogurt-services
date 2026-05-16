"use client";

import { useCart } from "@/lib/cart";

export default function YogurtStorePage() {
  const { addItem, items } = useCart();

  const products = [
    {
      id: "pack-4",
      name: "Pack 4 Tarros",
      description: "4 tarros de 200g. Sabor natural. Perfecto para probar.",
      price: 10,
      comparePrice: 12,
      isSubscription: false,
      isBundle: false,
    },
    {
      id: "caja-semanal",
      name: "Caja Semanal",
      description: "4 tarros nuevos cada semana. Suscripción flexible. Pausa cuando quieras.",
      price: 8,
      isSubscription: true,
      isBundle: false,
    },
    {
      id: "pack-familiar",
      name: "Pack Familiar 8 Tarros",
      description: "8 tarros de 200g. Ahorra un 10% vs comprar packs sueltos.",
      price: 18,
      comparePrice: 20,
      isSubscription: false,
      isBundle: true,
    },
  ];

  const inCart = (id: string) => items.find((i) => i.productId === id)?.quantity || 0;

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
          <p className="mb-10 text-center text-stone-500">Elige el que mejor se adapte a ti</p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 aspect-square rounded-xl bg-stone-100 flex items-center justify-center">
                  <span className="text-4xl">🥛</span>
                </div>

                {product.isSubscription && (
                  <span className="mb-2 inline-block self-start rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                    Suscripción
                  </span>
                )}
                {product.isBundle && (
                  <span className="mb-2 inline-block self-start rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    Pack
                  </span>
                )}

                <h3 className="mb-1 text-lg font-semibold">{product.name}</h3>
                <p className="mb-4 flex-1 text-sm text-stone-500">{product.description}</p>

                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-700">€{product.price}</span>
                  {product.comparePrice && (
                    <span className="text-sm text-stone-400 line-through">
                      €{product.comparePrice}
                    </span>
                  )}
                </div>

                <button
                  onClick={() =>
                    addItem({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                    })
                  }
                  className="w-full rounded-xl bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 transition"
                >
                  {inCart(product.id) > 0
                    ? `Añadir otro (${inCart(product.id)} en carrito)`
                    : "Añadir al carrito"}
                </button>
              </div>
            ))}
          </div>
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
