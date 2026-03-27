import Link from "next/link";
import Container from "../ui/container";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border)]">
      <Container>
        <div className="grid gap-14 py-14 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-lg text-[var(--foreground)]">
              Frequency Framed
            </p>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              Original oil paintings blending art, symbolism, and numerology —
              created to evoke meaning, energy, and visual presence.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 md:justify-items-end">
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                Explore
              </p>

              <div className="flex flex-col gap-3 text-sm">
                <Link
                  href="/blog"
                  className="opacity-70 transition hover:text-[var(--foreground)] hover:opacity-100"
                >
                  Journal
                </Link>

                <Link
                  href="/reviews"
                  className="opacity-70 transition hover:text-[var(--foreground)] hover:opacity-100"
                >
                  Reviews
                </Link>

                <Link
                  href="/faq"
                  className="opacity-70 transition hover:text-[var(--foreground)] hover:opacity-100"
                >
                  FAQ
                </Link>

                <Link
                  href="/contact"
                  className="opacity-70 transition hover:text-[var(--foreground)] hover:opacity-100"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                Support
              </p>

              <div className="flex flex-col gap-3 text-sm">
                <Link
                  href="/shipping-returns"
                  className="opacity-70 transition hover:text-[var(--foreground)] hover:opacity-100"
                >
                  Shipping & Returns
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                Social
              </p>

              <div className="flex flex-col gap-3 text-sm">
                <a
                  href="https://www.instagram.com/frequency.framed.369?igsh=MWllZnY3enNudndzMw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
                  aria-label="Visit Frequency Framed on Instagram"
                >
                  <span aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </span>
                  <span>Instagram</span>
                </a>

                <a
                  href="https://www.facebook.com/share/1C9gBWo55L/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
                  aria-label="Visit Frequency Framed on Facebook"
                >
                  <span aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
                    </svg>
                  </span>
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] py-6 text-xs text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Frequency Framed. All rights reserved.</p>

          <a
            href="https://wa.me/353830483222?text=Hi%20Camilo%2C%20I%20would%20like%20to%20talk%20about%20a%20website."
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-[var(--foreground)]"
          >
            Developed by Lumon
          </a>
        </div>
      </Container>
    </footer>
  );
}