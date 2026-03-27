import Image from "next/image";
import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import { getPublishedPostBySlug } from "@/lib/public-posts";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getOrdinal(day: number) {
  if (day >= 11 && day <= 13) return `${day}th`;

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function formatPublishedDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const weekday = new Intl.DateTimeFormat("en-IE", {
    weekday: "long",
  }).format(date);

  const month = new Intl.DateTimeFormat("en-IE", {
    month: "long",
  }).format(date);

  const year = new Intl.DateTimeFormat("en-IE", {
    year: "numeric",
  }).format(date);

  return `${weekday}, ${getOrdinal(date.getDate())} of ${month} ${year}`;
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = formatPublishedDate(post.created_at);
  const contentHtml = decodeHtmlEntities(post.content || "");

  return (
    <main className="pb-24 pt-20 md:pb-32 md:pt-24">
      <Container>
        <article className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            {post.cover_image_url && (
              <div className="order-1">
                <div className="overflow-hidden rounded-sm border border-[var(--border)] bg-white shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>
            )}

            <header className="order-2 lg:pt-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Journal
              </p>

              <h1 className="mt-5 text-4xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)] md:text-6xl">
                {post.title}
              </h1>

              {publishedDate && (
                <p className="mt-6 text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                  Published on {publishedDate}
                </p>
              )}

              {post.excerpt && (
                <p className="mt-8 max-w-xl text-lg leading-[1.75] text-[var(--muted)] md:text-[22px]">
                  {post.excerpt}
                </p>
              )}
            </header>
          </div>

          <div className="mt-12 border-t border-[var(--border)] pt-10 lg:mt-14 lg:pt-12">
            <div
              className="journal-content max-w-none"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>

          <div className="mt-20 border-t border-[var(--border)]/70 pt-12">
  {/* Signature Line */}
  <p className="text-[15px] leading-7 text-[var(--muted)]">
    Art is not just seen — it is felt.
  </p>

  {/* Author */}
  <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
    Written by
  </p>

  <p className="mt-2 text-lg leading-8 text-[var(--foreground)]">
    Natan Ribeiro
  </p>

  {/* Signature */}
  <div className="mt-6">
    <div className="relative h-28 w-[320px] md:h-36 md:w-[420px]">
      <Image
        src="/images/natan-signature.png"
        alt="Natan Ribeiro signature"
        fill
        className="object-contain object-left opacity-85 mix-blend-multiply"
      />
    </div>
  </div>

  {/* Links */}
  <div className="mt-8 flex flex-wrap gap-6 text-xs uppercase tracking-[0.22em]">
    <a
      href="/about"
      className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
    >
      About the artist
    </a>

    <a
      href="/gallery"
      className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
    >
      View collection
    </a>
  </div>
</div>
        </article>
      </Container>
    </main>
  );
}