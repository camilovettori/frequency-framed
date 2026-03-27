import Link from "next/link";
import Image from "next/image";
import Container from "../ui/container";

export default function Header() {
  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <Container>
        <div className="flex flex-col items-center justify-between gap-6 py-10 md:flex-row md:py-12">
          <Link href="/" className="flex items-center justify-center md:justify-start">
            <Image
              src="/images/logo.png"
              alt="Frequency Framed logo"
              width={800}
              height={300}
              priority
              className="h-28 w-auto object-contain md:h-36 lg:h-44"
            />
          </Link>

          <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.2em] text-[var(--muted)] md:flex md:gap-10">
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

          <nav className="flex w-full items-center justify-center gap-4 overflow-x-auto whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] md:hidden">
            <Link
              href="/about"
              className="shrink-0 px-1 transition-colors duration-300 hover:text-[var(--foreground)]"
            >
              About
            </Link>

            <Link
              href="/gallery"
              className="shrink-0 px-1 transition-colors duration-300 hover:text-[var(--foreground)]"
            >
              Gallery
            </Link>

            <Link
              href="/commissions"
              className="shrink-0 px-1 transition-colors duration-300 hover:text-[var(--foreground)]"
            >
              Commissions
            </Link>

            <Link
              href="/contact"
              className="shrink-0 px-1 transition-colors duration-300 hover:text-[var(--foreground)]"
            >
              Contact
            </Link>

            <Link
              href="/cart"
              className="shrink-0 px-1 transition-colors duration-300 hover:text-[var(--foreground)]"
            >
              Cart
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}