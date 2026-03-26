import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("artworks")
      .select("*")
      .eq("is_published", true)
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
    console.error("Public artworks GET error:", error);

    return NextResponse.json(
      { error: "Something went wrong while loading artworks." },
      { status: 500 }
    );
  }
}