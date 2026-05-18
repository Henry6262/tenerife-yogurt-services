"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function PaymentForm({ clientSecret, amount, onSuccess }: { clientSecret: string; amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "Error en el pago");
    } else if (paymentIntent?.status === "succeeded") {
      setMessage("¡Pago completado! Tu cita está confirmada.");
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
      >
        {isLoading ? "Procesando..." : `Pagar depósito de ${amount}€`}
      </button>
      {message && (
        <p className={`text-xs text-center ${message.includes("completado") ? "text-emerald-600" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </form>
  );
}

export function BookingPayment({
  clientSecret,
  amount,
  onSuccess,
}: {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
}) {
  if (!stripePromise) return <p className="text-xs text-red-500">Stripe no configurado</p>;

  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
        <PaymentForm clientSecret={clientSecret} amount={amount} onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}
