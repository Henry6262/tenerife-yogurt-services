import { db } from "@/lib/db";
import { createProduct, updateProduct, deleteProduct } from "./actions";

export const metadata = {
  title: "Productos — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <main className="text-stone-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Productos</h1>
            <p className="text-stone-500">Catálogo de Yogurt Griego</p>
          </div>
        </div>

        {/* Create form */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Añadir producto</h2>
          <form action={createProduct} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Nombre</label>
              <input name="name" required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Slug</label>
              <input name="slug" required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Precio (€)</label>
              <input name="price" type="number" step="0.01" required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Precio anterior (€)</label>
              <input name="comparePrice" type="number" step="0.01" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-medium text-stone-500 mb-1">Descripción</label>
              <input name="description" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isSubscription" className="rounded border-stone-300" />
                Suscripción
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isBundle" className="rounded border-stone-300" />
                Pack
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Intervalo</label>
              <select name="subscriptionInterval" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">
                <option value="">—</option>
                <option value="week">Semanal</option>
                <option value="biweek">Quincenal</option>
                <option value="month">Mensual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Stock</label>
              <input name="stock" type="number" defaultValue={10} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Orden</label>
              <input name="sortOrder" type="number" defaultValue={0} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                Añadir producto
              </button>
            </div>
          </form>
        </div>

        {/* Product list */}
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-100 text-stone-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium">Precio</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Orden</th>
                  <th className="px-4 py-3 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-stone-400">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-700">€{product.price}</span>
                      {product.comparePrice && (
                        <span className="ml-2 text-xs text-stone-400 line-through">€{product.comparePrice}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {product.isSubscription && (
                        <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Suscripción</span>
                      )}
                      {product.isBundle && (
                        <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Pack</span>
                      )}
                      {!product.isSubscription && !product.isBundle && (
                        <span className="text-xs text-stone-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                        {product.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">{product.sortOrder}</td>
                    <td className="px-4 py-3">
                      <details className="group">
                        <summary className="cursor-pointer text-xs text-blue-600 hover:underline">Editar</summary>
                        <form action={updateProduct} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <input type="hidden" name="id" value={product.id} />
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Nombre</label>
                            <input name="name" defaultValue={product.name} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Slug</label>
                            <input name="slug" defaultValue={product.slug} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Precio</label>
                            <input name="price" type="number" step="0.01" defaultValue={product.price} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Precio anterior</label>
                            <input name="comparePrice" type="number" step="0.01" defaultValue={product.comparePrice || ""} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div className="sm:col-span-2 lg:col-span-4">
                            <label className="block text-xs font-medium text-stone-500 mb-1">Descripción</label>
                            <input name="description" defaultValue={product.description || ""} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" name="isSubscription" defaultChecked={product.isSubscription} className="rounded border-stone-300" />
                              Suscripción
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" name="isBundle" defaultChecked={product.isBundle} className="rounded border-stone-300" />
                              Pack
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="rounded border-stone-300" />
                              Activo
                            </label>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Intervalo</label>
                            <select name="subscriptionInterval" defaultValue={product.subscriptionInterval || ""} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">
                              <option value="">—</option>
                              <option value="week">Semanal</option>
                              <option value="biweek">Quincenal</option>
                              <option value="month">Mensual</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Stock</label>
                            <input name="stock" type="number" defaultValue={product.stock} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Orden</label>
                            <input name="sortOrder" type="number" defaultValue={product.sortOrder} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div className="flex items-end gap-2">
                            <button type="submit" className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                              Guardar
                            </button>
                            <form action={deleteProduct}>
                              <input type="hidden" name="id" value={product.id} />
                              <button type="submit" className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 transition">
                                Eliminar
                              </button>
                            </form>
                          </div>
                        </form>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="py-16 text-center text-stone-400">
              <div className="text-4xl mb-3">📦</div>
              <p>Aún no hay productos</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
