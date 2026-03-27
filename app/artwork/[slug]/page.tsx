import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/ui/container";
import AddToCartButton from "@/components/AddToCartButton";
import ArtworkGallery from "@/components/artwork/ArtworkGallery";
import { getPublishedArtworkBySlug } from "@/lib/public-artworks";

type ArtworkPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(
  { params }: ArtworkPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getPublishedArtworkBySlug(slug);

  if (!artwork) {
    return {
      title: "Artwork Not Found | Frequency Framed",
      description: "The requested artwork could not be found.",
    };
  }

  return {
    title: `${artwork.title} | Original Oil Painting | Frequency Framed`,
    description:
      artwork.description?.trim() ||
      "Original oil painting inspired by numerology and symbolism. One-of-a-kind artwork available for collectors.",
  };
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function getAvailabilityLabel(status: string) {
  switch (status) {
    case "sold":
      return "Unavailable";
    case "reserved":
      return "Reserved";
    default:
      return "Available";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "sold":
      return "Sold";
    case "reserved":
      return "Reserved";
    default:
      return null;
  }
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const artwork = await getPublishedArtworkBySlug(slug);

  if (!artwork) {
    notFound();
  }

  const availabilityLabel = getAvailabilityLabel(artwork.status);
  const statusBadge = getStatusBadge(artwork.status);
  const isPurchasable = artwork.status === "available";

  return (
    <main className="pt-20 pb-24 md:pt-24 md:pb-32">
      <Container>
        <div className="mb-10">
          <Link
            href="/gallery"
            className="text-xs uppercase tracking-[0.22em] text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Back to Gallery
          </Link>
        </div>

        <section className="grid items-start gap-14 md:gap-20 lg:grid-cols-[1.05fr_0.95fr]">
          <ArtworkGallery artwork={artwork} statusBadge={statusBadge} />

          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              {artwork.category ?? "Original Artwork"}
            </p>

            <h1 className="mt-6 text-5xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)] md:text-7xl">
              {artwork.title}
            </h1>

            <div className="mt-8 flex items-center gap-4">
              <span className="text-2xl font-medium text-[var(--foreground)] md:text-3xl">
                {formatMoney(artwork.price_cents)}
              </span>

              <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                {availabilityLabel}
              </span>
            </div>

            <div className="mt-10 space-y-6 text-[18px] leading-[1.6] text-[var(--muted)] md:text-[20px]">
              <p>
                {artwork.description ??
                  "An original oil painting created to evoke symbolism, depth, and visual presence. Each piece by Frequency Framed is designed with intention, combining artistic expression with spiritual and personal meaning."}
              </p>

              <p>
                {artwork.secondary_description ||
                  "This artwork is part of the Frequency Framed collection and was created as a one-of-a-kind piece, intended to bring atmosphere, reflection, and identity into a space."}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 border-t border-[var(--border)] pt-8 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Medium
                </p>
                <p className="mt-2 text-[var(--foreground)]">
                  {artwork.medium || "Oil on canvas"}
                </p>
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
                  {artwork.framing || "Available on request"}
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              {isPurchasable ? (
                <AddToCartButton
                  artwork={{
                    id: artwork.id,
                    title: artwork.title,
                    price: artwork.price_cents / 100,
                    image: artwork.image_url || "",
                  }}
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center bg-[var(--border)] px-7 py-4 text-sm uppercase tracking-[0.16em] text-[var(--muted)]"
                >
                  {artwork.status === "sold" ? "Sold" : "Reserved"}
                </button>
              )}

              <a
                href="/contact"
                className="inline-flex items-center justify-center border border-[var(--foreground)] bg-transparent px-7 py-4 text-sm uppercase tracking-[0.16em] text-[var(--foreground)] transition-all duration-300 hover:bg-[var(--foreground)] hover:text-white"
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