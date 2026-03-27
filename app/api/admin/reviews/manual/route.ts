import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const artwork_id = String(body.artwork_id || "").trim();
    const reviewer_name = String(body.reviewer_name || "").trim();
    const reviewer_role = String(body.reviewer_role || "").trim();
    const review_text = String(body.review_text || "").trim();
    const rating = Number(body.rating || 5);
    const is_published = Boolean(body.is_published);

    if (!artwork_id) {
      return NextResponse.json(
        { error: "Artwork is required." },
        { status: 400 }
      );
    }

    if (!reviewer_name) {
      return NextResponse.json(
        { error: "Reviewer name is required." },
        { status: 400 }
      );
    }

    if (!review_text) {
      return NextResponse.json(
        { error: "Review text is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("artwork_reviews")
      .insert({
        artwork_id,
        reviewer_name,
        reviewer_role: reviewer_role || null,
        review_text,
        rating,
        is_published,
        sort_order: 0,
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to create review." },
        { status: 500 }
      );
    }

    return NextResponse.json({ review: data });
  } catch (error) {
    console.error("Admin manual review POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating the review." },
      { status: 500 }
    );
  }
}