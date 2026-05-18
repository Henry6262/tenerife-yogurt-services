"use client";

import { useState, useRef, useCallback } from "react";
import { agentTalk, agentBook } from "./actions";
import { BookingPayment } from "@/components/booking-payment";
import { Mic, MicOff, Send, CheckCircle, User, Clock, MapPin, Loader2 } from "lucide-react";

interface AgentMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  options?: AgentOption[];
  payment?: { clientSecret: string; amount: number };
}

interface AgentOption {
  id: string;
  staffName: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  displayTime: string;
  displayDate: string;
}

interface AgentChatProps {
  businessSlug: string;
  businessName: string;
  agentName: string;
  primaryColor: string;
  greeting: string;
}

export function AgentChat({ businessSlug, businessName, agentName, primaryColor, greeting }: AgentChatProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    { id: "welcome", role: "agent", text: greeting },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [bookingDone, setBookingDone] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const buildHistory = (msgs: AgentMessage[]) => {
    const history: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of msgs) {
      if (m.id === "welcome") continue;
      history.push({ role: m.role === "user" ? "user" : "assistant", content: m.text });
    }
    return history;
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text }]);
    setInput("");
    setIsThinking(true);
    scrollToBottom();

    const history = buildHistory([...messages, { id: Date.now().toString(), role: "user", text }]);
    const result = await agentTalk(businessSlug, text, history);

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "agent",
        text: result.text,
        options: result.options,
      },
    ]);
    setIsThinking(false);
    scrollToBottom();

    // Auto-speak if supported
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(result.text);
      utterance.lang = "es-ES";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleBook = async (option: AgentOption) => {
    const name = prompt(`¿A qué nombre?`);
    if (!name) return;
    const phone = prompt(`¿Tu teléfono?`);
    if (!phone) return;
    const email = prompt(`¿Tu email? (opcional)`);

    const result = await agentBook(businessSlug, option.id, name, phone, email || undefined);
    if (result.success) {
      setBookingDone((prev) => new Set(prev).add(option.id));
      let text = `¡Perfecto, ${name}! Tu cita para ${option.serviceName.toLowerCase()} con ${option.staffName} el ${option.displayDate} a las ${option.displayTime} está confirmada.`;
      if (result.paymentRequired && result.clientSecret) {
        text += `\n\nPara garantizar tu cita, se requiere un depósito de ${result.depositAmount}€. Pulsa el botón de pago abajo ↓`;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "agent",
          text,
          payment: result.paymentRequired ? { clientSecret: result.clientSecret!, amount: result.depositAmount! } : undefined,
        },
      ]);
    }
  };

  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Tu navegador no soporta voz. Prueba Chrome."); return; }
    const recognition = new SR();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => handleSend(event.results[0][0].transcript);
    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 px-4 py-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "text-white rounded-br-md"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
              }`}
              style={msg.role === "user" ? { backgroundColor: primaryColor } : {}}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>

              {msg.options && msg.options.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.options.map((opt) => (
                    <div key={opt.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900 text-sm">{opt.serviceName}</div>
                        <div className="text-right">
                          <div className="text-lg font-bold" style={{ color: primaryColor }}>{opt.displayTime}</div>
                          <div className="text-xs text-gray-400">{opt.displayDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {opt.staffName}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {opt.serviceDuration} min</span>
                        <span>{opt.servicePrice}€</span>
                      </div>
                      {bookingDone.has(opt.id) ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" /> Confirmado
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBook(opt)}
                          className="w-full py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Reservar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {msg.payment && (
                <BookingPayment
                  clientSecret={msg.payment.clientSecret}
                  amount={msg.payment.amount}
                  onSuccess={() => {
                    setMessages((prev) => [
                      ...prev,
                      { id: Date.now().toString(), role: "agent", text: "¡Depósito recibido! Tu cita está 100% confirmada. Nos vemos pronto." },
                    ]);
                  }}
                />
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                {agentName} está pensando...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <button
            onClick={toggleVoice}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              isListening ? "animate-pulse text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={isListening ? { backgroundColor: primaryColor } : {}}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder={isListening ? "Escuchando..." : `Escribe o habla con ${agentName}...`}
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2"
            style={{ outlineColor: primaryColor }}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="w-12 h-12 rounded-full text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-40"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 max-w-2xl mx-auto">
          {["Corte urgente", "Manicura mañana", "Masaje hoy", "¿Qué servicios tenéis?"].map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs whitespace-nowrap hover:bg-gray-200 transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
