import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendWhatsAppMessage, TEMPLATES } from "@/lib/whatsapp";
import type Stripe from "stripe";

export const metadata = {
  title: "¡Pedido confirmado! — Yogurt Griego Artesanal",
};

export default async function YogurtSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { session_id, lead_id, mode } = await searchParams;

  if (!session_id || typeof session_id !== "string") {
    redirect("/yogurt");
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["subscription"],
    });
  } catch {
    redirect("/yogurt?error=invalid-session");
  }

  if (session.payment_status !== "paid" && session.status !== "complete") {
    redirect("/yogurt?error=payment-pending");
  }

  const isSubscription = mode === "sub" || session.mode === "subscription";

  if (lead_id && typeof lead_id === "string") {
    try {
      const lead = await db.yogurtLead.update({
        where: { id: lead_id },
        data: { status: "converted" },
      });

      // Save subscription record if applicable
      if (isSubscription && session.subscription) {
        const sub = session.subscription as Stripe.Subscription & { current_period_end?: number };
        const nextDelivery = sub.current_period_end
          ? new Date(sub.current_period_end * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.yogurtSubscription.create({
          data: {
            leadId: lead.id,
            stripeSubscriptionId: sub.id,
            status: "active",
            frequency: "weekly",
            nextDelivery,
          },
        });
      }

      // Auto-send WhatsApp confirmation
      const message = isSubscription
        ? `¡Hola ${lead.name}! 🥛 Tu suscripción semanal de Yogurt Griego está activa. \n\nPrima entrega: mañana entre 10:00 y 14:00. \n\nDespués, recibes tu caja cada semana automáticamente. Pausa o cancela cuando quieras respondiendo aquí.`
        : TEMPLATES.orderConfirmation(lead.name);
      await sendWhatsAppMessage(lead.phone, message);
    } catch {
      // ignore
    }
  }

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
            {isSubscription
              ? "Caja Semanal Yogurt Griego — 4 tarros/semana"
              : "Pack Yogurt Griego Artesanal — 4 tarros"}
          </p>
          <p className="text-lg font-bold text-emerald-800 mt-1">
            {isSubscription ? "€8.00 / semana" : "€10.00"}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            ID: {session_id.slice(0, 12)}...
          </p>
        </div>

        <a
          href={`https://wa.me/?text=Hola%2C%20acabo%20de%20${isSubscription ? "activar%20mi%20suscripción" : "pagar%20mi%20pack"}%20de%20yogurt%20griego%20%F0%9F%A5%9B%20%28ID%3A%20${session_id.slice(0, 8)}%29`}
          className="inline-block w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition"
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


