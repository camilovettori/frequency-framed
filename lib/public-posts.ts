import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type PublicPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  is_home_hero: boolean;
  home_hero_order: number | null;
  created_at?: string;
};

export async function getPublishedPosts(): Promise<PublicPost[]> {
  noStore();

  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedPosts error:", error);
    return [];
  }

  return (data ?? []) as PublicPost[];
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<PublicPost | null> {
  noStore();

  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    console.error("getPublishedPostBySlug error:", error);
    return null;
  }

  return data as PublicPost;
}

export async function getHomepageHeroPosts(): Promise<PublicPost[]> {
  noStore();

  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .eq("is_home_hero", true)
    .order("home_hero_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getHomepageHeroPosts error:", error);
    return [];
  }

  return (data ?? []) as PublicPost[];
}