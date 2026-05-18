import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export function isOpenAIEnabled(): boolean {
  return !!openai;
}

export interface LLMIntent {
  serviceType: string | null;
  serviceName: string | null;
  urgency: "now" | "today" | "tomorrow" | "this_week" | "any";
  timeOfDay: "morning" | "afternoon" | "evening" | "any";
  specificTime: string | null;
  staffPreference: string | null;
  customerName: string | null;
  customerPhone: string | null;
  isGreeting: boolean;
  isFarewell: boolean;
  isBookingConfirmation: boolean;
  selectedOptionIndex: number | null;
  rawReply: string | null;
}

const INTENT_SYSTEM_PROMPT = `You are an intent extractor for a Spanish beauty salon booking AI assistant.
Analyze the user's message and return a JSON object with these fields:

- serviceType: one of "hair", "nails", "massage", "facial", "waxing", "makeup", "any", or null
- serviceName: specific service name if mentioned (e.g. "Manicura", "Corte de Pelo"), or null
- urgency: one of "now", "today", "tomorrow", "this_week", "any"
- timeOfDay: one of "morning", "afternoon", "evening", "any"
- specificTime: specific time like "16:00" or null
- staffPreference: staff name if mentioned, or null
- customerName: customer's name if they provide it, or null
- customerPhone: phone number if provided, or null
- isGreeting: true if message is just a greeting (hola, buenos dias, etc)
- isFarewell: true if message is a goodbye (adios, gracias, etc)
- isBookingConfirmation: true if user is confirming a booking option (e.g. "la primera", "el martes", "sí quiero esa")
- selectedOptionIndex: 0-based index if user refers to an option by position ("la primera", "el primero", "la segunda")
- rawReply: if the user asks a general question not related to booking, provide a helpful friendly Spanish response. Otherwise null.

Rules:
- Be lenient with Spanish spelling and slang.
- "mañana" as time = morning, "mañana" as date = tomorrow.
- Return ONLY valid JSON. No markdown, no explanation.`;

export async function extractIntentWithLLM(
  userText: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<LLMIntent> {
  if (!openai) {
    throw new Error("OpenAI not configured");
  }

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: INTENT_SYSTEM_PROMPT },
    ...conversationHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userText },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.3,
    max_tokens: 500,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);

  return {
    serviceType: parsed.serviceType || null,
    serviceName: parsed.serviceName || null,
    urgency: parsed.urgency || "any",
    timeOfDay: parsed.timeOfDay || "any",
    specificTime: parsed.specificTime || null,
    staffPreference: parsed.staffPreference || null,
    customerName: parsed.customerName || null,
    customerPhone: parsed.customerPhone || null,
    isGreeting: !!parsed.isGreeting,
    isFarewell: !!parsed.isFarewell,
    isBookingConfirmation: !!parsed.isBookingConfirmation,
    selectedOptionIndex: parsed.selectedOptionIndex ?? null,
    rawReply: parsed.rawReply || null,
  };
}

export async function generateAgentReply(
  context: {
    agentName: string;
    tone: string;
    businessName: string;
    services: string[];
    foundSlots: number;
    greeting?: boolean;
    farewell?: boolean;
    noResults?: boolean;
  },
  userText: string
): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI not configured");
  }

  const prompt = `You are ${context.agentName}, a ${context.tone} AI booking assistant for ${context.businessName} in Tenerife, Spain. You speak Spanish.

Services offered: ${context.services.join(", ")}
${context.foundSlots > 0 ? `Found ${context.foundSlots} available slots.` : "No slots found for the request."}
${context.greeting ? "This is a greeting." : ""}
${context.farewell ? "This is a farewell." : ""}
${context.noResults ? "No results — suggest alternative days/times politely." : ""}

User message: "${userText}"

Reply in a single short paragraph (max 2 sentences). Be warm, natural, and concise. Do not use markdown.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content || "¿En qué puedo ayudarte?";
}
