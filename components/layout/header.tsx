import Link from "next/link";
import Image from "next/image";
import Container from "../ui/container";

export default function Header() {
  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between py-10 md:py-12 gap-6">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center justify-center md:justify-start">
            <Image
  src="/images/logo.png"
  alt="Frequency Framed logo"
  width={800}
  height={300}
  priority
  className="h-28 md:h-36 lg:h-44 w-auto object-contain"
/>
          </Link>

          {/* MENU */}
          <nav className="flex items-center gap-6 md:gap-10 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            <Link
              href="/about"
              className="transition-colors duration-300 hover:text-[var(--foreground)]"
            >
              About
            </Link>

            <Link
              href="/gallery"
              className="transition-colors duration-300 hover:text-[var(--foreground)]"
            >
              Gallery
            </Link>

            <Link
              href="/commissions"
              className="transition-colors duration-300 hover:text-[var(--foreground)]"
            >
              Commissions
            </Link>

            <Link
              href="/contact"
              className="transition-colors duration-300 hover:text-[var(--foreground)]"
            >
              Contact
            </Link>
            <Link
  href="/cart"
  className="transition-colors duration-300 hover:text-[var(--foreground)]"
>
  Cart
</Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}