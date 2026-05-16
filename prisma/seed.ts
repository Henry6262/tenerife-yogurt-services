import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Create demo beauty salon (skip if exists)
  let salon = await db.business.findUnique({ where: { slug: "bella-tenerife" } });
  if (!salon) {
    salon = await db.business.create({
      data: {
        name: "Bella Tenerife Beauty",
        slug: "bella-tenerife",
        type: "salon",
        address: "Calle de la Rosa 12, Los Cristianos",
        phone: "+34 922 123 456",
        email: "hola@bellatenerife.es",
      },
    });
  }

  // Services (skip if already exist)
  const existingServices = await db.service.count({ where: { businessId: salon.id } });
  if (existingServices === 0) {
    await db.service.createMany({
      data: [
        { businessId: salon.id, name: "Corte de Pelo Mujer", durationMinutes: 45, price: 25, description: "Corte, lavado y peinado", colorCode: "#f43f5e" },
        { businessId: salon.id, name: "Corte de Pelo Hombre", durationMinutes: 30, price: 18, description: "Corte y lavado", colorCode: "#3b82f6" },
        { businessId: salon.id, name: "Tinte Completo", durationMinutes: 90, price: 55, description: "Coloración completa con productos premium", colorCode: "#a855f7" },
        { businessId: salon.id, name: "Mechas", durationMinutes: 120, price: 70, description: "Mechas balayage o foil", colorCode: "#f59e0b" },
        { businessId: salon.id, name: "Manicura", durationMinutes: 30, price: 15, description: "Lima, cutícula y esmaltado", colorCode: "#ec4899" },
        { businessId: salon.id, name: "Pedicura", durationMinutes: 45, price: 22, description: "Pedicura completa con masaje", colorCode: "#10b981" },
        { businessId: salon.id, name: "Masaje Relajante", durationMinutes: 60, price: 45, description: "Masaje corporal relajante", colorCode: "#14b8a6" },
        { businessId: salon.id, name: "Tratamiento Facial", durationMinutes: 50, price: 40, description: "Limpieza facial profunda", colorCode: "#8b5cf6" },
      ],
    });

    const allServices = await db.service.findMany({ where: { businessId: salon.id } });

    const maria = await db.staff.create({
      data: {
        businessId: salon.id,
        name: "Maria",
        bio: "Especialista en coloración y mechas con 10 años de experiencia",
        colorCode: "#f43f5e",
      },
    });

    const carlos = await db.staff.create({
      data: {
        businessId: salon.id,
        name: "Carlos",
        bio: "Experto en cortes masculinos y barbería",
        colorCode: "#3b82f6",
      },
    });

    const ana = await db.staff.create({
      data: {
        businessId: salon.id,
        name: "Ana",
        bio: "Manicura, pedicura y tratamientos de spa",
        colorCode: "#10b981",
      },
    });

    await db.staffService.createMany({
      data: [
        { staffId: maria.id, serviceId: allServices.find(s => s.name === "Corte de Pelo Mujer")!.id },
        { staffId: maria.id, serviceId: allServices.find(s => s.name === "Tinte Completo")!.id },
        { staffId: maria.id, serviceId: allServices.find(s => s.name === "Mechas")!.id },
        { staffId: carlos.id, serviceId: allServices.find(s => s.name === "Corte de Pelo Hombre")!.id },
        { staffId: carlos.id, serviceId: allServices.find(s => s.name === "Corte de Pelo Mujer")!.id },
        { staffId: ana.id, serviceId: allServices.find(s => s.name === "Manicura")!.id },
        { staffId: ana.id, serviceId: allServices.find(s => s.name === "Pedicura")!.id },
        { staffId: ana.id, serviceId: allServices.find(s => s.name === "Masaje Relajante")!.id },
        { staffId: ana.id, serviceId: allServices.find(s => s.name === "Tratamiento Facial")!.id },
      ],
    });

    for (const staff of [maria, carlos, ana]) {
      await db.staffSchedule.createMany({
        data: [
          { staffId: staff.id, weekday: 1, startMinute: 540, endMinute: 1080 },
          { staffId: staff.id, weekday: 2, startMinute: 540, endMinute: 1080 },
          { staffId: staff.id, weekday: 3, startMinute: 540, endMinute: 1080 },
          { staffId: staff.id, weekday: 4, startMinute: 540, endMinute: 1080 },
          { staffId: staff.id, weekday: 5, startMinute: 540, endMinute: 1080 },
          { staffId: staff.id, weekday: 6, startMinute: 540, endMinute: 840 },
        ],
      });
    }
  }

  // Seed Yogurt Products
  await db.product.createMany({
    data: [
      {
        name: "Pack Yogurt Griego — 4 tarros",
        slug: "pack-4",
        description: "4 tarros de 450g. Leche local, fermentación natural.",
        price: 10,
        comparePrice: 12,
        isSubscription: false,
        isBundle: false,
        sortOrder: 1,
      },
      {
        name: "Caja Semanal — Suscripción",
        slug: "sub-weekly",
        description: "4 tarros cada semana. Entrega automática. Cancela cuando quieras.",
        price: 8,
        comparePrice: 10,
        isSubscription: true,
        subscriptionInterval: "week",
        isBundle: false,
        sortOrder: 2,
      },
      {
        name: "Caja Quincenal — Suscripción",
        slug: "sub-biweekly",
        description: "4 tarros cada 2 semanas. Para quienes consumen menos.",
        price: 9,
        comparePrice: 10,
        isSubscription: true,
        subscriptionInterval: "biweek",
        isBundle: false,
        sortOrder: 3,
      },
      {
        name: "Pack Familiar — 8 tarros",
        slug: "pack-8",
        description: "8 tarros de 450g. Ideal para familias. Ahorra €6.",
        price: 18,
        comparePrice: 24,
        isSubscription: false,
        isBundle: true,
        sortOrder: 4,
      },
      {
        name: "Pack Deportista — 12 tarros",
        slug: "pack-12",
        description: "12 tarros de 450g. Alto en proteína. Ahorra €12.",
        price: 25,
        comparePrice: 36,
        isSubscription: false,
        isBundle: true,
        sortOrder: 5,
      },
      {
        name: "Yogurt con Miel de Palma",
        slug: "pack-miel",
        description: "4 tarros + miel de palma artesanal canaria.",
        price: 14,
        comparePrice: 16,
        isSubscription: false,
        isBundle: true,
        sortOrder: 6,
      },
    ],
  });

  console.log("Seeded Bella Tenerife Beauty salon with services and staff");
  console.log("Seeded Yogurt Griego product catalog");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
