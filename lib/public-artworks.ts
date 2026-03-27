import { supabaseAdmin } from "@/lib/supabase-admin";

export type PublicArtworkImage = {
  id: string;
  image_url: string;
  sort_order: number | null;
};

export type PublicArtwork = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  secondary_description: string | null;
  category: string | null;
  price_cents: number;
  image_url: string | null;
  status: string;
  is_published: boolean;
  medium: string | null;
  dimensions: string | null;
  year: string | null;
  framing: string | null;
  featured: boolean;
  is_home_hero: boolean;
  home_hero_order: number | null;
  display_order: number | null;
  artwork_images?: PublicArtworkImage[];
};

export async function getHomepageHeroArtworks(): Promise<PublicArtwork[]> {
  const { data, error } = await supabaseAdmin
    .from("artworks")
    .select("*")
    .eq("is_published", true)
    .eq("is_home_hero", true)
    .order("home_hero_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    console.error("getHomepageHeroArtworks error:", error);
    return [];
  }

  return (data ?? []) as PublicArtwork[];
}

export async function getPublishedArtworks(): Promise<PublicArtwork[]> {
  const { data, error } = await supabaseAdmin
    .from("artworks")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    console.error("getPublishedArtworks error:", error);
    return [];
  }

  return (data ?? []) as PublicArtwork[];
}

export async function getFeaturedPublishedArtworks(): Promise<PublicArtwork[]> {
  const { data, error } = await supabaseAdmin
    .from("artworks")
    .select("*")
    .eq("is_published", true)
    .eq("featured", true)
    .order("display_order", { ascending: true })
    .order("title", { ascending: true })
    .limit(3);

  if (error) {
    console.error("getFeaturedPublishedArtworks error:", error);
    return [];
  }

  return (data ?? []) as PublicArtwork[];
}

export async function getPublishedArtworkBySlug(
  slug: string
): Promise<PublicArtwork | null> {
  const { data, error } = await supabaseAdmin
    .from("artworks")
    .select(`
      *,
      artwork_images (
        id,
        image_url,
        sort_order
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PublicArtwork;
}