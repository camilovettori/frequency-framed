import Container from "@/components/ui/container";
import ArtworkCard from "@/components/ui/artwork-card";
import { getArtworks } from "@/lib/artworks";

const filters = ["All", "Numerology", "Nature", "Cosmic & Spiritual", "Symbols"];

export default async function GalleryPage() {
  const artworks = await getArtworks();

  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <Container>
        <section className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Collection
          </p>

          <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
            Gallery
          </h1>

          <p className="mt-8 max-w-3xl text-[20px] md:text-[22px] leading-[1.5] text-[var(--muted)]">
            Explore original oil paintings blending art, symbolism, and
            numerology. Each piece is created to evoke depth, reflection, and
            visual presence.
          </p>
        </section>

        <section className="mt-12 flex flex-wrap gap-3">
          {filters.map((item, index) => (
            <button
              key={item}
              className={`px-5 py-3 text-xs uppercase tracking-[0.18em] border transition-all duration-300 ${
                index === 0
                  ? "bg-[var(--foreground)] text-white border-[var(--foreground)]"
                  : "bg-transparent text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface)]"
              }`}
            >
              {item}
            </button>
          ))}
        </section>

        <section className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-14">
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork.slug} artwork={artwork} />
          ))}
        </section>
      </Container>
    </main>
  );
}