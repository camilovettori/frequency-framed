import Image from "next/image";
import Link from "next/link";
import Container from "../ui/container";

export default function Hero() {
  return (
    <section className="pt-16 md:pt-20 pb-20 md:pb-28">
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* LEFT */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-6">
              Original Oil Paintings
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight font-semibold text-[var(--foreground)]">
              Frequency <br /> Framed
            </h1>

            <p className="mt-6 text-lg text-[var(--muted)] max-w-md leading-relaxed">
              Original oil paintings blending art and numerology,
              creating meaningful pieces that connect energy,
              symbolism, and visual expression.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                href="/gallery"
                className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] text-sm tracking-wide uppercase hover:opacity-90 transition"
              >
                Explore Gallery
              </Link>

              <Link
                href="/commissions"
                className="px-6 py-3 border border-[var(--border)] text-sm tracking-wide uppercase hover:bg-[var(--foreground)] hover:text-[var(--background)] transition"
              >
                Commission a Piece
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div className="overflow-hidden rounded-md">
              <Image
                src="/images/art-2.jpg"
                alt="Featured artwork"
                width={700}
                height={700}
                priority
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}