import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/lib/artworks";

export default function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const availabilityLabel =
    artwork.status === "Sold"
      ? "Unavailable"
      : artwork.status === "Reserved"
      ? "Reserved"
      : "Available";

  return (
    <article className="group">
      <Link href={`/artwork/${artwork.slug}`} className="block">
        <div className="relative overflow-hidden rounded-sm bg-white shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]">
          <div className="relative aspect-[4/5] overflow-hidden bg-white">
            <Image
              src={artwork.image}
              alt={artwork.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />

            <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.04]" />

            <div className="absolute inset-x-0 bottom-0 flex justify-center pb-6 opacity-0 translate-y-3 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
              <div className="border border-white/70 bg-white/90 px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--foreground)] backdrop-blur-sm shadow-sm">
                View Artwork
              </div>
            </div>

            {artwork.status !== "Available" && (
              <div className="absolute left-4 top-4 bg-white/95 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--foreground)] shadow-sm">
                {artwork.status}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[28px] leading-none tracking-[-0.02em] text-[var(--foreground)]">
              {artwork.title}
            </h3>

            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              {availabilityLabel}
            </p>
          </div>

          <span className="pt-1 text-lg font-medium text-[var(--foreground)]">
            {artwork.price}
          </span>
        </div>
      </Link>
    </article>
  );
}