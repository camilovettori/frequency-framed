import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import AddToCartButton from "@/components/AddToCartButton";
import { artworks } from "@/data/artworks";

type ArtworkPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params;

  const artwork = artworks.find((item) => item.slug === slug);

  if (!artwork) {
    notFound();
  }

  const availabilityLabel =
    artwork.status === "Sold"
      ? "Unavailable"
      : artwork.status === "Reserved"
      ? "Reserved"
      : "Available";

  const isPurchasable = artwork.status === "Available";

  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <Container>
        <div className="mb-10">
          <Link
            href="/gallery"
            className="text-xs uppercase tracking-[0.22em] text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Back to Gallery
          </Link>
        </div>

        <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 md:gap-20 items-start">
          {/* IMAGE */}
          <div className="relative overflow-hidden rounded-sm bg-white shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            {artwork.status !== "Available" && (
              <div className="absolute left-5 top-5 z-10 bg-white/95 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--foreground)] shadow-sm">
                {artwork.status}
              </div>
            )}

            <div className="relative aspect-[4/5] bg-white">
              <Image
                src={artwork.image}
                alt={artwork.title}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain p-8"
                priority
              />
            </div>
          </div>

          {/* INFO */}
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              {artwork.category ?? "Original Artwork"}
            </p>

            <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
              {artwork.title}
            </h1>

            <div className="mt-8 flex items-center gap-4">
              <span className="text-2xl md:text-3xl font-medium text-[var(--foreground)]">
                {artwork.price}
              </span>

              <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                {availabilityLabel}
              </span>
            </div>

            <div className="mt-10 space-y-6 text-[18px] md:text-[20px] leading-[1.6] text-[var(--muted)]">
              <p>
                {artwork.description ??
                  "An original oil painting created to evoke symbolism, depth, and visual presence. Each piece by Frequency Framed is designed with intention, combining artistic expression with spiritual and personal meaning."}
              </p>

              <p>
                This artwork is part of the Frequency Framed collection and was
                created as a one-of-a-kind piece, intended to bring atmosphere,
                reflection, and identity into a space.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 border-t border-[var(--border)] pt-8 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Medium
                </p>
                <p className="mt-2 text-[var(--foreground)]">Oil on canvas</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Availability
                </p>
                <p className="mt-2 text-[var(--foreground)]">
                  {availabilityLabel}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Category
                </p>
                <p className="mt-2 text-[var(--foreground)]">
                  {artwork.category ?? "Original Artwork"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Framing
                </p>
                <p className="mt-2 text-[var(--foreground)]">
                  Available on request
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              {isPurchasable ? (
                <AddToCartButton artwork={artwork} />
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center px-7 py-4 bg-[var(--border)] text-[var(--muted)] text-sm uppercase tracking-[0.16em]"
                >
                  {artwork.status === "Sold" ? "Sold" : "Reserved"}
                </button>
              )}

              <a
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-4 border border-[var(--foreground)] text-sm uppercase tracking-[0.16em] text-[var(--foreground)] bg-transparent transition-all duration-300 hover:bg-[var(--foreground)] hover:text-white"
              >
                Enquire About This Piece
              </a>
            </div>

            <div className="mt-6">
              <a
                href="/commissions"
                className="text-xs uppercase tracking-[0.22em] text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                Looking for something personal? Commission a Piece
              </a>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}