"use client";

import { useCart } from "@/lib/cart";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  isSubscription: boolean;
  isBundle: boolean;
  stock: number;
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const { addItem, items } = useCart();
  const inCart = (id: string) => items.find((i) => i.productId === id)?.quantity || 0;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const outOfStock = product.stock <= 0;
        const cartQty = inCart(product.id);
        const canAdd = !outOfStock && cartQty < product.stock;

        return (
          <div
            key={product.id}
            className={`flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md ${
              outOfStock ? "opacity-60" : ""
            }`}
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

            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">€{product.price}</span>
              {product.comparePrice && (
                <span className="text-sm text-stone-400 line-through">
                  €{product.comparePrice}
                </span>
              )}
            </div>

            <p className="mb-4 text-xs text-stone-400">
              {outOfStock ? (
                <span className="text-red-500 font-medium">🚫 Agotado</span>
              ) : product.stock <= 5 ? (
                <span className="text-amber-600">⚡ Solo quedan {product.stock}</span>
              ) : (
                <span>📦 {product.stock} en stock</span>
              )}
            </p>

            <button
              onClick={() =>
                addItem({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                })
              }
              disabled={!canAdd}
              className="w-full rounded-xl bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 transition disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              {outOfStock
                ? "Agotado"
                : cartQty > 0
                ? `Añadir otro (${cartQty} en carrito)`
                : "Añadir al carrito"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
