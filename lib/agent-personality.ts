import { db } from "./db";
import { parseIntent, type ParsedIntent } from "./ai-parser";
import { loadSlotsForStaff } from "./slots";
import { extractIntentWithLLM, generateAgentReply, isOpenAIEnabled } from "./openai";

export interface AgentPersonality {
  agentName: string;
  gender: string;
  tone: string;
  personalityTraits: string[];
  voiceType: string;
  speakingSpeed: number;
  greeting: string;
  farewell: string;
  fallbackMessage: string;
  brandGuidelines: string;
  specialInstructions: string;
  primaryColor: string;
  avatarUrl: string | null;
}

export async function getAgentPersonality(businessSlug: string): Promise<AgentPersonality | null> {
  const business = await db.business.findUnique({
    where: { slug: businessSlug },
    include: { agentConfig: true },
  });

  if (!business?.agentConfig) return null;

  const cfg = business.agentConfig;
  return {
    agentName: cfg.agentName,
    gender: cfg.gender,
    tone: cfg.tone,
    personalityTraits: cfg.personalityTraits.split(",").map((t) => t.trim()).filter(Boolean),
    voiceType: cfg.voiceType,
    speakingSpeed: cfg.speakingSpeed,
    greeting: cfg.greeting,
    farewell: cfg.farewell,
    fallbackMessage: cfg.fallbackMessage,
    brandGuidelines: cfg.brandGuidelines,
    specialInstructions: cfg.specialInstructions,
    primaryColor: cfg.primaryColor,
    avatarUrl: cfg.avatarUrl,
  };
}

export interface AgentSlotOption {
  id: string;
  staffId: string;
  staffName: string;
  staffBio: string | null;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  startTime: string;
  displayTime: string;
  displayDate: string;
}

export interface AgentResponse {
  text: string;
  options?: AgentSlotOption[];
  type: "greeting" | "results" | "no_results" | "fallback" | "farewell" | "booking_confirmed";
}

// Tone-based response templates
const TONE_TEMPLATES: Record<string, { greeting: string; result: string; noResult: string; confirm: string }> = {
  friendly: {
    greeting: "¡Hola! Soy {name}. ¿Qué te apetece hoy?",
    result: "¡Genial! Encontré {count} opcion(es) para ti. Mira:",
    noResult: "Uy, no encontré nada para eso justo ahora. ¿Te vale otro día o horario?",
    confirm: "¡Listo! Tu cita está confirmada. ¡Nos vemos pronto!",
  },
  professional: {
    greeting: "Buenos días. Soy {name}, su asistente de reservas. ¿En qué puedo ayudarle?",
    result: "He localizado {count} opcion(es) disponibles. Por favor, revise los detalles:",
    noResult: "Lamento comunicarle que no hay disponibilidad para su solicitud en este momento. ¿Le gustaría que busque alternativas?",
    confirm: "Su reserva ha sido confirmada con éxito. Le esperamos puntualmente.",
  },
  luxury: {
    greeting: "Bienvenido a nuestro santuario de belleza. Soy {name}, su asistente personal. Permítame crear la experiencia perfecta para usted.",
    result: "He seleccionado {count} opción(es) exquisitas. Cada una ha sido elegida pensando en su bienestar:",
    noResult: "Lamento que en este momento no tengamos disponibilidad para su solicitud. Permítame sugerirle una alternativa que igualmente será una experiencia memorable.",
    confirm: "Será un verdadero honor recibirle. Su experiencia ha sido cuidadosamente preparada. Le esperamos.",
  },
  playful: {
    greeting: "¡Hey! Soy {name} y estoy aquí para hacerte brillar ✨ ¿Qué necesitas?",
    result: "¡Boom! Encontré {count} opcion(es) que te van a encantar:",
    noResult: "Nada por aquí... ¿Y si pruebas otro día? ¡Seguro que hay algo épico!",
    confirm: "¡Reservado! Ya eres oficialmente más guapo/a. ¡Nos vemos!",
  },
  calm: {
    greeting: "Hola, soy {name}. Tómate tu tiempo. Estoy aquí cuando lo necesites.",
    result: "Aquí tienes {count} opción(es) tranquilas para ti:",
    noResult: "No hay prisa. No encontré nada ahora, pero podemos mirar juntos otro momento.",
    confirm: "Todo listo. Respira hondo. Tu momento de paz te espera.",
  },
  casual: {
    greeting: "¡Qué pasa! Soy {name}. ¿Qué necesitas?",
    result: "Mira, encontré {count} opcion(es):",
    noResult: "No hay nada por ahí ahora. ¿Otros horarios?",
    confirm: "Hecho. Nos vemos.",
  },
};

