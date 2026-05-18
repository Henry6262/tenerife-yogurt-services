/**
 * WhatsApp booking notifications via UltraMsg
 */

const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
const token = process.env.ULTRAMSG_TOKEN;

export function isWhatsAppEnabled(): boolean {
  return !!instanceId && !!token && !instanceId.includes("REPLACE") && !token.includes("REPLACE");
}

async function sendWhatsApp(to: string, body: string) {
  if (!isWhatsAppEnabled()) return { sent: false, error: "WhatsApp not configured" };

  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, to, body }),
  });

  const data = await res.json();
  return { sent: data.sent || false, error: data.error || null };
}

export async function sendBookingConfirmation({
  phone,
  customerName,
  serviceName,
  staffName,
  date,
  time,
  businessName,
  businessAddress,
  depositAmount,
}: {
  phone: string;
  customerName: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  businessName: string;
  businessAddress?: string | null;
  depositAmount?: number;
}) {
  const cleanPhone = phone.replace(/\D/g, "");
  const depositText = depositAmount && depositAmount > 0
    ? `\n💳 Se requiere un depósito de ${depositAmount}€ para confirmar tu cita.`
    : "";

  const body = `¡Hola ${customerName}! 👋\n\n✅ Tu cita en *${businessName}* está confirmada:\n\n📅 ${date}\n⏰ ${time}\n💆 ${serviceName}\n👤 Con ${staffName}${depositText}\n${businessAddress ? `\n📍 ${businessAddress}` : ""}\n\n¡Nos vemos pronto!`;

  return sendWhatsApp(cleanPhone, body);
}

export async function sendBookingReminder({
  phone,
  customerName,
  serviceName,
  staffName,
  date,
  time,
  businessName,
  businessAddress,
}: {
  phone: string;
  customerName: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  businessName: string;
  businessAddress?: string | null;
}) {
  const cleanPhone = phone.replace(/\D/g, "");

  const body = `¡Hola ${customerName}! 🔔\n\nTe recordamos tu cita de mañana en *${businessName}*:\n\n📅 ${date}\n⏰ ${time}\n💆 ${serviceName}\n👤 Con ${staffName}\n${businessAddress ? `\n📍 ${businessAddress}` : ""}\n\n¡Te esperamos!`;

  return sendWhatsApp(cleanPhone, body);
}

export async function sendAdminBookingAlert({
  adminPhone,
  customerName,
  serviceName,
  staffName,
  date,
  time,
  businessName,
}: {
  adminPhone: string;
  customerName: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  businessName: string;
}) {
  const cleanPhone = adminPhone.replace(/\D/g, "");

  const body = `🔔 Nueva reserva en *${businessName}*\n\n👤 ${customerName}\n💆 ${serviceName}\n👤 Con ${staffName}\n📅 ${date} ⏰ ${time}`;

  return sendWhatsApp(cleanPhone, body);
}
