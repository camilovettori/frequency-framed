"use client";

import { FormEvent, useState } from "react";
import {
  ExpressCheckoutElement,
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

  async function confirmWithElements() {
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage("");

    const submitResult = await elements.submit();

    if (submitResult.error) {
      setErrorMessage(
        submitResult.error.message || "Please complete the payment form."
      );
      setIsSubmitting(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
        payment_method_data: {
          billing_details: {
            name: `${billingDetails.firstName} ${billingDetails.lastName}`.trim(),
            email: billingDetails.email,
            phone: billingDetails.phone,
            address: {
              line1: billingDetails.addressLine1,
              line2: billingDetails.addressLine2 || undefined,
              city: billingDetails.city,
              state: billingDetails.county,
              postal_code: billingDetails.postalCode,
              country:
                billingDetails.country === "Ireland"
                  ? "IE"
                  : billingDetails.country === "United Kingdom"
                  ? "GB"
                  : billingDetails.country === "Portugal"
                  ? "PT"
                  : billingDetails.country === "Brazil"
                  ? "BR"
                  : billingDetails.country === "Spain"
                  ? "ES"
                  : billingDetails.country === "France"
                  ? "FR"
                  : billingDetails.country === "Germany"
                  ? "DE"
                  : billingDetails.country === "Italy"
                  ? "IT"
                  : "IE",
            },
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

    const paymentIntent = result.paymentIntent;

    if (!paymentIntent) {
      setErrorMessage("Payment could not be confirmed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    switch (paymentIntent.status) {
      case "succeeded":
        window.location.href = "/success";
        return;

      case "processing":
        setErrorMessage(
          "Your payment is processing. Please wait a moment and check again."
        );
        setIsSubmitting(false);
        return;

      case "requires_payment_method":
        setErrorMessage(
          "Payment method was not completed. Please re-enter your card details and try again."
        );
        setIsSubmitting(false);
        return;

      case "requires_action":
        setErrorMessage(
          "Additional authentication is required. Please follow the next step."
        );
        setIsSubmitting(false);
        return;

      default:
        setErrorMessage(`Unexpected payment status: ${paymentIntent.status}`);
        setIsSubmitting(false);
        return;
    }
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