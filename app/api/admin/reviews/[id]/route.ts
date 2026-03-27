import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("artwork_reviews")
      .update({
        is_published:
          body.is_published === undefined ? undefined : Boolean(body.is_published),
        sort_order:
          body.sort_order === "" || body.sort_order == null
            ? undefined
            : Number(body.sort_order),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to update review." },
        { status: 500 }
      );
    }

    return NextResponse.json({ review: data });
  } catch (error) {
    console.error("Admin review PATCH error:", error);
    return NextResponse.json(
      { error: "Something went wrong while updating the review." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("artwork_reviews")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete review." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin review DELETE error:", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting the review." },
      { status: 500 }
    );
  }
}