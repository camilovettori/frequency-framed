import Link from "next/link";
import Container from "../ui/container";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border)]">
      <Container>
        <div className="py-14 grid md:grid-cols-2 gap-10">
          {/* LEFT */}
          <div>
            <p className="text-lg text-[var(--foreground)]">
              Frequency Framed
            </p>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              Original oil paintings blending art, symbolism, and numerology —
              created to evoke meaning, energy, and visual presence.
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col md:items-end gap-4 text-sm">
            <Link
              href="/blog"
              className="opacity-70 hover:opacity-100 hover:text-[var(--foreground)] transition"
            >
              Journal
            </Link>

            <Link
              href="/faq"
              className="opacity-70 hover:opacity-100 hover:text-[var(--foreground)] transition"
            >
              FAQ
            </Link>

            <Link
              href="/shipping-returns"
              className="opacity-70 hover:opacity-100 hover:text-[var(--foreground)] transition"
            >
              Shipping & Returns
            </Link>

            <Link
              href="/contact"
              className="opacity-70 hover:opacity-100 hover:text-[var(--foreground)] transition"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="border-t border-[var(--border)] py-6 text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} Frequency Framed. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}