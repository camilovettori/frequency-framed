import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/ui/container";
import AddToCartButton from "@/components/AddToCartButton";
import ArtworkGallery from "@/components/artwork/ArtworkGallery";
import { getPublishedArtworkBySlug } from "@/lib/public-artworks";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type ArtworkPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type RecentReview = {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  review_text: string;
  rating: number | null;
  created_at: string | null;
  artworks: {
    title: string;
    slug: string;
    is_published: boolean | null;
    image_url: string | null;
  } | null;
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

function formatReviewDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-IE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const artwork = await getPublishedArtworkBySlug(slug);

  if (!artwork) {
    notFound();
  }

  const { data: recentReviewsRaw } = await supabaseAdmin
    .from("artwork_reviews")
    .select(`
      id,
      reviewer_name,
      reviewer_role,
      review_text,
      rating,
      created_at,
      artworks:artwork_id (
        title,
        slug,
        is_published,
        image_url
      )
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const recentReviews: RecentReview[] = (recentReviewsRaw ?? []).map(
    (item: any) => ({
      id: item.id,
      reviewer_name: item.reviewer_name,
      reviewer_role: item.reviewer_role,
      review_text: item.review_text,
      rating: item.rating,
      created_at: item.created_at,
      artworks: item.artworks
        ? {
            title: item.artworks.title,
            slug: item.artworks.slug,
            is_published: item.artworks.is_published,
            image_url: item.artworks.image_url,
          }
        : null,
    })
  );

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

              {artwork.dimensions ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    Dimensions
                  </p>
                  <p className="mt-2 text-[var(--foreground)]">
                    {artwork.dimensions}
                  </p>
                </div>
              ) : null}

              {artwork.year ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    Year
                  </p>
                  <p className="mt-2 text-[var(--foreground)]">
                    {artwork.year}
                  </p>
                </div>
              ) : null}
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

      {recentReviews.length > 0 && (
        <section className="mt-20 border-t border-[var(--border)]/70 pt-12">
          <Container>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                  Collector Reflections
                </p>

                <h2 className="mt-4 text-3xl leading-[1.02] tracking-[-0.03em] text-[var(--foreground)] md:text-5xl">
                  What collectors are saying
                </h2>

                <p className="mt-5 text-[17px] leading-[1.8] text-[var(--muted)] md:text-[18px]">
                  Recent reflections from collectors who have welcomed
                  Frequency Framed artworks into their homes and spaces.
                </p>
              </div>

              <div className="lg:pt-3">
                <Link
                  href="/reviews"
                  className="text-xs uppercase tracking-[0.22em] text-[var(--muted)] transition hover:text-[var(--foreground)]"
                >
                  View all reviews
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {recentReviews.map((review) => {
                const reviewArtworkLink =
                  review.artworks?.is_published && review.artworks?.slug
                    ? `/artwork/${review.artworks.slug}`
                    : null;

                return (
                  <article
                    key={review.id}
                    className="flex h-full flex-col border border-[var(--border)] bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-start gap-5">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border border-[var(--border)] bg-[#f5f1eb]">
                        {review.artworks?.image_url ? (
                          <img
                            src={review.artworks.image_url}
                            alt={review.artworks.title || review.reviewer_name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        {review.artworks?.title ? (
                          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                            {review.artworks.title}
                          </p>
                        ) : null}

                        {review.rating ? (
                          <p className="mt-3 text-sm tracking-[0.14em] text-[var(--foreground)]">
                            {"★".repeat(review.rating)}
                          </p>
                        ) : null}

                        {formatReviewDate(review.created_at) ? (
                          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                            {formatReviewDate(review.created_at)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 flex-1">
                      <p className="text-[18px] leading-[1.8] text-[var(--foreground)] md:text-[20px]">
                        “{review.review_text}”
                      </p>
                    </div>

                    <div className="mt-8 border-t border-[var(--border)] pt-5">
                      <p className="text-lg text-[var(--foreground)]">
                        {review.reviewer_name}
                      </p>

                      {review.reviewer_role ? (
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                          {review.reviewer_role}
                        </p>
                      ) : null}

                      {reviewArtworkLink ? (
                        <div className="mt-5">
                          <Link
                            href={reviewArtworkLink}
                            className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:text-[var(--foreground)]"
                          >
                            View related artwork
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
