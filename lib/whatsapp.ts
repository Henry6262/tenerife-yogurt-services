// UltraMsg integration for WhatsApp automation
// Sign up at https://ultramsg.com → get instanceId + token
// Fallback: use click-to-chat links for manual sending

const ULTRAMSG_INSTANCE = process.env.ULTRAMSG_INSTANCE_ID;
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN;

export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!ULTRAMSG_INSTANCE || !ULTRAMSG_TOKEN) {
    console.warn("UltraMsg not configured. Message not sent:", message);
    return { success: false, error: "WhatsApp not configured" };
  }

  // Normalize phone: remove + for UltraMsg
  const cleanPhone = phone.replace(/\+/g, "");

  const url = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE}/messages/chat`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: ULTRAMSG_TOKEN,
        to: cleanPhone,
        body: message,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("UltraMsg error:", data);
      return { success: false, error: data.error || "UltraMsg API error" };
    }

    return { success: true };
  } catch (err: any) {
    console.error("WhatsApp send error:", err);
    return { success: false, error: err.message };
  }
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\+/g, "").replace(/\s/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export async function sendAdminOrderNotification(order: {
  id: string;
  customerName: string;
  customerPhone: string;
  address?: string;
  deliveryTimeSlot?: string;
  items: { productName: string; quantity: number }[];
  total: number;
}): Promise<void> {
  const ADMIN_PHONE = process.env.ADMIN_WHATSAPP_PHONE;
  if (!ADMIN_PHONE) {
    console.warn("ADMIN_WHATSAPP_PHONE not set. Skipping admin notification.");
    return;
  }

  const itemsText = order.items.map((i) => `${i.quantity}x ${i.productName}`).join("\n");
  const timeText = order.deliveryTimeSlot ? `\n🕐 *Horario:* ${order.deliveryTimeSlot}` : "";
  const message = `🛒 *Nuevo pedido* #${order.id.slice(0, 8)}${timeText}\n\n*Cliente:* ${order.customerName}\n*Tel:* ${order.customerPhone}\n*Dirección:* ${order.address || "—"}\n\n*Productos:*\n${itemsText}\n\n*Total:* €${order.total.toFixed(2)}`;

  await sendWhatsAppMessage(ADMIN_PHONE, message);
}

export const TEMPLATES = {
  orderConfirmation: (name: string) =>
    `¡Hola ${name}! ✅ Tu pago del pack de Yogurt Griego Artesanal se ha confirmado. \n\nTe entregamos mañana entre 10:00 y 14:00 en Santa Cruz / La Laguna. \n\nSi necesitas cambiar la dirección o el horario, responde aquí.`,

  leadFollowUp: (name: string, link: string) =>
    `¡Hola ${name}! 🥛 Vimos que te interesó nuestro Yogurt Griego Artesanal. \n\nCompleta tu pedido aquí: ${link} \n\n4 tarros por €10. Entrega gratis mañana.`,

  deliveryReminder: (name: string) =>
    `¡Buenos días ${name}! 🚚 Tu pack de Yogurt Griego sale hoy de ruta. \n\nLlega entre 10:00 y 14:00. ¡Gracias por apoyar lo local!`,
};
