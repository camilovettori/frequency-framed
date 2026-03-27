import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type GalleryImageInput = {
  image_url: string;
  sort_order?: number | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("artworks")
      .select(`
        *,
        artwork_images (
          id,
          image_url,
          sort_order
        ),
        artwork_reviews (
          id,
          reviewer_name,
          reviewer_role,
          review_text,
          rating,
          sort_order,
          is_published,
          created_at
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Artwork not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ artwork: data });
  } catch (error) {
    console.error("Admin artwork GET by id error:", error);
    return NextResponse.json(
      { error: "Something went wrong while loading artwork." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
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
              item &&
              typeof item.image_url === "string" &&
              item.image_url.trim()
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
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to update artwork." },
        { status: 500 }
      );
    }

    const { error: deleteImagesError } = await supabaseAdmin
      .from("artwork_images")
      .delete()
      .eq("artwork_id", id);

    if (deleteImagesError) {
      return NextResponse.json(
        {
          error:
            deleteImagesError.message ||
            "Artwork updated but gallery cleanup failed.",
        },
        { status: 500 }
      );
    }

    if (galleryImages.length > 0) {
      const rows = galleryImages.map((item, index) => ({
        artwork_id: id,
        image_url: item.image_url,
        sort_order: item.sort_order ?? index,
      }));

      const { error: insertImagesError } = await supabaseAdmin
        .from("artwork_images")
        .insert(rows);

      if (insertImagesError) {
        return NextResponse.json(
          {
            error:
              insertImagesError.message ||
              "Artwork updated but gallery images failed.",
          },
          { status: 500 }
        );
      }
    }

    const { data: fullArtwork, error: fullArtworkError } = await supabaseAdmin
      .from("artworks")
      .select(`
        *,
        artwork_images (
          id,
          image_url,
          sort_order
        ),
        artwork_reviews (
          id,
          reviewer_name,
          reviewer_role,
          review_text,
          rating,
          sort_order,
          is_published,
          created_at
        )
      `)
      .eq("id", id)
      .single();

    if (fullArtworkError) {
      return NextResponse.json({ artwork: data });
    }

    return NextResponse.json({ artwork: fullArtwork ?? data });
  } catch (error) {
    console.error("Admin artwork PATCH by id error:", error);
    return NextResponse.json(
      { error: "Something went wrong while updating artwork." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("artworks")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete artwork." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin artwork DELETE by id error:", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting artwork." },
      { status: 500 }
    );
  }
}