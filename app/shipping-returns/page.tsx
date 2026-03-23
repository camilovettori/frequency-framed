import Container from "@/components/ui/container";

export default function ShippingReturnsPage() {
  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <Container>
        <section className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Information
          </p>

          <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
            Shipping & Returns
          </h1>

          <p className="mt-8 max-w-3xl text-[20px] md:text-[22px] leading-[1.5] text-[var(--muted)]">
            Information regarding delivery, handling, and returns for original
            artworks and commissioned pieces.
          </p>
        </section>

        <section className="mt-16 space-y-12">
          {/* SHIPPING */}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl text-[var(--foreground)]">
              Shipping
            </h2>

            <div className="mt-6 space-y-5 text-[18px] md:text-[20px] leading-[1.6] text-[var(--muted)]">
              <p>
                All artworks are carefully packaged to ensure safe delivery.
                Packaging materials are selected to protect the piece during
                transit and preserve its condition.
              </p>

              <p>
                Shipping times and costs vary depending on the size of the
                artwork and the delivery location. Details will be confirmed
                before finalising any purchase or commission.
              </p>

              <p>
                International shipping may be available upon request. Please
                enquire before purchasing to confirm availability and estimated
                delivery times.
              </p>
            </div>
          </div>

          {/* HANDLING */}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl text-[var(--foreground)]">
              Handling & Care
            </h2>

            <div className="mt-6 space-y-5 text-[18px] md:text-[20px] leading-[1.6] text-[var(--muted)]">
              <p>
                Each piece is handled with care from creation to delivery.
                Artworks should be kept away from excessive humidity, direct
                sunlight, or extreme temperatures to preserve their quality.
              </p>

              <p>
                Framing options may be available depending on the artwork.
                Details can be discussed during the enquiry process.
              </p>
            </div>
          </div>

          {/* RETURNS */}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl text-[var(--foreground)]">
              Returns
            </h2>

            <div className="mt-6 space-y-5 text-[18px] md:text-[20px] leading-[1.6] text-[var(--muted)]">
              <p>
                Due to the unique and original nature of each artwork, all sales
                are considered final once completed.
              </p>

              <p>
                If an artwork arrives damaged, please contact us within 48 hours
                of delivery with photos of the packaging and the artwork. We
                will assess the situation and provide assistance where possible.
              </p>

              <p>
                Commissioned pieces are non-refundable once the creation process
                has begun, as they are produced specifically for the client.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-[var(--border)] pt-10">
          <p className="text-[18px] md:text-[20px] leading-[1.6] text-[var(--muted)]">
            If you have any questions regarding delivery, handling, or returns,
            feel free to get in touch.
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
        </section>
      </Container>
    </main>
  );
}