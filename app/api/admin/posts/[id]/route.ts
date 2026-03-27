import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error("Admin post GET by id error:", error);
    return NextResponse.json(
      { error: "Something went wrong while loading the post." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const payload = {
      title: String(body.title || "").trim(),
      slug: String(body.slug || "").trim(),
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

    if (!payload.title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (!payload.slug) {
      return NextResponse.json(
        { error: "Slug is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("posts")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to update post." },
        { status: 500 }
      );
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error("Admin post PATCH error:", error);
    return NextResponse.json(
      { error: "Something went wrong while updating the post." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseAdmin
      .from("posts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete post." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin post DELETE error:", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting the post." },
      { status: 500 }
    );
  }
}