/**
 * Email booking notifications via Resend
 */

const resendApiKey = process.env.RESEND_API_KEY;

export function isEmailEnabled(): boolean {
  return !!resendApiKey && !resendApiKey.includes("REPLACE");
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!isEmailEnabled()) return { sent: false, error: "Email not configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "TenerifeAI <bookings@tenerifeai.com>",
      to,
      subject,
      html,
    }),
  });

  const data = await res.json();
  return { sent: res.ok, error: data.error || null };
}

export async function sendBookingConfirmationEmail({
  to,
  customerName,
  serviceName,
  staffName,
  date,
  time,
  businessName,
  businessAddress,
  depositAmount,
}: {
  to: string;
  customerName: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  businessName: string;
  businessAddress?: string | null;
  depositAmount?: number;
}) {
  const depositText = depositAmount && depositAmount > 0
    ? `<p style="color:#666;">💳 Depósito: <strong>${depositAmount}€</strong></p>`
    : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#fafaf9;border-radius:16px;">
      <h2 style="color:#059669;margin-top:0;">¡Tu cita está confirmada!</h2>
      <p>Hola <strong>${customerName}</strong>,</p>
      <p>Tu cita en <strong>${businessName}</strong> ha sido confirmada:</p>
      <div style="background:#fff;padding:16px;border-radius:12px;margin:16px 0;border:1px solid #e7e5e4;">
        <p style="margin:4px 0;">💆 <strong>${serviceName}</strong></p>
        <p style="margin:4px 0;">👤 Con ${staffName}</p>
        <p style="margin:4px 0;">📅 ${date}</p>
        <p style="margin:4px 0;">⏰ ${time}</p>
        ${businessAddress ? `<p style="margin:4px 0;">📍 ${businessAddress}</p>` : ""}
        ${depositText}
      </div>
      <p style="color:#666;font-size:14px;">¿Necesitas cancelar o modificar tu cita? Visita <a href="https://tenerife-services-indol.vercel.app/bookings">Mis Citas</a>.</p>
      <p style="color:#a8a29e;font-size:12px;margin-top:24px;">Enviado por TenerifeAI</p>
    </div>
  `;

  return sendEmail({ to, subject: `✅ Cita confirmada — ${businessName}`, html });
}
