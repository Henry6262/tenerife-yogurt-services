"use client";

import { useCart } from "@/lib/cart";
import { useState } from "react";
import { checkoutCart } from "../actions";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  async function handleCheckout() {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      const formData = new FormData();
      formData.append("items", JSON.stringify(items));
      await checkoutCart(formData);
    } catch (err) {
      console.error(err);
      setCheckingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 pt-20 pb-16">
      <div className="mx-auto max-w-2xl px-6">
        <h1 className="text-3xl font-bold mb-2">Tu carrito</h1>
        <p className="text-stone-500 mb-8">
          {totalItems === 0
            ? "Tu carrito está vacío"
            : `${totalItems} artículo${totalItems > 1 ? "s" : ""} en el carrito`}
        </p>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-stone-400 mb-6">Aún no has añadido nada</p>
            <a
              href="/yogurt"
              className="inline-block rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700 transition"
            >
              Ver productos
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-stone-100 text-2xl">
                    🥛
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-stone-500">€{item.price.toFixed(2)} / unidad</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="font-bold text-emerald-700">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-stone-400 hover:text-red-500 transition"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-500">Subtotal</span>
                <span className="font-medium">€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-stone-500">Envío</span>
                <span className="font-medium text-emerald-600">Gratis</span>
              </div>
              <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-emerald-700">€{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="flex-1 rounded-xl bg-emerald-600 py-3.5 font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {checkingOut ? "Redirigiendo a Stripe..." : "Pagar con Stripe"}
              </button>
              <button
                onClick={clearCart}
                className="rounded-xl border border-stone-200 bg-white px-6 py-3.5 font-medium text-stone-600 hover:bg-stone-50 transition"
              >
                Vaciar
              </button>
            </div>
          </>
        )}

        <div className="mt-10 text-center">
          <a href="/yogurt" className="text-sm text-stone-400 hover:text-stone-600">
            ← Seguir comprando
          </a>
        </div>
      </div>
    </main>
  );
}
