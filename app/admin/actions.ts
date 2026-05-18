"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

export async function createBusiness(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const type = formData.get("type") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;

  await db.business.create({
    data: {
      name,
      slug,
      type,
      address,
      phone,
      email,
      ownerId: userId,
    },
  });

  // Create default agent config, services, and staff
  const business = await db.business.findUnique({ where: { slug } });
  if (business) {
    await db.agentConfig.create({
      data: {
        businessId: business.id,
        agentName: name,
        greeting: `¡Hola! Soy el asistente de ${name}. ¿En qué puedo ayudarte hoy?`,
        primaryColor: "#f43f5e",
      },
    });

    // Create demo services
    const demoServices = [
      { name: "Corte de Pelo", durationMinutes: 30, price: 25, colorCode: "#f43f5e" },
      { name: "Manicura", durationMinutes: 45, price: 20, colorCode: "#3b82f6" },
      { name: "Masaje Relajante", durationMinutes: 60, price: 50, colorCode: "#10b981" },
    ];
    for (const svc of demoServices) {
      await db.service.create({
        data: { businessId: business.id, ...svc, isActive: true },
      });
    }

    // Create demo staff
    const demoStaff = await db.staff.create({
      data: {
        businessId: business.id,
        name: "María",
        colorCode: "#f43f5e",
        isActive: true,
      },
    });

    // Link staff to all services
    const services = await db.service.findMany({ where: { businessId: business.id } });
    for (const svc of services) {
      await db.staffService.create({
        data: { staffId: demoStaff.id, serviceId: svc.id },
      });
    }

    // Create default schedule (Mon–Fri 09:00–18:00)
    for (let weekday = 1; weekday <= 5; weekday++) {
      await db.staffSchedule.create({
        data: {
          staffId: demoStaff.id,
          weekday,
          startMinute: 540,
          endMinute: 1080,
        },
      });
    }
  }

  revalidatePath("/admin");
  redirect("/admin");
}

/* ─────────────── Service CRUD ─────────────── */

export async function createService(formData: FormData) {
  const businessId = formData.get("businessId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const durationMinutes = Number(formData.get("durationMinutes"));
  const price = Number(formData.get("price"));
  const colorCode = (formData.get("colorCode") as string) || "#f43f5e";

  await db.service.create({
    data: {
      businessId,
      name,
      description,
      durationMinutes,
      price,
      colorCode,
      isActive: true,
    },
  });

  revalidatePath("/admin/services");
}

export async function updateService(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const durationMinutes = Number(formData.get("durationMinutes"));
  const price = Number(formData.get("price"));
  const colorCode = formData.get("colorCode") as string;
  const isActive = formData.get("isActive") === "on";

  await db.service.update({
    where: { id },
    data: { name, description, durationMinutes, price, colorCode, isActive },
  });

  revalidatePath("/admin/services");
}

export async function deleteService(formData: FormData) {
  const id = formData.get("id") as string;
  await db.service.delete({ where: { id } });
  revalidatePath("/admin/services");
}

/* ─────────────── Staff CRUD ─────────────── */

export async function createStaff(formData: FormData) {
  const businessId = formData.get("businessId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const bio = formData.get("bio") as string;
  const colorCode = (formData.get("colorCode") as string) || "#3b82f6";

  const staff = await db.staff.create({
    data: {
      businessId,
      name,
      email,
      phone,
      bio,
      colorCode,
      isActive: true,
    },
  });

  // Create default schedule (Mon–Fri 09:00–18:00)
  for (let weekday = 1; weekday <= 5; weekday++) {
    await db.staffSchedule.create({
      data: {
        staffId: staff.id,
        weekday,
        startMinute: 540, // 9:00
        endMinute: 1080,  // 18:00
      },
    });
  }

  revalidatePath("/admin/staff");
}

export async function updateStaff(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const bio = formData.get("bio") as string;
  const colorCode = formData.get("colorCode") as string;
  const isActive = formData.get("isActive") === "on";

  await db.staff.update({
    where: { id },
    data: { name, email, phone, bio, colorCode, isActive },
  });

  revalidatePath("/admin/staff");
}

export async function deleteStaff(formData: FormData) {
  const id = formData.get("id") as string;
  await db.staff.delete({ where: { id } });
  revalidatePath("/admin/staff");
}

export async function updateStaffSchedule(formData: FormData) {
  const staffId = formData.get("staffId") as string;
  const weekday = Number(formData.get("weekday"));
  const startMinute = Number(formData.get("startMinute"));
  const endMinute = Number(formData.get("endMinute"));

  await db.staffSchedule.upsert({
    where: { staffId_weekday: { staffId, weekday } },
    create: { staffId, weekday, startMinute, endMinute },
    update: { startMinute, endMinute },
  });

  revalidatePath("/admin/staff");
}

/* ─────────────── Booking CRUD ─────────────── */

export async function updateBookingStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await db.booking.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
}

export async function deleteBooking(formData: FormData) {
  const id = formData.get("id") as string;
  await db.booking.delete({ where: { id } });
  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
}

export async function cancelBooking(formData: FormData) {
  const id = formData.get("id") as string;
  await db.booking.update({
    where: { id },
    data: { status: "cancelled" },
  });
  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
}

export async function rescheduleBooking(formData: FormData) {
  const id = formData.get("id") as string;
  const newDate = formData.get("newDate") as string;
  const newTime = formData.get("newTime") as string;
  if (!newDate || !newTime) return;

  const booking = await db.booking.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!booking) return;

  const startsAt = new Date(`${newDate}T${newTime}`);
  const endsAt = new Date(startsAt.getTime() + booking.service.durationMinutes * 60000);

  await db.booking.update({
    where: { id },
    data: { startsAt, endsAt },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
}

export async function updateBookingNotes(formData: FormData) {
  const id = formData.get("id") as string;
  const notes = formData.get("notes") as string;

  await db.booking.update({
    where: { id },
    data: { notes },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
}

export async function createOverride(formData: FormData) {
  const staffId = formData.get("staffId") as string;
  const date = formData.get("date") as string;
  const isClosed = formData.get("isClosed") === "true";
  const startTime = formData.get("startMinute") as string;
  const endTime = formData.get("endMinute") as string;

  const startMinute = startTime ? parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]) : null;
  const endMinute = endTime ? parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]) : null;

  await db.staffOverride.create({
    data: {
      staffId,
      date,
      isClosed,
      startMinute,
      endMinute,
    },
  });

  revalidatePath("/admin/overrides");
}

export async function deleteOverride(formData: FormData) {
  const id = formData.get("id") as string;
  await db.staffOverride.delete({ where: { id } });
  revalidatePath("/admin/overrides");
}
