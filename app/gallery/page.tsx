"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/container";
import ArtworkCard from "@/components/ui/artwork-card";
import { PublicArtwork } from "@/lib/public-artworks";

const filters = ["All", "Numerology", "Nature", "Cosmic & Spiritual", "Symbols"];

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<PublicArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    async function fetchArtworks() {
      try {
        const response = await fetch("/api/public/artworks", {
          cache: "no-store",
        });
        const data = await response.json();

        if (response.ok) {
          setArtworks(data.artworks || []);
        }
      } catch (error) {
        console.error("Failed to load gallery artworks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArtworks();
  }, []);

  const filteredArtworks = useMemo(() => {
    if (activeFilter === "All") return artworks;

    return artworks.filter(
      (artwork) => (artwork.category || "").trim() === activeFilter
    );
  }, [artworks, activeFilter]);

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
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveFilter(item)}
              className={`px-5 py-3 text-xs uppercase tracking-[0.18em] border transition-all duration-300 ${
                activeFilter === item
                  ? "bg-[var(--foreground)] text-white border-[var(--foreground)]"
                  : "bg-transparent text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface)]"
              }`}
            >
              {item}
            </button>
          ))}
        </section>

        {loading ? (
          <section className="mt-14 text-[var(--muted)]">
            Loading artworks...
          </section>
        ) : (
          <section className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-14">
            {filteredArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}

            {!filteredArtworks.length && (
              <div className="col-span-full border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--muted)]">
                No artworks found in this category.
              </div>
            )}
          </section>
        )}
      </Container>
    </main>
  );
}