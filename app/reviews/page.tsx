import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/container";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type ReviewRecord = {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  review_text: string;
  rating: number | null;
  created_at: string | null;
  artworks: {
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
    is_published: boolean | null;
    status: string | null;
  } | null;
};

function formatDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-IE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function ReviewsPage() {
  const { data, error } = await supabaseAdmin
    .from("artwork_reviews")
    .select(`
      id,
      reviewer_name,
      reviewer_role,
      review_text,
      rating,
      created_at,
      artworks:artwork_id (
        id,
        title,
        slug,
        image_url,
        is_published,
        status
      )
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const reviews: ReviewRecord[] = (data ?? []).map((item: any) => ({
    id: item.id,
    reviewer_name: item.reviewer_name,
    reviewer_role: item.reviewer_role,
    review_text: item.review_text,
    rating: item.rating,
    created_at: item.created_at,
    artworks: item.artworks
      ? {
          id: item.artworks.id,
          title: item.artworks.title,
          slug: item.artworks.slug,
          image_url: item.artworks.image_url,
          is_published: item.artworks.is_published,
          status: item.artworks.status,
        }
      : null,
  }));

  return (
    <main className="pt-20 pb-24 md:pt-24 md:pb-32">
      <Container>
        <section className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Collector Reflections
          </p>

          <h1 className="mt-6 text-5xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)] md:text-7xl">
            Reviews
          </h1>

          <p className="mt-8 max-w-2xl text-[20px] leading-[1.7] text-[var(--muted)] md:text-[22px]">
            Kind words from collectors who have welcomed Frequency Framed
            artworks into their homes and spaces.
          </p>
        </section>

        {error ? (
          <div className="mt-12 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            Failed to load reviews.
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-12 border border-[var(--border)] bg-white px-6 py-8 text-[var(--muted)] shadow-[0_12px_35px_rgba(0,0,0,0.04)]">
            No published reviews yet.
          </div>
        ) : (
          <section className="mt-14 grid gap-6 lg:grid-cols-2">
            {reviews.map((review) => {
              const artwork = review.artworks;
              const artworkLink =
                artwork?.is_published && artwork?.slug
                  ? `/artwork/${artwork.slug}`
                  : null;

              return (
                <article
                  key={review.id}
                  className="flex h-full flex-col border border-[var(--border)] bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start gap-5">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border border-[var(--border)] bg-[#f5f1eb]">
                      {artwork?.image_url ? (
                        <Image
                          src={artwork.image_url}
                          alt={artwork.title}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                        {artwork?.title || "Collected Artwork"}
                      </p>

                      {review.rating ? (
                        <p className="mt-3 text-sm tracking-[0.14em] text-[var(--foreground)]">
                          {"★".repeat(review.rating)}
                        </p>
                      ) : null}

                      {formatDate(review.created_at) ? (
                        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                          {formatDate(review.created_at)}
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

                    {artworkLink ? (
                      <div className="mt-5">
                        <Link
                          href={artworkLink}
                          className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:text-[var(--foreground)]"
                        >
                          View Artwork
                        </Link>
                      </div>
                    ) : artwork?.title ? (
                      <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        Original piece collected
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </Container>
    </main>
  );
}