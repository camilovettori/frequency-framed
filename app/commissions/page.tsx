import Container from "@/components/ui/container";

export default function CommissionsPage() {
  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <Container>
        {/* HERO */}
        <section className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Bespoke Artwork
          </p>

          <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
            Commission
            <br />
            a Piece
          </h1>

          <p className="mt-8 max-w-2xl text-[20px] md:text-[22px] leading-[1.5] text-[var(--muted)]">
            Request a one-of-a-kind original painting created exclusively for
            you. Each commissioned piece is designed with intention, symbolism,
            and artistic presence — crafted to reflect a personal meaning,
            energy, or story.
          </p>
        </section>

        {/* PROCESS */}
        <section className="mt-20 grid md:grid-cols-3 gap-10">
          <div className="border-t border-[var(--border)] pt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              01
            </p>
            <h2 className="mt-4 text-2xl md:text-3xl text-[var(--foreground)]">
              Share Your Vision
            </h2>
            <p className="mt-4 text-[18px] leading-[1.6] text-[var(--muted)]">
              Tell us about your idea, inspiration, preferred colours, size,
              symbolism, or any spiritual and personal elements you would like
              reflected in the work.
            </p>
          </div>

          <div className="border-t border-[var(--border)] pt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              02
            </p>
            <h2 className="mt-4 text-2xl md:text-3xl text-[var(--foreground)]">
              Creative Direction
            </h2>
            <p className="mt-4 text-[18px] leading-[1.6] text-[var(--muted)]">
              Natan develops the artistic concept, composition, and visual
              direction of the piece, ensuring it remains aligned with the
              essence of Frequency Framed.
            </p>
          </div>

          <div className="border-t border-[var(--border)] pt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              03
            </p>
            <h2 className="mt-4 text-2xl md:text-3xl text-[var(--foreground)]">
              Creation & Delivery
            </h2>
            <p className="mt-4 text-[18px] leading-[1.6] text-[var(--muted)]">
              Once approved, the artwork is carefully created and prepared for
              collection or delivery, resulting in a piece that exists only for
              you.
            </p>
          </div>
        </section>

        {/* DETAILS */}
        <section className="mt-20 grid lg:grid-cols-[1fr_0.9fr] gap-14 md:gap-20 items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Details
            </p>

            <h2 className="mt-6 text-4xl md:text-5xl leading-[1] tracking-[-0.03em] text-[var(--foreground)]">
              What can be requested
            </h2>

            <div className="mt-8 space-y-5 text-[18px] md:text-[20px] leading-[1.6] text-[var(--muted)]">
              <p>• Personal numerology-inspired paintings</p>
              <p>• Spiritual or symbolic compositions</p>
              <p>• Custom colour palettes to match an interior space</p>
              <p>• Meaningful gifts and unique personal pieces</p>
              <p>• Original artwork tailored to a desired size or format</p>
            </div>
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Enquiry
            </p>

            <h3 className="mt-4 text-3xl md:text-4xl leading-tight text-[var(--foreground)]">
              Start your commission
            </h3>

            <p className="mt-5 text-[18px] leading-[1.6] text-[var(--muted)]">
              To begin, send a short message with your idea, preferred size,
              timeline, and any meaningful references. We will respond with the
              next steps and availability.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-4 bg-[var(--foreground)] text-white text-sm uppercase tracking-[0.16em] transition-all duration-300 hover:opacity-90"
              >
                Contact Now
              </a>

              <a
                href="/gallery"
                className="inline-flex items-center justify-center px-7 py-4 border border-[var(--foreground)] text-sm uppercase tracking-[0.16em] text-[var(--foreground)] bg-transparent transition-all duration-300 hover:bg-[var(--foreground)] hover:text-white"
              >
                View Gallery
              </a>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}