"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HomeHeroItem } from "@/lib/home-hero";

type Props = {
  items: HomeHeroItem[];
  onChange?: (index: number) => void;
};

export default function HomeHeroCarousel({ items, onChange }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    if (currentIndex > items.length - 1) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  useEffect(() => {
    if (!items.length) return;
    onChange?.(currentIndex);
  }, [currentIndex, items.length, onChange]);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (!items.length) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-white shadow-[0_18px_50px_rgba(0,0,0,0.08)]" />
    );
  }

  const current = items[currentIndex];

  function goPrev() {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }

  function goNext() {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }

  function goTo(index: number) {
    setCurrentIndex(index);
  }

  return (
    <div className="space-y-5">
      <div className="relative">
        <Link
          href={current.href}
          className="group block relative aspect-[4/5] overflow-hidden rounded-sm bg-white shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
        >
          {current.image_url ? (
            <img
              src={current.image_url}
              alt={current.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full bg-[#f5f1eb]" />
          )}

          <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/[0.04]" />

          {current.type === "post" && (
            <div className="absolute left-6 right-6 top-6">
              <div className="max-w-sm bg-white/92 px-5 py-4 backdrop-blur-sm shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#8b6f5d]">
                  {current.label}
                </p>

                <p className="mt-2 text-xl leading-tight text-[#4b3226]">
                  {current.title}
                </p>

                {current.excerpt ? (
                  <p className="mt-3 text-sm leading-relaxed text-[#6c5445]">
                    {current.excerpt}
                  </p>
                ) : null}
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/20 via-black/5 to-transparent p-6">
            {current.type === "artwork" ? (
              <div className="bg-white/92 px-4 py-3 backdrop-blur-sm shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#8b6f5d]">
                  {current.label}
                </p>
                <p className="mt-1 text-lg leading-tight text-[#4b3226]">
                  {current.title}
                </p>
              </div>
            ) : (
              <div />
            )}

            <div className="bg-[#4b3226] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white">
              {current.cta}
            </div>
          </div>
        </Link>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/30 backdrop-blur-md transition hover:bg-white/50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4b3226"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/30 backdrop-blur-md transition hover:bg-white/50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4b3226"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex items-center gap-2">
          {items.map((item, index) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === currentIndex ? "bg-[#4b3226]" : "bg-[#d8c6b5]"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}