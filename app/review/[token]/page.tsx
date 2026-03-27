import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ReviewForm from "./ReviewForm";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ReviewPage({ params }: PageProps) {
  const { token } = await params;

  const { data: requestData, error: requestError } = await supabaseAdmin
    .from("artwork_review_requests")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (requestError || !requestData) {
    notFound();
  }

  const { data: artwork, error: artworkError } = await supabaseAdmin
    .from("artworks")
    .select("id, title, slug, image_url")
    .eq("slug", requestData.artwork_slug)
    .maybeSingle();

  if (artworkError || !artwork) {
    notFound();
  }

  if (requestData.used) {
    return (
      <main className="pt-20 pb-24 md:pt-24 md:pb-32">
        <Container>
          <div className="mx-auto max-w-3xl border border-[var(--border)] bg-white px-8 py-12 text-center shadow-[0_12px_35px_rgba(0,0,0,0.04)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Frequency Framed
            </p>

            <h1 className="mt-6 text-4xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)] md:text-5xl">
              Review Already Submitted
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
              Thank you for taking the time to share your thoughts. Your review
              has already been received.
            </p>

            <div className="mt-10">
              <Link
                href={`/artwork/${artwork.slug}`}
                className="inline-flex items-center justify-center bg-[var(--foreground)] px-7 py-4 text-sm uppercase tracking-[0.16em] text-white transition-all duration-300 hover:opacity-90"
              >
                View Artwork
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-24 md:pt-24 md:pb-32">
      <Container>
        <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
          <div>
            <div className="overflow-hidden rounded-sm border border-[var(--border)] bg-white shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
              {artwork.image_url ? (
                <Image
                  src={artwork.image_url}
                  alt={artwork.title}
                  width={1000}
                  height={1200}
                  className="h-auto w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/5] bg-[#f5f1eb]" />
              )}
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Collector Reflection
            </p>

            <h1 className="mt-6 text-4xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)] md:text-6xl">
              Share Your Experience
            </h1>

            <p className="mt-8 text-lg leading-[1.8] text-[var(--muted)] md:text-[20px]">
              Thank you for supporting independent art. We hope your new piece
              has brought presence, meaning, and beauty into your space.
            </p>

            <div className="mt-8 border-t border-[var(--border)] pt-6">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                Artwork
              </p>
              <p className="mt-2 text-2xl leading-tight text-[var(--foreground)]">
                {artwork.title}
              </p>
            </div>

            <div className="mt-10">
              <ReviewForm token={token} artworkSlug={artwork.slug} />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}