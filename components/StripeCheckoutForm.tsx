"use client";

import { FormEvent, useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

type StripeCheckoutFormProps = {
  billingDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    county: string;
    postalCode: string;
    country: string;
  };
};

export default function StripeCheckoutForm({
  billingDetails,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
        payment_method_data: {
          billing_details: {
            name: `${billingDetails.firstName} ${billingDetails.lastName}`.trim(),
            email: billingDetails.email,
            phone: billingDetails.phone,
          },
        },
      },
      redirect: "if_required",
    });

    if (result.error) {
      setErrorMessage(result.error.message || "Payment failed.");
      setIsSubmitting(false);
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      window.location.href = "/success";
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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