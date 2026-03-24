import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { artworks as artworkMeta } from "@/data/artworks";

export type Artwork = {
  slug: string;
  title: string;
  image: string;
  price: string;
  status: "Available" | "Sold" | "Reserved";
  category: string;
  description: string;
};

type ArtworkRow = {
  slug: string;
  title: string;
  image_url: string | null;
  price_cents: number;
  status: "available" | "sold" | "reserved";
};

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(0)}`;
}

function mapStatus(status: ArtworkRow["status"]): Artwork["status"] {
  if (status === "sold") return "Sold";
  if (status === "reserved") return "Reserved";
  return "Available";
}

function mergeArtwork(row: ArtworkRow): Artwork {
  const meta = artworkMeta.find((item) => item.slug === row.slug);

  return {
    slug: row.slug,
    title: row.title,
    image: row.image_url || meta?.image || "/images/placeholder.jpg",
    price: formatPrice(row.price_cents),
    status: mapStatus(row.status),
    category: meta?.category || "Original Artwork",
    description:
      meta?.description ||
      "An original artwork from the Frequency Framed collection.",
  };
}

export async function getArtworks(): Promise<Artwork[]> {
  noStore();

  const { data, error } = await supabaseAdmin
    .from("artworks")
    .select("slug, title, image_url, price_cents, status")
    .order("title", { ascending: true });

  if (error) {
    console.error("Failed fetching artworks:", error);
    return [];
  }

  return ((data ?? []) as ArtworkRow[]).map(mergeArtwork);
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  noStore();

  const { data, error } = await supabaseAdmin
    .from("artworks")
    .select("slug, title, image_url, price_cents, status")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed fetching artwork by slug:", error);
    return null;
  }

  if (!data) return null;

  return mergeArtwork(data as ArtworkRow);
}