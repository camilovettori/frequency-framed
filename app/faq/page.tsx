import Container from "@/components/ui/container";

const faqs = [
  {
    question: "Are all artworks original?",
    answer:
      "Yes. Each piece presented on Frequency Framed is an original artwork created by Natan Ribeiro, unless otherwise stated.",
  },
  {
    question: "Can I commission a custom piece?",
    answer:
      "Yes. Commissioned artworks are available for clients looking for a personalised piece inspired by symbolism, numerology, colour, or a specific concept.",
  },
  {
    question: "Are sold pieces still available?",
    answer:
      "No. Once an artwork is marked as sold, it is no longer available. Similar commissioned works may be possible upon request, but every original piece remains unique.",
  },
  {
    question: "Do you offer framing?",
    answer:
      "Framing options may be available depending on the artwork and delivery requirements. Please enquire directly for details.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Shipping availability depends on the artwork, destination, and size of the piece. Please get in touch before purchase if you require international delivery.",
  },
  {
    question: "How long does a commission take?",
    answer:
      "Commission timelines vary depending on size, concept, and current availability. A more accurate estimate is provided after the initial enquiry.",
  },
  {
    question: "How do I enquire about an artwork?",
    answer:
      "You can use the contact page to ask about availability, pricing, commissions, framing, or shipping. We aim to respond within 1–2 business days.",
  },
  {
    question: "Can artwork colours vary slightly in real life?",
    answer:
      "Yes. Colours may appear slightly different depending on lighting, screen calibration, and framing presentation. Every effort is made to represent each artwork as accurately as possible.",
  },
];

export default function FaqPage() {
  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <Container>
        <section className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Information
          </p>

          <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
            Frequently
            <br />
            Asked Questions
          </h1>

          <p className="mt-8 max-w-3xl text-[20px] md:text-[22px] leading-[1.5] text-[var(--muted)]">
            A few helpful answers regarding original artworks, commissions,
            framing, shipping, and general enquiries.
          </p>
        </section>

        <section className="mt-16 grid gap-6">
          {faqs.map((item) => (
            <div
              key={item.question}
              className="border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10"
            >
              <h2 className="text-2xl md:text-3xl leading-tight text-[var(--foreground)]">
                {item.question}
              </h2>

              <p className="mt-4 max-w-4xl text-[18px] md:text-[20px] leading-[1.6] text-[var(--muted)]">
                {item.answer}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-16 border-t border-[var(--border)] pt-10">
          <p className="text-[18px] md:text-[20px] leading-[1.6] text-[var(--muted)]">
            Still have a question? Get in touch for artwork enquiries,
            commissions, or delivery details.
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