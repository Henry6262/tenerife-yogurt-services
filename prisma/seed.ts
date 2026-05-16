import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Create demo beauty salon
  const salon = await db.business.create({
    data: {
      name: "Bella Tenerife Beauty",
      slug: "bella-tenerife",
      type: "salon",
      address: "Calle de la Rosa 12, Los Cristianos",
      phone: "+34 922 123 456",
      email: "hola@bellatenerife.es",
    },
  });

  // Services
  const services = await db.service.createMany({
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

  // Staff
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

  // Staff can do services
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

  // Schedules (Mon-Fri 9:00-18:00, Sat 9:00-14:00)
  for (const staff of [maria, carlos, ana]) {
    await db.staffSchedule.createMany({
      data: [
        { staffId: staff.id, weekday: 1, startMinute: 540, endMinute: 1080 }, // Mon 9-18
        { staffId: staff.id, weekday: 2, startMinute: 540, endMinute: 1080 },
        { staffId: staff.id, weekday: 3, startMinute: 540, endMinute: 1080 },
        { staffId: staff.id, weekday: 4, startMinute: 540, endMinute: 1080 },
        { staffId: staff.id, weekday: 5, startMinute: 540, endMinute: 1080 },
        { staffId: staff.id, weekday: 6, startMinute: 540, endMinute: 840 },  // Sat 9-14
      ],
    });
  }

  console.log("Seeded Bella Tenerife Beauty salon with services and staff");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
