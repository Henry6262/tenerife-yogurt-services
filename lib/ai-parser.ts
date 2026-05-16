/**
 * Local AI intent parser for beauty booking requests.
 * No API key needed — runs entirely in the browser/server.
 * Understands Spanish natural language for Tenerife beauty services.
 */

export interface ParsedIntent {
  serviceType: string | null; // "hair", "nails", "massage", "facial", "any"
  urgency: "now" | "today" | "tomorrow" | "this_week" | "any";
  timeOfDay: "morning" | "afternoon" | "evening" | "any";
  specificTime: string | null; // e.g. "16:00"
  location: string | null;
  duration: number | null; // preferred duration in minutes
  budget: number | null; // max budget in EUR
  staffPreference: string | null; // preferred staff name
}

const SERVICE_KEYWORDS: Record<string, string[]> = {
  hair: [
    "pelo", "corte", "cortar", "peluquería", "peluquero", "peluquera",
    "tinte", "mechas", "balayage", "color", "coloración", "tintur",
    "peinado", " brushing", "secado", "afeitado", "barba", "barbero",
    "rapado", "flequillo", "capilar",
  ],
  nails: [
    "uña", "uñas", "manicura", "pedicura", "gel", "acrílico", "esmalte",
    "nail", "shellac", "semipermanente", "tips", "cutícula",
  ],
  massage: [
    "masaje", "masajista", "relajante", "despalda", "espalda", "cuello",
    "dolor", "tensión", "contractura", "terapéutico", "deportivo",
    "californiano", "piedras", "candle",
  ],
  facial: [
    "cara", "facial", "limpieza", "rostro", "cutis", "acné", "arruga",
    "antiedad", "hidratante", "peeling", "mascarilla", "dermapen",
  ],
  waxing: [
    "depilación", "depilar", "cera", "láser", "ipl", "vello", "brazo",
    "pierna", "bikini", "ceja", "bigote",
  ],
  makeup: [
    "maquillaje", "maquillar", "evento", "boda", "noche", "pestaña",
    "extension", "microblading",
  ],
};

const URGENCY_KEYWORDS: Record<string, string[]> = {
  now: [
    "ahora", "ya", "urgente", "inmediato", "lo antes posible", "asap",
    "rápido", "prisa", "apuro", "no tengo tiempo", "cuanto antes",
    "enseguida", "esta hora", "en una hora", "dentro de una hora",
  ],
  today: [
    "hoy", "esta tarde", "esta mañana", "hoy día", "hoy mismo",
  ],
  tomorrow: [
    "mañana", "pasado mañana", "mañana por", "mañana en",
  ],
};

const TIME_OF_DAY_KEYWORDS: Record<string, string[]> = {
  morning: [
    "mañana", "mañanita", "por la mañana", "de mañana", "temprano",
    "antes de comer", "antes de mediodía",
  ],
  afternoon: [
    "tarde", "por la tarde", "de tarde", "después de comer",
    "media tarde", "sobremesa",
  ],
  evening: [
    "noche", "por la noche", "de noche", "tarde-noche", "después de trabajar",
    "última hora",
  ],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove accents
}

function extractNumberBeforeKeyword(text: string, keywords: string[]): number | null {
  const normalized = normalize(text);
  for (const kw of keywords) {
    const regex = new RegExp(`(\\d+)\\s*${kw}`, "i");
    const match = normalized.match(regex);
    if (match) return parseInt(match[1], 10);
  }
  return null;
}

export function parseIntent(rawText: string): ParsedIntent {
  const text = normalize(rawText);

  // Detect service type
  let serviceType: string | null = null;
  let bestScore = 0;
  for (const [type, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    const score = keywords.filter((kw) => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      serviceType = type;
    }
  }
  if (!serviceType && text.includes("belleza")) serviceType = "any";
  if (!serviceType && text.includes("spa")) serviceType = "massage";
  if (!serviceType && text.includes("bienestar")) serviceType = "massage";

  // Detect urgency
  let urgency: ParsedIntent["urgency"] = "any";
  for (const [level, keywords] of Object.entries(URGENCY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      urgency = level as ParsedIntent["urgency"];
      break;
    }
  }

  // Detect time of day
  let timeOfDay: ParsedIntent["timeOfDay"] = "any";
  for (const [tod, keywords] of Object.entries(TIME_OF_DAY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      timeOfDay = tod as ParsedIntent["timeOfDay"];
      break;
    }
  }

  // Specific time (e.g. "a las 4", "16:00")
  let specificTime: string | null = null;
  const timeMatch = text.match(/(?:a las?|hora)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3];
    if (ampm === "pm" && hour < 12) hour += 12;
    if (ampm === "am" && hour === 12) hour = 0;
    specificTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }

  // Duration preference
  let duration: number | null = null;
  const durMatch = text.match(/(\d+)\s*(min|minuto|hora)/);
  if (durMatch) {
    duration = parseInt(durMatch[1], 10);
    if (durMatch[2].startsWith("hora")) duration *= 60;
  }

  // Budget
  let budget: number | null = null;
  const budgetMatch = text.match(/(?:menos de|hasta|máximo|maximo)\s*(\d+)\s*€?/);
  if (budgetMatch) budget = parseInt(budgetMatch[1], 10);

  // Location
  let location: string | null = null;
  const locKeywords = ["los cristianos", "playa de las americas", "costa adeje", "santa cruz", "puerto de la cruz", "la laguna"];
  for (const loc of locKeywords) {
    if (text.includes(loc)) {
      location = loc;
      break;
    }
  }

  // Staff preference
  let staffPreference: string | null = null;
  const staffNames = ["maria", "carlos", "ana", "laura", "pedro"];
  for (const name of staffNames) {
    if (text.includes(name)) {
      staffPreference = name;
      break;
    }
  }

  return {
    serviceType,
    urgency,
    timeOfDay,
    specificTime,
    location,
    duration,
    budget,
    staffPreference,
  };
}

export function intentToHumanText(intent: ParsedIntent): string {
  const parts: string[] = [];
  if (intent.serviceType) parts.push(`servicio: ${intent.serviceType}`);
  if (intent.urgency !== "any") parts.push(`urgencia: ${intent.urgency}`);
  if (intent.timeOfDay !== "any") parts.push(`horario: ${intent.timeOfDay}`);
  if (intent.specificTime) parts.push(`hora: ${intent.specificTime}`);
  if (intent.location) parts.push(`zona: ${intent.location}`);
  if (intent.budget) parts.push(`máx: ${intent.budget}€`);
  return parts.join(" · ") || "cualquier servicio";
}
