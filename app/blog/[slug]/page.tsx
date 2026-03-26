import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import { getPublishedPostBySlug } from "@/lib/public-posts";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <Container>
       <article className="mx-auto max-w-5xl">
  {/* Header */}
  <div className="max-w-3xl mx-auto text-center">
    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
      Journal
    </p>

    <h1 className="mt-6 text-4xl md:text-6xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
      {post.title}
    </h1>

    {post.excerpt && (
      <p className="mt-6 text-lg md:text-xl leading-[1.6] text-[var(--muted)]">
        {post.excerpt}
      </p>
    )}
  </div>

  {/* IMAGE FULL BLEED STYLE */}
  {post.cover_image_url && (
    <div className="mt-16 max-w-3xl mx-auto">
  <div className="overflow-hidden rounded-sm border border-[var(--border)] shadow-sm">
    <img
      src={post.cover_image_url}
      alt={post.title}
      className="w-full h-auto object-cover"
    />
  </div>
</div>
  )}

  {/* CONTENT */}
  <div className="mt-16 max-w-2xl mx-auto text-[17px] leading-[1.9] text-[var(--foreground)] space-y-6">
    {post.content?.split("\n").map((p, i) => (
      <p key={i}>{p}</p>
    ))}
  </div>
</article>
      </Container>
    </main>
  );
}