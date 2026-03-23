import Container from "../ui/container";
import ArtworkCard from "../ui/artwork-card";
import { artworks } from "@/data/artworks";

export default function FeaturedArtworks() {
  const featured = artworks.slice(0, 3);

  return (
    <section className="pb-24 md:pb-32">
      <Container>
        <div className="mb-12 md:mb-14">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Curated Selection
          </p>

          <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Featured Works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-14">
          {featured.map((artwork) => (
            <ArtworkCard key={artwork.slug} artwork={artwork} />
          ))}
        </div>
      </Container>
    </section>
  );
}