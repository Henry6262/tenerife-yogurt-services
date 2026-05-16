"use client";

import { useState, useRef, useCallback } from "react";
import { aiSearchSlots, aiBook, type AIResult, type SlotOption } from "@/app/ai/actions";
import { Mic, MicOff, Send, CheckCircle, Clock, MapPin, User, Scissors, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  options?: SlotOption[];
  isTyping?: boolean;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "¡Hola! Soy tu asistente de belleza en Tenerife. ¿Qué necesitas? Puedes hablarme o escribirme. Por ejemplo: \"Necesito un corte de pelo urgente\" o \"Quiero una manicura para mañana por la tarde\".",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [bookingDone, setBookingDone] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);
    scrollToBottom();

    const result = await aiSearchSlots(text);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      text: result.message,
      options: result.options,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsThinking(false);
    scrollToBottom();
  };

  const handleBook = async (option: SlotOption) => {
    const name = prompt("¿A qué nombre quedamos la reserva?");
    if (!name) return;
    const phone = prompt("¿Tu número de teléfono?");
    if (!phone) return;

    const result = await aiBook(option.id, name, phone);
    if (result.success) {
      setBookingDone(option.id);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          text: `¡Listo! Tu cita para ${option.serviceName.toLowerCase()} con ${option.staffName} el ${option.displayDate} a las ${option.displayTime} está confirmada. ¡Te esperamos!`,
        },
      ]);
    } else {
      alert("No se pudo reservar. Intenta de nuevo.");
    }
  };

  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[700px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 px-4 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-rose-600 text-white rounded-br-md"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>

              {/* Slot options as cards */}
              {msg.options && msg.options.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: "#f43f5e" }}
                          >
                            <Scissors className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {opt.serviceName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {opt.serviceDuration} min · {opt.servicePrice}€
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-rose-600">
                            {opt.displayTime}
                          </div>
                          <div className="text-xs text-gray-400">{opt.displayDate}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {opt.staffName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {opt.businessName}
                        </span>
                      </div>

                      {bookingDone === opt.id ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" /> Reservado
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBook(opt)}
                          className="w-full py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition"
                        >
                          Reservar esta cita
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando los mejores horarios...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <button
            onClick={toggleVoice}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={isListening ? "Detener" : "Hablar"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder={isListening ? "Escuchando..." : "Escribe o habla..."}
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />

          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Quick prompts */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 max-w-2xl mx-auto">
          {[
            "Corte de pelo urgente",
            "Manicura mañana tarde",
            "Masaje relajante hoy",
            "Tinte con Maria",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs whitespace-nowrap hover:bg-gray-200 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
