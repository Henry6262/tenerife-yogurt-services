import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || "pedidos@tenerife-yogurt.com";

export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  deliveryTimeSlot?: string | null;
  address?: string | null;
}): Promise<void> {
  if (!resend) {
    console.warn("Resend not configured. Email not sent.");
    return;
  }

  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${item.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">€${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const timeSlotHtml = params.deliveryTimeSlot
    ? `<p style="margin:4px 0;color:#059669;"><strong>Horario de entrega:</strong> ${params.deliveryTimeSlot}</p>`
    : "";

  const addressHtml = params.address
    ? `<p style="margin:4px 0;color:#44403c;"><strong>Dirección:</strong> ${params.address}</p>`
    : "";

  const html = `
    <div style="max-width:480px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#1c1917;">
      <div style="background:#065f46;padding:24px;text-align:center;border-radius:16px 16px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:20px;">Yogurt Griego Artesanal</h1>
        <p style="color:#a7f3d0;margin:4px 0 0;font-size:13px;">Hecho a mano en Tenerife</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
        <h2 style="margin:0 0 16px;font-size:18px;">¡Gracias por tu pedido, ${params.customerName}!</h2>
        <p style="color:#44403c;margin:0 0 16px;font-size:14px;line-height:1.5;">
          Tu pedido está confirmado. Te contactaremos por WhatsApp para coordinar los detalles de la entrega.
        </p>
        <div style="background:#f5f5f4;padding:16px;border-radius:12px;margin-bottom:16px;">
          <p style="margin:4px 0;color:#44403c;font-size:13px;"><strong>Pedido:</strong> #${params.orderId.slice(0, 8)}</p>
          ${timeSlotHtml}
          ${addressHtml}
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
          <thead>
            <tr style="border-bottom:2px solid #e5e7eb;">
              <th style="text-align:left;padding:8px 0;">Producto</th>
              <th style="text-align:center;padding:8px 0;">Cant.</th>
              <th style="text-align:right;padding:8px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="border-top:2px solid #e5e7eb;padding-top:12px;text-align:right;">
          <p style="margin:0;font-size:18px;font-weight:bold;color:#065f46;">Total: €${params.total.toFixed(2)}</p>
        </div>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0 0 8px;font-size:13px;color:#78716c;">¿Preguntas? Responde a este email o escríbenos por WhatsApp.</p>
          <a href="https://tenerife-services-indol.vercel.app/yogurt/orders" style="display:inline-block;background:#065f46;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Rastrear pedido</a>
        </div>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `Yogurt Griego <${FROM_EMAIL}>`,
      to: params.to,
      subject: `Pedido confirmado #${params.orderId.slice(0, 8)} — Yogurt Griego Artesanal`,
      html,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}
