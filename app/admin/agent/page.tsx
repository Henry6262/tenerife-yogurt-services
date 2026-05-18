import { db } from "@/lib/db";
import { getCurrentUserBusiness } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Save, Bot, Mic, Palette, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AgentBuilderPage() {
  const business = await getCurrentUserBusiness();
  if (!business) redirect("/admin/onboarding");

  const cfg = business.agentConfig;
  const businessId = business.id;

  async function saveAgent(formData: FormData) {
    "use server";
    const data = {
      agentName: formData.get("agentName") as string,
      gender: formData.get("gender") as string,
      tone: formData.get("tone") as string,
      personalityTraits: formData.get("personalityTraits") as string,
      voiceType: formData.get("voiceType") as string,
      speakingSpeed: parseInt(formData.get("speakingSpeed") as string),
      greeting: formData.get("greeting") as string,
      farewell: formData.get("farewell") as string,
      fallbackMessage: formData.get("fallbackMessage") as string,
      brandGuidelines: formData.get("brandGuidelines") as string,
      specialInstructions: formData.get("specialInstructions") as string,
      primaryColor: formData.get("primaryColor") as string,
    };

    await db.agentConfig.upsert({
      where: { businessId: businessId },
      update: data,
      create: { ...data, businessId: businessId },
    });

    redirect("/admin/agent?saved=1");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver al panel
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Bot className="w-8 h-8 text-rose-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crea tu AI Agent</h1>
          <p className="text-sm text-gray-500">
            Personaliza cómo tu agente habla con tus clientes. Cada negocio tiene su propia personalidad.
          </p>
        </div>
      </div>

      <form action={saveAgent} className="space-y-8">
        {/* Identity */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-rose-600" />
            <h2 className="font-bold text-gray-900">Identidad</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del agente</label>
              <input
                name="agentName"
                defaultValue={cfg?.agentName ?? "Sofia"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Ej: Sofia, Luna, Max"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Género de voz</label>
              <select
                name="gender"
                defaultValue={cfg?.gender ?? "female"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="female">Femenino</option>
                <option value="male">Masculino</option>
                <option value="neutral">Neutro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Personality */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-rose-600" />
            <h2 className="font-bold text-gray-900">Personalidad</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tono</label>
              <select
                name="tone"
                defaultValue={cfg?.tone ?? "friendly"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="friendly">Amigable</option>
                <option value="professional">Profesional</option>
                <option value="luxury">Lujo / Elegante</option>
                <option value="playful">Divertido / Juvenil</option>
                <option value="calm">Tranquilo / Zen</option>
                <option value="casual">Casual / Directo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de voz</label>
              <select
                name="voiceType"
                defaultValue={cfg?.voiceType ?? "default"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="default">Por defecto</option>
                <option value="warm">Cálida</option>
                <option value="energetic">Energética</option>
                <option value="soft">Suave</option>
                <option value="authoritative">Autoritaria</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rasgos de personalidad</label>
            <input
              name="personalityTraits"
              defaultValue={cfg?.personalityTraits ?? "amable, paciente, experta"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="elegante, divertida, relajada..."
            />
            <p className="text-xs text-gray-400 mt-1">Separados por comas. Estos definen cómo se expresa tu agente.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Velocidad de habla</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                name="speakingSpeed"
                min="50"
                max="150"
                defaultValue={cfg?.speakingSpeed ?? 100}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{cfg?.speakingSpeed ?? 100}%</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5 text-rose-600" />
            <h2 className="font-bold text-gray-900">Mensajes</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saludo inicial</label>
              <textarea
                name="greeting"
                defaultValue={cfg?.greeting ?? "¡Hola! Soy tu asistente de belleza. ¿En qué puedo ayudarte?"}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Despedida</label>
              <textarea
                name="farewell"
                defaultValue={cfg?.farewell ?? "¡Gracias! Te esperamos."}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de fallback</label>
              <textarea
                name="fallbackMessage"
                defaultValue={cfg?.fallbackMessage ?? "Lo siento, no entendí. ¿Puedes repetirlo?"}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Brand */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-rose-600" />
            <h2 className="font-bold text-gray-900">Marca y conocimiento</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guía de marca</label>
              <textarea
                name="brandGuidelines"
                defaultValue={cfg?.brandGuidelines ?? ""}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Usamos productos veganos. Ofrecemos champagne gratis. Ambiente relajante..."
              />
              <p className="text-xs text-gray-400 mt-1">El agente mencionará estos detalles cuando sea relevante.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones especiales</label>
              <textarea
                name="specialInstructions"
                defaultValue={cfg?.specialInstructions ?? ""}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Si preguntan por alergias, preguntar por gluten. Priorizar a Carlos para cortes masculinos..."
              />
              <p className="text-xs text-gray-400 mt-1">Reglas específicas que el agente debe seguir siempre.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color principal</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="primaryColor"
                  defaultValue={cfg?.primaryColor ?? "#f43f5e"}
                  className="w-10 h-10 rounded border border-gray-300"
                />
                <span className="text-sm text-gray-500">Elige el color de tu agente</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition"
          >
            <Save className="w-4 h-4" />
            Guardar agente
          </button>

          {cfg && (
            <a
              href={`/agent/${business.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              <Bot className="w-4 h-4" />
              Ver agente en vivo
            </a>
          )}
        </div>
      </form>
    </div>
  );
}
