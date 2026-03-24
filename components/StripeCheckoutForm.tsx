"use client";

import { FormEvent, useState } from "react";
import {
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

export default function StripeCheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expressReady, setExpressReady] = useState(false);

  async function confirmWithElements() {
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "Payment failed.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = "/success";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) return;

    await confirmWithElements();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-[var(--border)] bg-white p-5">
        <ExpressCheckoutElement
          options={{
            buttonHeight: 48,
            buttonType: {
              applePay: "check-out",
              googlePay: "checkout",
            },
            buttonTheme: {
              applePay: "black",
              googlePay: "black",
            },
            layout: {
              maxColumns: 2,
              maxRows: 1,
              overflow: "auto",
            },
          }}
          onReady={({ availablePaymentMethods }) => {
            setExpressReady(!!availablePaymentMethods);
          }}
          onConfirm={async () => {
            await confirmWithElements();
          }}
        />
      </div>

      {!expressReady && (
        <div className="text-sm text-[var(--muted)]">
          Apple Pay and Google Pay will appear automatically when supported on
          the current device/browser.
        </div>
      )}

      <div className="border border-[var(--border)] bg-white p-5">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        className="inline-flex items-center justify-center px-7 py-4 bg-[var(--foreground)] text-white text-sm uppercase tracking-[0.16em] transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Processing..." : "Pay Now"}
      </button>

      {errorMessage && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}
    </form>
  );
}