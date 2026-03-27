import Image from "next/image";
import Container from "@/components/ui/container";

export default function AboutPage() {
  return (
    <main className="pt-20 pb-24 md:pt-24 md:pb-32">
      <Container>
        <section className="grid items-center gap-14 md:gap-20 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              The Artist
            </p>

            <h1 className="mt-6 text-5xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)] md:text-7xl">
              About
              <br />
              Natan Ribeiro
            </h1>

            <div className="mt-8 space-y-6 text-[20px] leading-[1.5] text-[var(--muted)] md:text-[22px]">
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

            <div className="mt-8 grid gap-4 border-t border-[var(--border)]/60 pt-8 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  Approach
                </p>
                <p className="mt-2 text-[15px] leading-7 text-[var(--foreground)]">
                  Symbolic, intuitive, deeply personal.
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  Medium
                </p>
                <p className="mt-2 text-[15px] leading-7 text-[var(--foreground)]">
                  Original hand-painted works on canvas.
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  Essence
                </p>
                <p className="mt-2 text-[15px] leading-7 text-[var(--foreground)]">
                  Art designed to hold energy and meaning.
                </p>
              </div>
            </div>

            <div className="mt-14 flex items-center">
              <div className="relative h-36 w-[420px] md:h-52 md:w-[600px]">
                <Image
                  src="/images/natan-signature.png"
                  alt="Natan Ribeiro signature"
                  fill
                  className="object-contain object-left opacity-90 mix-blend-multiply"
                />
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/gallery"
                className="inline-flex items-center justify-center bg-[var(--foreground)] px-7 py-4 text-sm uppercase tracking-[0.16em] text-white transition-all duration-300 hover:opacity-90"
              >
                View Collection
              </a>

              <a
                href="/commissions"
                className="inline-flex items-center justify-center border border-[var(--foreground)] bg-transparent px-7 py-4 text-sm uppercase tracking-[0.16em] text-[var(--foreground)] transition-all duration-300 hover:bg-[var(--foreground)] hover:text-white"
              >
                Commission a Piece
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[760px]">
              <div className="absolute -left-6 -top-6 hidden h-32 w-32 rounded-full border border-[var(--border)] bg-white/40 blur-2xl md:block" />
              <div className="absolute -bottom-8 -right-8 hidden h-40 w-40 rounded-full border border-[var(--border)] bg-white/40 blur-3xl md:block" />

              <div className="relative overflow-hidden rounded-md bg-[var(--surface)] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <Image
                  src="/images/natanFF.jpg"
                  alt="Natan Ribeiro"
                  width={1200}
                  height={1500}
                  priority
                  className="h-auto w-full object-cover"
                />
              </div>

              <div className="absolute bottom-5 left-5 max-w-[260px] border border-white/40 bg-white/75 px-5 py-4 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  Frequency Framed
                </p>
                <p className="mt-2 text-base leading-6 text-[var(--foreground)]">
                  Paintings rooted in symbolism, energy, and reflection.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}