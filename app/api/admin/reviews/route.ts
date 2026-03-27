import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("artwork_reviews")
      .select(`
        *,
        artworks (
          id,
          title,
          slug,
          image_url,
          is_published,
          status
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load reviews." },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviews: data ?? [] });
  } catch (error) {
    console.error("Admin reviews GET error:", error);
    return NextResponse.json(
      { error: "Something went wrong while loading reviews." },
      { status: 500 }
    );
  }
}