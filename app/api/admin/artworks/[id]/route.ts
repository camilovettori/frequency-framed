import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabaseAdmin
      .from("artworks")
      .select("*")
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const title = String(body.title || "").trim();
    const slug = String(body.slug || "").trim() || slugify(title);

    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ artwork: data });
  } catch (error) {
    console.error("Admin artwork PATCH error:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating artwork." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseAdmin
      .from("artworks")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete artwork." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin artwork DELETE error:", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting artwork." },
      { status: 500 }
    );
  }
}