"use client";

import { useMemo, useState } from "react";

type ArtworkImage = {
  id: string;
  image_url: string;
  sort_order: number | null;
};

type ArtworkGalleryProps = {
  artwork: {
    title: string;
    image_url: string | null;
    artwork_images?: ArtworkImage[] | null;
  };
  statusBadge?: string | null;
};

export default function ArtworkGallery({
  artwork,
  statusBadge,
}: ArtworkGalleryProps) {
  const images = useMemo(() => {
    const extra =
      artwork.artwork_images
        ?.slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((i) => i.image_url) ?? [];

    const merged = [artwork.image_url, ...extra].filter(
      (v): v is string => Boolean(v)
    );

    return Array.from(new Set(merged));
  }, [artwork]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({});

  const currentImage = images[currentIndex];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.2)",
    });
  }

  function handleMouseLeave() {
    setZoomStyle({
      transform: "scale(1)",
      transformOrigin: "center",
    });
  }

  function goPrev() {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }

  function goNext() {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }

  function goTo(index: number) {
    setCurrentIndex(index);
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-sm bg-white shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        {statusBadge && (
          <div className="absolute left-5 top-5 z-20 bg-white/95 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--foreground)] shadow-sm">
            {statusBadge}
          </div>
        )}

        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative aspect-[4/5] overflow-hidden bg-white cursor-zoom-in"
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt={artwork.title}
              style={zoomStyle}
              className="h-full w-full object-contain transition-transform duration-200 ease-out"
            />
          ) : (
            <div className="h-full w-full bg-[#f5f1eb]" />
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/70 backdrop-blur hover:bg-white"
              >
                ‹
              </button>

              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/70 backdrop-blur hover:bg-white"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`border ${
                i === currentIndex
                  ? "border-[#4b3226]"
                  : "border-[#e7d9ca]"
              }`}
            >
              <img
                src={img}
                className="h-20 w-20 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}