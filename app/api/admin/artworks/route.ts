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

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("artworks")
      .select("*")
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

    const payload = {
      slug,
      title,
      price_cents: Number(body.price_cents || 0),
      image_url: body.image_url || null,
      status: body.status || "available",
      category: body.category || null,
      description: body.description || null,
      is_published: Boolean(body.is_published),
      medium: body.medium || null,
      dimensions: body.dimensions || null,
      year: body.year || null,
      featured: Boolean(body.featured),
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

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create artwork." },
        { status: 500 }
      );
    }

    return NextResponse.json({ artwork: data });
  } catch (error) {
    console.error("Admin artworks POST error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating artwork." },
      { status: 500 }
    );
  }
}