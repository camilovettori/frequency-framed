import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token = String(body.token || "").trim();
    const reviewer_name = String(body.reviewer_name || "").trim();
    const reviewer_role = String(body.reviewer_role || "").trim();
    const review_text = String(body.review_text || "").trim();
    const rating = Number(body.rating || 5);

    if (!token) {
      return NextResponse.json({ error: "Invalid review token." }, { status: 400 });
    }

    if (!reviewer_name) {
      return NextResponse.json({ error: "Your name is required." }, { status: 400 });
    }

    if (!review_text) {
      return NextResponse.json({ error: "Review text is required." }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating." }, { status: 400 });
    }

    const { data: reviewRequest, error: requestError } = await supabaseAdmin
      .from("artwork_review_requests")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (requestError || !reviewRequest) {
      return NextResponse.json(
        { error: "Review request not found." },
        { status: 404 }
      );
    }

    if (reviewRequest.used) {
      return NextResponse.json(
        { error: "This review link has already been used." },
        { status: 400 }
      );
    }

    const { data: artwork, error: artworkError } = await supabaseAdmin
      .from("artworks")
      .select("id, slug")
      .eq("slug", reviewRequest.artwork_slug)
      .maybeSingle();

    if (artworkError || !artwork) {
      return NextResponse.json({ error: "Artwork not found." }, { status: 404 });
    }

    const { error: insertError } = await supabaseAdmin
      .from("artwork_reviews")
      .insert({
        artwork_id: artwork.id,
        reviewer_name,
        reviewer_role: reviewer_role || null,
        review_text,
        sort_order: 0,
        is_published: false,
        rating,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || "Failed to save review." },
        { status: 500 }
      );
    }

    const { error: markUsedError } = await supabaseAdmin
      .from("artwork_review_requests")
      .update({ used: true })
      .eq("id", reviewRequest.id);

    if (markUsedError) {
      return NextResponse.json(
        { error: "Review saved, but token update failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Public review submit error:", error);
    return NextResponse.json(
      { error: "Something went wrong while submitting your review." },
      { status: 500 }
    );
  }
}