"use client";

import { FormEvent, useState } from "react";
import Container from "@/components/ui/container";

type FormStatus = "idle" | "success" | "error";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
      website: String(formData.get("website") || ""), // honeypot
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <Container>
        {/* HEADER */}
        <section className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Enquiry
          </p>

          <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
            Contact
          </h1>

          <p className="mt-8 max-w-3xl text-[20px] md:text-[22px] leading-[1.5] text-[var(--muted)]">
            For artwork enquiries, commissions, pricing, or availability, send a
            message below. We will respond as soon as possible with the next
            steps.
          </p>
        </section>

        {/* CONTENT */}
        <section className="mt-16 grid lg:grid-cols-[1fr_0.85fr] gap-14 md:gap-20 items-start">
          {/* FORM */}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 shadow-[0_12px_35px_rgba(0,0,0,0.04)]">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* HONEYPOT (ANTI-SPAM) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)]/70 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)]/70 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Subject
                </label>
                <input
                  name="subject"
                  type="text"
                  required
                  placeholder="Artwork enquiry / Commission / Availability"
                  className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)]/70 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={7}
                  required
                  placeholder="Tell us about the artwork or commission you have in mind..."
                  className="mt-3 w-full resize-none border border-[var(--border)] bg-white px-5 py-4 text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)]/70 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                />
              </div>

              <div className="flex flex-col items-start gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-w-[190px] items-center justify-center px-7 py-4 bg-[var(--foreground)] text-white text-sm uppercase tracking-[0.16em] transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-3">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending...
                    </span>
                  ) : (
                    "Send Enquiry"
                  )}
                </button>

                {status === "success" && (
                  <div className="w-full border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    Your enquiry has been sent successfully. We will get back to
                    you soon.
                  </div>
                )}

                {status === "error" && (
                  <div className="w-full border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {errorMessage || "Something went wrong. Please try again."}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* INFO */}
          <div className="space-y-10">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Contact Details
              </p>

              <div className="mt-5 space-y-4 text-[18px] leading-[1.6] text-[var(--muted)]">
                <p>
                  Email:
                  <br />
                  <span className="text-[var(--foreground)]">
                    hello@frequencyframed.com
                  </span>
                </p>

                <p>
                  Instagram:
                  <br />
                  <span className="text-[var(--foreground)]">
                    @frequency.framed.369
                  </span>
                </p>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-8">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Typical Enquiries
              </p>

              <div className="mt-5 space-y-3 text-[18px] leading-[1.6] text-[var(--muted)]">
                <p>• Availability of an artwork</p>
                <p>• Commission requests</p>
                <p>• Framing options</p>
                <p>• Shipping and delivery</p>
                <p>• Pricing and custom sizing</p>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-8">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Response Time
              </p>

              <p className="mt-5 text-[18px] leading-[1.6] text-[var(--muted)]">
                We aim to respond within 1–2 business days.
              </p>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}