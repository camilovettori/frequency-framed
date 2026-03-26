"use client";

import { FormEvent, useState } from "react";
import Container from "@/components/ui/container";

type FormStatus = "idle" | "success" | "error";

export default function ContactPageClient() {
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
      website: String(formData.get("website") || ""),
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
    <main className="pb-24 pt-20 md:pb-32 md:pt-24">
      <Container>
        <section className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Enquiry
          </p>

          <h1 className="mt-6 text-5xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)] md:text-7xl">
            Contact
          </h1>

          <p className="mt-8 max-w-3xl text-[20px] leading-[1.5] text-[var(--muted)] md:text-[22px]">
            For artwork enquiries, commissions, pricing, or availability, send a
            message below. We will respond as soon as possible with the next
            steps.
          </p>
        </section>

        <section className="mt-16 grid items-start gap-14 md:gap-20 lg:grid-cols-[1fr_0.85fr]">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_12px_35px_rgba(0,0,0,0.04)] md:p-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="hidden" aria-hidden="true">
                <input name="website" type="text" tabIndex={-1} />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Name
                </label>
                <input
                  name="name"
                  required
                  placeholder="Your name"
                  className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none focus:border-[var(--foreground)]"
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
                  className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none focus:border-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Subject
                </label>
                <input
                  name="subject"
                  required
                  placeholder="Artwork enquiry / Commission / Availability"
                  className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none focus:border-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={6}
                  required
                  placeholder="Tell us about your request..."
                  className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none focus:border-[var(--foreground)]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[var(--foreground)] px-7 py-4 text-sm uppercase tracking-[0.16em] text-white hover:opacity-90"
              >
                {isSubmitting ? "Sending..." : "Send Enquiry"}
              </button>

              {status === "success" && (
                <p className="text-sm text-green-600">
                  Message sent successfully.
                </p>
              )}

              {status === "error" && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}
            </form>
          </div>

          <div className="space-y-10">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Contact Details
              </p>

              <div className="mt-5 space-y-6 text-[18px] text-[var(--muted)]">
                <p>
                  Email:
                  <br />
                  <span className="text-[var(--foreground)]">
                    hello@frequencyframed.com
                  </span>
                </p>

                <div className="space-y-3">
                  <a
                    href="https://www.instagram.com/frequency.framed.369?igsh=MWllZnY3enNudndzMw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[var(--foreground)] hover:opacity-70"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <circle cx="12" cy="12" r="4" stroke="currentColor" />
                    </svg>
                    @frequency.framed.369
                  </a>

                  <a
                    href="https://www.facebook.com/share/1C9gBWo55L/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[var(--foreground)] hover:opacity-70"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2V9.5c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.3 3H13v7A10 10 0 0 0 22 12z"
                      />
                    </svg>
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-8">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Typical Enquiries
              </p>

              <div className="mt-5 space-y-2 text-[var(--muted)]">
                <p>• Availability</p>
                <p>• Commission</p>
                <p>• Framing</p>
                <p>• Shipping</p>
                <p>• Pricing</p>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-8">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Response Time
              </p>

              <p className="mt-5 text-[var(--muted)]">1–2 business days.</p>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}