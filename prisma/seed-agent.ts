import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const business = await db.business.findFirst({ where: { slug: "bella-tenerife" } });
  if (!business) {
    console.log("Run db:seed first to create the business");
    return;
  }

  await db.agentConfig.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      agentName: "Sofia",
      gender: "female",
      tone: "luxury",
      personalityTraits: "elegante, atenta, relajada, experta",
      voiceType: "warm",
      speakingSpeed: 95,
      greeting: "¡Bienvenida a Bella Tenerife! Soy Sofia, tu asistente personal de belleza. Cuéntame, ¿qué te apetece hoy? Un corte, un masaje relajante... o quizás algo de color?",
      farewell: "Ha sido un placer atenderte. Te esperamos con los brazos abiertos y una copa de cava bien fría. ¡Hasta pronto!",
      fallbackMessage: "Disculpa, no te he entendido del todo. ¿Puedes repetirlo? Estoy aquí para ayudarte a encontrar el momento perfecto para ti.",
      brandGuidelines: "Bella Tenerife es un salón de lujo en Los Cristianos. Usamos productos premium veganos de Kevin Murphy y OPI. Ofrecemos champagne o infusiones a todas nuestras clientas. Nuestro ambiente es relajante con música chill-out.",
      specialInstructions: "Si alguien pregunta por alergias, preguntar específicamente sobre gluten y níquel. Si pide un corte de pelo urgente, priorizar a Carlos para hombres y Maria para mujeres. Siempre ofrecer champú incluido.",
      primaryColor: "#be185d",
    },
  });

  console.log("Seeded AgentConfig for Bella Tenerife");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
