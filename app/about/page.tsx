import Image from "next/image";
import Container from "@/components/ui/container";

export default function AboutPage() {
  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <Container>
        <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 md:gap-20 items-center">
          {/* LEFT */}
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              The Artist
            </p>

            <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
              About
              <br />
              Natan Ribeiro
            </h1>

            <div className="mt-8 space-y-6 text-[20px] md:text-[22px] leading-[1.5] text-[var(--muted)]">
              <p>
                I am Natan Ribeiro, the artist behind Frequency Framed. My work
                blends art and numerology, creating meaningful pieces that
                resonate with energy, symbolism, and personal reflection.
              </p>

              <p>
                Each original painting is created with intention, light, and a
                deep connection to the unseen. Through form, texture, and
                symbolism, I aim to transform spiritual ideas into visual
                experiences that feel both intimate and timeless.
              </p>

              <p>
                Frequency Framed is more than a collection of paintings. It is a
                space where art meets meaning — where every piece carries a
                presence, a story, and an invitation to connect more deeply.
              </p>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <span className="text-4xl md:text-5xl leading-none text-[var(--foreground)]">
                🖌
              </span>
              <span className="text-2xl md:text-3xl tracking-wide text-[var(--foreground)]">
                NR
              </span>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/gallery"
                className="inline-flex items-center justify-center px-7 py-4 bg-[var(--foreground)] text-white text-sm uppercase tracking-[0.16em] transition-all duration-300 hover:opacity-90"
              >
                View Collection
              </a>

              <a
                href="/commissions"
                className="inline-flex items-center justify-center px-7 py-4 border border-[var(--foreground)] text-sm uppercase tracking-[0.16em] text-[var(--foreground)] bg-transparent transition-all duration-300 hover:bg-[var(--foreground)] hover:text-white"
              >
                Commission a Piece
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[720px] overflow-hidden rounded-md bg-[var(--surface)] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <Image
                src="/images/natanFF.jpg"
                alt="Natan Ribeiro"
                width={1200}
                height={1500}
                priority
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}