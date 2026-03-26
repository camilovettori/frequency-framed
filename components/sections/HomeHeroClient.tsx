"use client";

import { useState } from "react";
import type { HomeHeroItem } from "@/lib/home-hero";
import HomeHeroCarousel from "./HomeHeroCarousel";

type Props = {
  items: HomeHeroItem[];
};

export default function HomeHeroClient({ items }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = items[currentIndex];

  return (
    <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="max-w-xl">
        {current?.type === "post" ? (
          <>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Journal
            </p>

            <h1 className="mt-6 text-4xl md:text-6xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
              {current.title}
            </h1>

            {current.excerpt && (
              <p className="mt-6 text-lg leading-[1.6] text-[var(--muted)]">
                {current.excerpt}
              </p>
            )}

            <div className="mt-10">
              <a
                href={current.href}
                className="inline-flex items-center justify-center px-7 py-4 bg-[var(--foreground)] text-white text-sm uppercase tracking-[0.16em]"
              >
                Read Article
              </a>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Original Oil Paintings
            </p>

            <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
              Frequency
              <br />
              Framed
            </h1>

            <p className="mt-8 text-[20px] leading-[1.6] text-[var(--muted)]">
              Original oil paintings blending art and numerology, creating
              meaningful pieces that connect energy, symbolism, and visual
              expression.
            </p>

            <div className="mt-10 flex gap-4">
              <a
                href="/gallery"
                className="px-7 py-4 bg-[var(--foreground)] text-white text-sm uppercase tracking-[0.16em]"
              >
                Explore Gallery
              </a>

              <a
                href="/commissions"
                className="px-7 py-4 border border-[var(--foreground)] text-sm uppercase tracking-[0.16em]"
              >
                Commission
              </a>
            </div>
          </>
        )}
      </div>

      <HomeHeroCarousel items={items} onChange={setCurrentIndex} />
    </div>
  );
}