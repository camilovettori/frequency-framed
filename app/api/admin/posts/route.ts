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
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to load posts." },
        { status: 500 }
      );
    }

    return NextResponse.json({ posts: data ?? [] });
  } catch (error) {
    console.error("Admin posts GET error:", error);

    return NextResponse.json(
      { error: "Something went wrong while loading posts." },
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

    const payload = {
      title,
      slug,
      excerpt: body.excerpt || null,
      content: body.content || null,
      cover_image_url: body.cover_image_url || null,
      is_published: Boolean(body.is_published),
      is_home_hero: Boolean(body.is_home_hero),
      home_hero_order:
        body.home_hero_order === "" || body.home_hero_order == null
          ? null
          : Number(body.home_hero_order),
    };

    const { data, error } = await supabaseAdmin
      .from("posts")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create post." },
        { status: 500 }
      );
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error("Admin posts POST error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating post." },
      { status: 500 }
    );
  }
}