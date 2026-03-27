import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type GalleryImageInput = {
  image_url: string;
  sort_order?: number | null;
};

export async function GET() {
  try {
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
      .order("display_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to load artworks." },
        { status: 500 }
      );
    }

    return NextResponse.json({ artworks: data ?? [] });
  } catch (error) {
    console.error("Admin artworks GET error:", error);
    return NextResponse.json(
      { error: "Something went wrong while loading artworks." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const title = String(body.title || "").trim();
    const slug = String(body.slug || "").trim() || slugify(title);

    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required." },
        { status: 400 }
      );
    }

    const galleryImages: GalleryImageInput[] = Array.isArray(body.gallery_images)
  ? body.gallery_images
      .filter(
        (item: GalleryImageInput) =>
          item && typeof item.image_url === "string" && item.image_url.trim()
      )
      .map((item: GalleryImageInput, index: number) => ({
        image_url: item.image_url.trim(),
        sort_order: item.sort_order == null ? index : Number(item.sort_order),
      }))
  : [];

    const payload = {
      slug,
      title,
      price_cents: Number(body.price_cents || 0),
      image_url: body.image_url || null,
      status: body.status || "available",
      category: body.category || null,
      description: body.description || null,
      secondary_description: body.secondary_description || null,
      is_published: Boolean(body.is_published),
      medium: body.medium || null,
      dimensions: body.dimensions || null,
      year: body.year || null,
      framing: body.framing || null,
      featured: Boolean(body.featured),
      is_home_hero: Boolean(body.is_home_hero),
      home_hero_order:
        body.home_hero_order === "" || body.home_hero_order == null
          ? null
          : Number(body.home_hero_order),
      display_order:
        body.display_order === "" || body.display_order == null
          ? null
          : Number(body.display_order),
    };

    const { data, error } = await supabaseAdmin
      .from("artworks")
      .insert(payload)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to create artwork." },
        { status: 500 }
      );
    }

    if (galleryImages.length > 0) {
      const rows = galleryImages.map((item, index) => ({
        artwork_id: data.id,
        image_url: item.image_url,
        sort_order: item.sort_order ?? index,
      }));

      const { error: imagesError } = await supabaseAdmin
        .from("artwork_images")
        .insert(rows);

      if (imagesError) {
        return NextResponse.json(
          { error: imagesError.message || "Artwork created but gallery images failed." },
          { status: 500 }
        );
      }
    }

    const { data: fullArtwork } = await supabaseAdmin
      .from("artworks")
      .select(`
        *,
        artwork_images (
          id,
          image_url,
          sort_order
        )
      `)
      .eq("id", data.id)
      .single();

    return NextResponse.json({ artwork: fullArtwork ?? data });
  } catch (error) {
    console.error("Admin artworks POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating artwork." },
      { status: 500 }
    );
  }
}