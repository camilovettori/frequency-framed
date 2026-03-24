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
            paymentMethods: {
              applePay: "always",
              googlePay: "always",
              link: "never",
              paypal: "never",
              amazonPay: "never",
              klarna: "never",
            },
            layout: {
              maxColumns: 2,
              maxRows: 1,
              overflow: "never",
            },
          }}
          onConfirm={async () => {
            await confirmWithElements();
          }}
        />
      </div>

      <div className="border border-[var(--border)] bg-white p-5">
        <PaymentElement
          options={{
            wallets: {
              applePay: "never",
              googlePay: "never",
            },
            terms: {
              card: "never",
            },
            fields: {
              billingDetails: {
                name: "never",
                email: "never",
                phone: "never",
                address: "never",
              },
            },
          }}
        />
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