function applyPersonality(text: string, personality: AgentPersonality): string {
  let result = text.replace(/{name}/g, personality.agentName);

  // Add trait flavor randomly
  const traits = personality.personalityTraits;
  if (traits.length > 0 && result.length < 200) {
    const trait = traits[Math.floor(Math.random() * traits.length)];
    // Subtle trait injection based on tone
    if (personality.tone === "luxury" && trait === "elegante") {
      result = result.replace(".", ", con todo el refinamiento que merece.");
    }
  }

  return result;
}

export async function agentSearch(
  businessSlug: string,
  userText: string,
  personality: AgentPersonality,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<AgentResponse> {
  const business = await db.business.findUnique({
    where: { slug: businessSlug },
    include: {
      services: { where: { isActive: true } },
      staff: { where: { isActive: true }, include: { staffServices: { include: { service: true } } } },
    },
  });
  if (!business) {
    return { text: personality.fallbackMessage, type: "fallback" };
  }

  // Try LLM intent extraction if OpenAI is configured
  let intent: ParsedIntent;
  let llmReply: string | null = null;

  if (isOpenAIEnabled()) {
    try {
      const llmIntent = await extractIntentWithLLM(userText, conversationHistory);

      if (llmIntent.isGreeting) {
        const reply = await generateAgentReply({
          agentName: personality.agentName,
          tone: personality.tone,
          businessName: business.name,
          services: business.services.map((s) => s.name),
          foundSlots: 0,
          greeting: true,
        }, userText);
        return { text: reply, type: "greeting" };
      }
      if (llmIntent.isFarewell) {
        const reply = await generateAgentReply({
          agentName: personality.agentName,
          tone: personality.tone,
          businessName: business.name,
          services: business.services.map((s) => s.name),
          foundSlots: 0,
          farewell: true,
        }, userText);
        return { text: reply, type: "farewell" };
      }
      if (llmIntent.rawReply) {
        return { text: llmIntent.rawReply, type: "fallback" };
      }

      intent = {
        serviceType: llmIntent.serviceType || "any",
        urgency: llmIntent.urgency,
        timeOfDay: llmIntent.timeOfDay,
        specificTime: llmIntent.specificTime,
        location: null,
        duration: null,
        budget: null,
        staffPreference: llmIntent.staffPreference,
      };
    } catch {
      // Fallback to rule-based parser
      intent = parseIntent(userText);
    }
  } else {
    // Rule-based fallback
    intent = parseIntent(userText);

    // Check for greetings/farewells
    const lower = userText.toLowerCase();
    if (["hola", "buenos dias", "buenas", "hey", "saludos"].some((w) => lower.includes(w))) {
      return { text: personality.greeting, type: "greeting" };
    }
    if (["adios", "hasta luego", "chao", "gracias", "nos vemos"].some((w) => lower.includes(w))) {
      return { text: personality.farewell, type: "farewell" };
    }
  }

  // Map service type to service names
  const serviceTypeMap: Record<string, string[]> = {
    hair: ["Corte de Pelo Mujer", "Corte de Pelo Hombre", "Tinte Completo", "Mechas"],
    nails: ["Manicura", "Pedicura"],
    massage: ["Masaje Relajante"],
    facial: ["Tratamiento Facial"],
    waxing: [],
    makeup: [],
    any: [],
  };

  const targetNames = intent.serviceType ? serviceTypeMap[intent.serviceType] || [] : [];

  const services = business.services.filter((s) =>
    targetNames.length > 0 ? targetNames.includes(s.name) : true
  );

  if (services.length === 0) {
    if (isOpenAIEnabled()) {
      try {
        const reply = await generateAgentReply({
          agentName: personality.agentName,
          tone: personality.tone,
          businessName: business.name,
          services: business.services.map((s) => s.name),
          foundSlots: 0,
          noResults: true,
        }, userText);
        return { text: reply, type: "no_results" };
      } catch { /* fall through */ }
    }
    const tpl = TONE_TEMPLATES[personality.tone] || TONE_TEMPLATES.friendly;
    return { text: applyPersonality(tpl.noResult, personality), type: "no_results" };
  }

  // Search slots
  const dates = getDates(intent.urgency);
  const todRange = timeOfDayToMinutes(intent.timeOfDay);
  const options: AgentSlotOption[] = [];

  for (const service of services) {
    for (const staff of business.staff) {
      const canDoService = staff.staffServices.some((ss) => ss.service.id === service.id);
      if (!canDoService) continue;
      if (intent.staffPreference && !normalize(staff.name).includes(normalize(intent.staffPreference))) continue;

      for (const dateStr of dates) {
        const result = await loadSlotsForStaff(staff.id, dateStr, service.id);
        if (result.error || !result.slots) continue;

        for (const slot of result.slots) {
          if (intent.specificTime) {
            const diff = Math.abs(
              parseInt(slot.time.replace(":", "")) - parseInt(intent.specificTime.replace(":", ""))
            );
            if (diff > 100) continue;
          }
          if (todRange) {
            const mins = parseInt(slot.time.split(":")[0]) * 60 + parseInt(slot.time.split(":")[1]);
            if (mins < todRange.min || mins > todRange.max) continue;
          }

          options.push({
            id: `${staff.id}_${slot.isoStart}`,
            staffId: staff.id,
            staffName: staff.name,
            staffBio: staff.bio,
            serviceId: service.id,
            serviceName: service.name,
            servicePrice: service.price,
            serviceDuration: service.durationMinutes,
            startTime: slot.isoStart,
            displayTime: slot.time,
            displayDate: dateStr,
          });
        }
      }
    }
  }

  options.sort((a, b) => a.startTime.localeCompare(b.startTime));
  const top = options.slice(0, 5);

  if (top.length === 0) {
    if (isOpenAIEnabled()) {
      try {
        const reply = await generateAgentReply({
          agentName: personality.agentName,
          tone: personality.tone,
          businessName: business.name,
          services: business.services.map((s) => s.name),
          foundSlots: 0,
          noResults: true,
        }, userText);
        return { text: reply, type: "no_results" };
      } catch { /* fall through */ }
    }
    const tpl = TONE_TEMPLATES[personality.tone] || TONE_TEMPLATES.friendly;
    return { text: applyPersonality(tpl.noResult, personality), type: "no_results" };
  }

  // Generate reply with LLM if available
  if (isOpenAIEnabled()) {
    try {
      const reply = await generateAgentReply({
        agentName: personality.agentName,
        tone: personality.tone,
        businessName: business.name,
        services: business.services.map((s) => s.name),
        foundSlots: top.length,
      }, userText);
      return { text: reply, options: top, type: "results" };
    } catch { /* fall through to templates */ }
  }

  const tpl = TONE_TEMPLATES[personality.tone] || TONE_TEMPLATES.friendly;
  let resultText = applyPersonality(tpl.result.replace("{count}", String(top.length)), personality);

  if (personality.brandGuidelines && intent.serviceType === "hair") {
    if (personality.brandGuidelines.toLowerCase().includes("vegano")) {
      resultText += " Todos nuestros tratamientos capilares son 100% veganos.";
    }
  }

  return { text: resultText, options: top, type: "results" };
}

function getDates(urgency: ParsedIntent["urgency"]): string[] {
  const dates: string[] = [];
  const today = new Date();
  if (urgency === "now" || urgency === "today") dates.push(today.toISOString().slice(0, 10));
  if (urgency === "tomorrow") {
    const t = new Date(today); t.setDate(today.getDate() + 1); dates.push(t.toISOString().slice(0, 10));
  }
  if (urgency === "this_week" || urgency === "any") {
    for (let i = 0; i < 7; i++) { const d = new Date(today); d.setDate(today.getDate() + i); dates.push(d.toISOString().slice(0, 10)); }
  }
  return dates;
}

function timeOfDayToMinutes(tod: ParsedIntent["timeOfDay"]) {
  switch (tod) {
    case "morning": return { min: 0, max: 720 };
    case "afternoon": return { min: 720, max: 1080 };
    case "evening": return { min: 1080, max: 1440 };
    default: return null;
  }
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
