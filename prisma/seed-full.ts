import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Clean slate
  await db.booking.deleteMany();
  await db.customer.deleteMany();
  await db.agentMessage.deleteMany();
  await db.conversation.deleteMany();
  await db.agentConfig.deleteMany();
  await db.staffOverride.deleteMany();
  await db.staffSchedule.deleteMany();
  await db.staffService.deleteMany();
  await db.staff.deleteMany();
  await db.service.deleteMany();
  await db.business.deleteMany();

  // ========== BUSINESS 1: Luxury Salon ==========
  const bella = await db.business.create({
    data: {
      name: "Bella Tenerife Beauty",
      slug: "bella-tenerife",
      type: "salon",
      address: "Calle de la Rosa 12, Los Cristianos",
      phone: "+34 922 123 456",
      email: "hola@bellatenerife.es",
    },
  });

  const bellaServices = await db.service.createMany({
    data: [
      { businessId: bella.id, name: "Corte de Pelo Mujer", durationMinutes: 45, price: 25, description: "Corte, lavado y peinado con productos premium", colorCode: "#be185d" },
      { businessId: bella.id, name: "Tinte Completo", durationMinutes: 90, price: 55, description: "Coloración completa con productos veganos", colorCode: "#7c3aed" },
      { businessId: bella.id, name: "Mechas Balayage", durationMinutes: 120, price: 70, description: "Mechas personalizadas", colorCode: "#d97706" },
      { businessId: bella.id, name: "Manicura Spa", durationMinutes: 45, price: 22, description: "Manicura con masaje y esmaltado OPI", colorCode: "#db2777" },
      { businessId: bella.id, name: "Pedicura Luxury", durationMinutes: 60, price: 30, description: "Pedicura completa con exfoliación", colorCode: "#059669" },
      { businessId: bella.id, name: "Masaje Relajante", durationMinutes: 60, price: 50, description: "Masaje corporal con aceites esenciales", colorCode: "#0891b2" },
      { businessId: bella.id, name: "Tratamiento Facial", durationMinutes: 50, price: 45, description: "Limpieza facial profunda con máscara de oro", colorCode: "#7c3aed" },
    ],
  });

  const maria = await db.staff.create({ data: { businessId: bella.id, name: "Maria", bio: "Especialista en coloración con 10 años de experiencia. Experta en mechas y balayage.", colorCode: "#be185d" } });
  const carlos = await db.staff.create({ data: { businessId: bella.id, name: "Carlos", bio: "Barbero y estilista. Cortes precision para hombre y mujer.", colorCode: "#2563eb" } });
  const ana = await db.staff.create({ data: { businessId: bella.id, name: "Ana", bio: "Manicura, pedicura y tratamientos de spa. Certificada en reflexología.", colorCode: "#059669" } });

  const allBellaServices = await db.service.findMany({ where: { businessId: bella.id } });
  const svc = (name: string) => allBellaServices.find(s => s.name.includes(name))!.id;

  await db.staffService.createMany({
    data: [
      { staffId: maria.id, serviceId: svc("Corte") },
      { staffId: maria.id, serviceId: svc("Tinte") },
      { staffId: maria.id, serviceId: svc("Mechas") },
      { staffId: carlos.id, serviceId: svc("Corte") },
      { staffId: ana.id, serviceId: svc("Manicura") },
      { staffId: ana.id, serviceId: svc("Pedicura") },
      { staffId: ana.id, serviceId: svc("Masaje") },
      { staffId: ana.id, serviceId: svc("Facial") },
    ],
  });

  for (const s of [maria, carlos, ana]) {
    await db.staffSchedule.createMany({
      data: [
        { staffId: s.id, weekday: 1, startMinute: 540, endMinute: 1080 },
        { staffId: s.id, weekday: 2, startMinute: 540, endMinute: 1080 },
        { staffId: s.id, weekday: 3, startMinute: 540, endMinute: 1080 },
        { staffId: s.id, weekday: 4, startMinute: 540, endMinute: 1080 },
        { staffId: s.id, weekday: 5, startMinute: 540, endMinute: 1080 },
        { staffId: s.id, weekday: 6, startMinute: 540, endMinute: 840 },
      ],
    });
  }

  await db.agentConfig.create({
    data: {
      businessId: bella.id,
      agentName: "Sofia",
      gender: "female",
      tone: "luxury",
      personalityTraits: "elegante, atenta, refinada, experta",
      voiceType: "warm",
      speakingSpeed: 90,
      greeting: "¡Bienvenida a Bella Tenerife! Soy Sofia, tu asistente personal de belleza. Cuéntame, ¿qué te apetece hoy? Un corte fresco, un masaje relajante... o quizás algo de color para brillar esta temporada?",
      farewell: "Ha sido un verdadero placer atenderte. Te esperamos con los brazos abiertos, una copa de cava bien fría y tu momento de belleza reservado. ¡Hasta pronto!",
      fallbackMessage: "Disculpa, no te he entendido del todo. ¿Puedes repetirlo? Estoy aquí para crear la experiencia perfecta para ti.",
      brandGuidelines: "Bella Tenerife es un salón de lujo en Los Cristianos. Usamos productos premium veganos de Kevin Murphy y OPI. Ofrecemos champagne o infusiones artesanales a todas nuestras clientas. Ambiente relajante con música chill-out y aromaterapia.",
      specialInstructions: "Si alguien pregunta por alergias, preguntar específicamente sobre gluten y níquel. Si pide un corte de pelo urgente, priorizar a Carlos para hombres y Maria para mujeres. Siempre ofrecer champú incluido. Mencionar champagne gratis para citas de más de 60€.",
      primaryColor: "#be185d",
    },
  });

  // ========== BUSINESS 2: Barber Shop ==========
  const barber = await db.business.create({
    data: {
      name: "El Barbero Tenerife",
      slug: "el-barbero",
      type: "barbershop",
      address: "Avenida Santiago 45, Playa de las Américas",
      phone: "+34 922 789 012",
      email: "hola@elbarbero.es",
    },
  });

  await db.service.createMany({
    data: [
      { businessId: barber.id, name: "Corte Clásico", durationMinutes: 30, price: 15, description: "Corte a tijera o máquina, a tu estilo", colorCode: "#1e40af" },
      { businessId: barber.id, name: "Corte + Barba", durationMinutes: 45, price: 22, description: "Corte completo + arreglo de barba con navaja", colorCode: "#1e3a5f" },
      { businessId: barber.id, name: "Afeitado Tradicional", durationMinutes: 30, price: 18, description: "Afeitado con navaja y toallas calientes", colorCode: "#475569" },
      { businessId: barber.id, name: "Arreglo de Barba", durationMinutes: 20, price: 10, description: "Diseño y perfilado de barba", colorCode: "#334155" },
      { businessId: barber.id, name: "Tratamiento Capilar", durationMinutes: 25, price: 12, description: "Keratina o hidratación para el pelo", colorCode: "#0f766e" },
    ],
  });

  const pepe = await db.staff.create({ data: { businessId: barber.id, name: "Pepe", bio: "Barbero clásico. Especialista en degradados y barbas. 8 años de experiencia.", colorCode: "#1e40af" } });
  const juan = await db.staff.create({ data: { businessId: barber.id, name: "Juan", bio: "Especialista en cortes modernos y tratamientos capilares. Siempre al día con las tendencias.", colorCode: "#0f766e" } });

  const allBarberServices = await db.service.findMany({ where: { businessId: barber.id } });
  const bsvc = (name: string) => allBarberServices.find(s => s.name.includes(name))!.id;

  await db.staffService.createMany({
    data: [
      { staffId: pepe.id, serviceId: bsvc("Corte Clásico") },
      { staffId: pepe.id, serviceId: bsvc("Corte + Barba") },
      { staffId: pepe.id, serviceId: bsvc("Afeitado") },
      { staffId: pepe.id, serviceId: bsvc("Arreglo") },
      { staffId: juan.id, serviceId: bsvc("Corte Clásico") },
      { staffId: juan.id, serviceId: bsvc("Tratamiento") },
    ],
  });

  for (const s of [pepe, juan]) {
    await db.staffSchedule.createMany({
      data: [
        { staffId: s.id, weekday: 1, startMinute: 600, endMinute: 1200 },
        { staffId: s.id, weekday: 2, startMinute: 600, endMinute: 1200 },
        { staffId: s.id, weekday: 3, startMinute: 600, endMinute: 1200 },
        { staffId: s.id, weekday: 4, startMinute: 600, endMinute: 1200 },
        { staffId: s.id, weekday: 5, startMinute: 600, endMinute: 1200 },
        { staffId: s.id, weekday: 6, startMinute: 600, endMinute: 960 },
      ],
    });
  }

  await db.agentConfig.create({
    data: {
      businessId: barber.id,
      agentName: "Roco",
      gender: "male",
      tone: "playful",
      personalityTraits: "divertido, directo, confidente, amigo",
      voiceType: "energetic",
      speakingSpeed: 110,
      greeting: "¡Qué pasa, crack! Soy Roco, tu barbero virtual. ¿Necesitas un repaso? Un fade? ¿O vienes por la barba? Dime y te encuentro hueco ya mismo.",
      farewell: "¡Listo, jefe! Te esperamos en la silla. Saldrás como nuevo. ¡No falles!",
      fallbackMessage: "Eh, no te he pillado. ¿Corte, barba o afeitado? Dímelo claro y te busco hueco.",
      brandGuidelines: "El Barbero Tenerife es la barbería de confianza en Playa de las Américas. Especialistas en cortes modernos, degradados y barbas. Usamos productos American Crew y Reuzel. Ambiente urbano con hip-hop y buen rollo. Cerveza gratis con cada corte.",
      specialInstructions: "Si preguntan por un fade, recomendar a Pepe. Si quieren tratamiento capilar, recomendar a Juan. Siempre mencionar cerveza gratis. Si viene un turista, preguntar de dónde es y hablar de fútbol.",
      primaryColor: "#1e40af",
    },
  });

  // ========== BUSINESS 3: Wellness Spa ==========
  const zen = await db.business.create({
    data: {
      name: "Zen Spa Tenerife",
      slug: "zen-spa",
      type: "spa",
      address: "Calle del Mar 8, Costa Adeje",
      phone: "+34 922 456 789",
      email: "relax@zenspa.es",
    },
  });

  await db.service.createMany({
    data: [
      { businessId: zen.id, name: "Masaje Relajante", durationMinutes: 60, price: 45, description: "Masaje sueco completo con aceites aromáticos", colorCode: "#0d9488" },
      { businessId: zen.id, name: "Masaje Descontracturante", durationMinutes: 60, price: 50, description: "Para tensiones y contracturas profundas", colorCode: "#0f766e" },
      { businessId: zen.id, name: "Masaje en Pareja", durationMinutes: 60, price: 80, description: "Masaje simultáneo para dos personas", colorCode: "#115e59" },
      { businessId: zen.id, name: "Facial Hidratante", durationMinutes: 45, price: 40, description: "Hidratación profunda con productos naturales", colorCode: "#14b8a6" },
      { businessId: zen.id, name: "Ritual de Piedras Calientes", durationMinutes: 90, price: 65, description: "Masaje con piedras volcánicas calientes", colorCode: "#134e4a" },
      { businessId: zen.id, name: "Reflexología Podal", durationMinutes: 45, price: 35, description: "Masaje en puntos de los pies para bienestar general", colorCode: "#2dd4bf" },
    ],
  });

  const luna = await db.staff.create({ data: { businessId: zen.id, name: "Luna", bio: "Terapeuta de masajes con 12 años de experiencia. Especialista en aromaterapia y técnicas orientales.", colorCode: "#0d9488" } });
  const diego = await db.staff.create({ data: { businessId: zen.id, name: "Diego", bio: "Fisioterapeuta y masajista deportivo. Expertise en descontracturante y recuperación.", colorCode: "#0f766e" } });

  const allZenServices = await db.service.findMany({ where: { businessId: zen.id } });
  const zsvc = (name: string) => allZenServices.find(s => s.name.includes(name))!.id;

  await db.staffService.createMany({
    data: [
      { staffId: luna.id, serviceId: zsvc("Relajante") },
      { staffId: luna.id, serviceId: zsvc("Pareja") },
      { staffId: luna.id, serviceId: zsvc("Ritual") },
      { staffId: luna.id, serviceId: zsvc("Facial") },
      { staffId: luna.id, serviceId: zsvc("Reflexología") },
      { staffId: diego.id, serviceId: zsvc("Relajante") },
      { staffId: diego.id, serviceId: zsvc("Descontracturante") },
      { staffId: diego.id, serviceId: zsvc("Ritual") },
    ],
  });

  for (const s of [luna, diego]) {
    await db.staffSchedule.createMany({
      data: [
        { staffId: s.id, weekday: 1, startMinute: 600, endMinute: 1140 },
        { staffId: s.id, weekday: 2, startMinute: 600, endMinute: 1140 },
        { staffId: s.id, weekday: 3, startMinute: 600, endMinute: 1140 },
        { staffId: s.id, weekday: 4, startMinute: 600, endMinute: 1140 },
        { staffId: s.id, weekday: 5, startMinute: 600, endMinute: 1140 },
        { staffId: s.id, weekday: 6, startMinute: 600, endMinute: 900 },
        { staffId: s.id, weekday: 0, startMinute: 600, endMinute: 900 },
      ],
    });
  }

  await db.agentConfig.create({
    data: {
      businessId: zen.id,
      agentName: "Arya",
      gender: "neutral",
      tone: "calm",
      personalityTraits: "tranquilo, mindful, empático, sereno",
      voiceType: "soft",
      speakingSpeed: 85,
      greeting: "Hola, bienvenido a Zen Spa. Soy Arya. Respira hondo... estás en buenas manos. ¿Qué necesita tu cuerpo hoy? Un masaje relajante, un ritual de piedras calientes... o simplemente un momento de paz?",
      farewell: "Namasté. Tu momento de paz está reservado. Recuerda: respirar profundo, soltar tensiones, y llegar 10 minutos antes para prepararte. Te esperamos en el santuario.",
      fallbackMessage: "Perdona, no he captado tu mensaje completamente. Respira un momento y dímelo de nuevo. Estoy aquí para guiarte hacia tu bienestar.",
      brandGuidelines: "Zen Spa Tenerife es un santuario de bienestar en Costa Adeje. Usamos solo productos orgánicos y aceites esenciales puros. Ambiente zen con sonidos de la naturaleza, iluminación tenue y aromaterapia. Ofrecemos té de hierbas antes y después de cada tratamiento. Zona de meditación disponible.",
      specialInstructions: "Si alguien menciona dolor de espalda, recomendar masaje descontracturante con Diego. Si viene en pareja, sugerir masaje en pareja con champagne de bienvenida. Siempre recomendar llegar 10 minutos antes. Si preguntan por regalos, mencionar nuestros vouchers de experiencia.",
      primaryColor: "#0d9488",
    },
  });

  console.log("✅ Seeded 3 businesses with distinct AI personalities:");
  console.log("   1. Bella Tenerife Beauty — Sofia (luxury, elegant)");
  console.log("   2. El Barbero Tenerife — Roco (playful, energetic)");
  console.log("   3. Zen Spa Tenerife — Arya (calm, mindful)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
