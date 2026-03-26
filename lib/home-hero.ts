import { getHomepageHeroArtworks } from "@/lib/public-artworks";
import { getHomepageHeroPosts } from "@/lib/public-posts";

export type HomeHeroItem =
  | {
      type: "artwork";
      id: string;
      slug: string;
      title: string;
      image_url: string | null;
      label: string;
      cta: string;
      href: string;
      order: number | null;
      excerpt: null;
    }
  | {
      type: "post";
      id: string;
      slug: string;
      title: string;
      image_url: string | null;
      label: string;
      cta: string;
      href: string;
      order: number | null;
      excerpt: string | null;
    };

export async function getHomeHeroItems(): Promise<HomeHeroItem[]> {
  const [artworks, posts] = await Promise.all([
    getHomepageHeroArtworks(),
    getHomepageHeroPosts(),
  ]);

  const artworkItems: HomeHeroItem[] = artworks.map((artwork) => ({
    type: "artwork",
    id: artwork.id,
    slug: artwork.slug,
    title: artwork.title,
    image_url: artwork.image_url,
    label: "Selected Work",
    cta: "View Artwork",
    href: `/artwork/${artwork.slug}`,
    order: artwork.home_hero_order,
    excerpt: null,
  }));

  const postItems: HomeHeroItem[] = posts.map((post) => ({
    type: "post",
    id: post.id,
    slug: post.slug,
    title: post.title,
    image_url: post.cover_image_url,
    label: "Journal Entry",
    cta: "Read Article",
    href: `/blog/${post.slug}`,
    order: post.home_hero_order,
    excerpt: post.excerpt,
  }));

  return [...artworkItems, ...postItems].sort((a, b) => {
    const orderA = a.order ?? 999999;
    const orderB = b.order ?? 999999;
    return orderA - orderB;
  });
}