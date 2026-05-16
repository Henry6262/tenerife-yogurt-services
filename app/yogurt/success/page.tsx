import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendWhatsAppMessage, TEMPLATES, sendAdminOrderNotification } from "@/lib/whatsapp";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type Stripe from "stripe";

export const metadata = {
  title: "¡Pedido confirmado! — Yogurt Griego Artesanal",
};

export default async function YogurtSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { session_id, product_id, type, lead_id } = await searchParams;

  if (!session_id || typeof session_id !== "string") {
    redirect("/yogurt");
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["subscription", "customer_details", "shipping_details"],
    });
  } catch {
    redirect("/yogurt?error=invalid-session");
  }

  if (session.payment_status !== "paid" && session.status !== "complete") {
    redirect("/yogurt?error=payment-pending");
  }

  const isSubscription = type === "subscription" || session.mode === "subscription";
  const customer = session.customer_details;
  const phone = customer?.phone
    ? customer.phone.replace(/\s/g, "")
    : lead_id
    ? (await db.yogurtLead.findUnique({ where: { id: lead_id as string } }))?.phone || ""
    : "";
  const name = customer?.name || "Cliente";
  const shipping = (session as any).shipping_details;
  const address = shipping?.address
    ? `${shipping.address.line1 || ""}, ${shipping.address.postal_code || ""} ${shipping.address.city || ""}, ${shipping.address.country || ""}`
    : "";

  // Build line items from metadata (cart) or product_id (single)
  const meta = session.metadata || {};
  const cartItems: { productId: string; productName: string; quantity: number }[] = [];

  for (let i = 0; meta[`productId_${i}`]; i++) {
    cartItems.push({
      productId: meta[`productId_${i}`]!,
      productName: meta[`productName_${i}`] || "Producto",
      quantity: Number(meta[`quantity_${i}`]) || 1,
    });
  }

  const isCart = cartItems.length > 0;
  const timeSlot = meta.timeSlot;

  // Track promo code usage
  if (meta.promoCode) {
    try {
      await db.promoCode.updateMany({
        where: { code: meta.promoCode },
        data: { usedCount: { increment: 1 } },
      });
    } catch {
      // ignore
    }
  }

  // Create or update order record
  let order;
  try {
    const existing = await db.order.findUnique({
      where: { stripeSessionId: session_id },
      include: { items: true },
    });

    if (!existing) {
      if (isCart) {
        const total = (session.amount_total || 0) / 100;
        order = await db.order.create({
          data: {
            customerName: name,
            customerPhone: phone,
            customerEmail: customer?.email || null,
            address,
            status: "confirmed",
            paymentStatus: "paid",
            stripeSessionId: session_id,
            stripePaymentIntentId: (session.payment_intent as string) || null,
            total,
            notes: "Pedido desde carrito",
            deliveryTimeSlot: timeSlot || null,
            items: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: 0, // we don't have per-item price in metadata, use total
                total: 0,
              })),
            },
          },
          include: { items: true },
        });
        // Decrement stock for cart items
        for (const item of cartItems) {
          try {
            await db.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          } catch {
            // ignore stock errors
          }
        }
        // Notify admin
        if (order) {
          await sendAdminOrderNotification({
            id: order.id,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            address: order.address || undefined,
            deliveryTimeSlot: order.deliveryTimeSlot || undefined,
            items: order.items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
            total: order.total,
          });
          // Send email receipt
          if (order.customerEmail) {
            await sendOrderConfirmationEmail({
              to: order.customerEmail,
              customerName: order.customerName,
              orderId: order.id,
              items: order.items.map((i) => ({ name: i.productName, quantity: i.quantity, price: i.unitPrice })),
              total: order.total,
              deliveryTimeSlot: order.deliveryTimeSlot,
              address: order.address,
            });
          }
        }
      } else if (product_id && typeof product_id === "string") {
        const product = await db.product.findUnique({ where: { id: product_id } });
        if (product) {
          order = await db.order.create({
            data: {
              customerName: name,
              customerPhone: phone,
              customerEmail: customer?.email || null,
              address,
              status: "confirmed",
              paymentStatus: "paid",
              stripeSessionId: session_id,
              stripePaymentIntentId: (session.payment_intent as string) || null,
              total: product.price,
              notes: isSubscription ? "Suscripción semanal" : "Pedido único",
              deliveryTimeSlot: timeSlot || null,
              items: {
                create: {
                  productId: product.id,
                  productName: product.name,
                  quantity: 1,
                  unitPrice: product.price,
                  total: product.price,
                },
              },
            },
            include: { items: true },
          });
          // Decrement stock
          await db.product.update({
            where: { id: product.id },
            data: { stock: { decrement: 1 } },
          });
          // Notify admin
          if (order) {
            await sendAdminOrderNotification({
              id: order.id,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              address: order.address || undefined,
              deliveryTimeSlot: order.deliveryTimeSlot || undefined,
              items: order.items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
              total: order.total,
            });
            // Send email receipt
            if (order.customerEmail) {
              await sendOrderConfirmationEmail({
                to: order.customerEmail,
                customerName: order.customerName,
                orderId: order.id,
                items: order.items.map((i) => ({ name: i.productName, quantity: i.quantity, price: i.unitPrice })),
                total: order.total,
                deliveryTimeSlot: order.deliveryTimeSlot,
                address: order.address,
              });
            }
          }
        }
      }
    } else {
      order = existing;
    }
  } catch {
    // Order creation failed but don't block the success page
  }

  // Update lead if applicable
  if (lead_id && typeof lead_id === "string") {
    try {
      const lead = await db.yogurtLead.update({
        where: { id: lead_id },
        data: { status: "converted" },
      });

      if (isSubscription && session.subscription) {
        const sub = session.subscription as Stripe.Subscription & { current_period_end?: number };
        const nextDelivery = sub.current_period_end
          ? new Date(sub.current_period_end * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.yogurtSubscription.create({
          data: {
            leadId: lead.id,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: (session.customer as string) || null,
            status: "active",
            frequency: "weekly",
            nextDelivery,
          },
        });
      }

      if (phone) {
        const message = isSubscription
          ? `¡Hola ${lead.name}! 🥛 Tu suscripción semanal de Yogurt Griego está activa.\n\nPrimera entrega: mañana entre 10:00 y 14:00.\n\nDespués, recibes tu caja cada semana automáticamente. Pausa o cancela cuando quieras respondiendo aquí.`
          : TEMPLATES.orderConfirmation(lead.name);
        await sendWhatsAppMessage(lead.phone, message);
      }
    } catch {
      // ignore
    }
  } else if (phone && order) {
    try {
      const message = isSubscription
        ? `¡Hola ${name}! 🥛 Tu suscripción semanal de Yogurt Griego está activa.\n\nPrimera entrega: mañana entre 10:00 y 14:00.\n\nID: ${order.id.slice(0, 8)}`
        : `¡Hola ${name}! 🥛 Tu pedido de Yogurt Griego está confirmado.\n\nEntrega: mañana entre 10:00 y 14:00.\n\nID: ${order.id.slice(0, 8)}`;
      await sendWhatsAppMessage(phone, message);
    } catch {
      // ignore
    }
  }

  const firstItemName = order?.items?.[0]?.productName || (isSubscription ? "Caja Semanal" : "Pack Yogurt Griego");
  const itemCount = order?.items?.length || 1;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-stone-200 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">
          {isSubscription ? "¡Suscripción activada!" : "¡Pedido confirmado!"}
        </h1>
        <p className="text-stone-500 mb-6">
          {isSubscription
            ? "Gracias por unirte. Te contactamos por WhatsApp para coordinar la primera entrega."
            : "Gracias por tu pedido. Te contactamos por WhatsApp en menos de 30 min para coordinar la entrega."}
        </p>

        <div className="bg-emerald-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-emerald-800 font-semibold mb-1">Resumen</p>
          <p className="text-sm text-emerald-700">
            {isCart && itemCount > 1
              ? `${itemCount} artículos en el pedido`
              : firstItemName}
          </p>
          <p className="text-lg font-bold text-emerald-800 mt-1">
            {isSubscription ? "€8.00 / semana" : `€${(session.amount_total || 1000) / 100}`}
          </p>
          {order && (
            <p className="text-xs text-emerald-600 mt-1">Pedido: #{order.id.slice(0, 8)}</p>
          )}
        </div>

        <a
          href="/yogurt/orders"
          className="inline-block w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition mb-3"
        >
          Ver mis pedidos
        </a>

        <a
          href={`https://wa.me/${phone?.replace(/\D/g, "") || "34600000000"}?text=Hola%2C%20acabo%20de%20${isSubscription ? "activar%20mi%20suscripción" : "pagar%20mi%20pack"}%20de%20yogurt%20griego%20%F0%9F%A5%9B`}
          className="inline-block w-full bg-white text-emerald-700 font-bold py-3 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition"
        >
          Abrir WhatsApp
        </a>

        <a
          href="/yogurt"
          className="inline-block mt-4 text-sm text-stone-400 hover:text-stone-600"
        >
          Volver a la tienda
        </a>
      </div>
    </main>
  );
}
