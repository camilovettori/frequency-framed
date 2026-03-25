import Link from "next/link";
import { PublicArtwork } from "@/lib/public-artworks";

type ArtworkCardProps = {
  artwork: PublicArtwork;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function getAvailabilityLabel(status: string) {
  switch (status) {
    case "sold":
      return "Unavailable";
    case "reserved":
      return "Reserved";
    default:
      return "Available";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "sold":
      return "Sold";
    case "reserved":
      return "Reserved";
    default:
      return null;
  }
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const availabilityLabel = getAvailabilityLabel(artwork.status);
  const statusBadge = getStatusBadge(artwork.status);

  return (
    <article className="group">
      <Link href={`/artwork/${artwork.slug}`} className="block">
        <div className="relative overflow-hidden rounded-sm bg-white shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]">
          <div className="relative aspect-[4/5] overflow-hidden bg-white">
            {artwork.image_url ? (
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="h-full w-full bg-[#f5f1eb]" />
            )}

            <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.04]" />

            <div className="absolute inset-x-0 bottom-0 flex justify-center translate-y-3 pb-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <div className="border border-white/70 bg-white/90 px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--foreground)] backdrop-blur-sm shadow-sm">
                View Artwork
              </div>
            </div>

            {statusBadge && (
              <div className="absolute left-4 top-4 bg-white/95 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--foreground)] shadow-sm">
                {statusBadge}
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
            {formatMoney(artwork.price_cents)}
          </span>
        </div>
      </Link>
    </article>
  );
}