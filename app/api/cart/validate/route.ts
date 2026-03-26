import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
};

type ValidateCartPayload = {
  items: CartItem[];
};

type ArtworkRow = {
  id: string;
  status: "available" | "sold" | "reserved";
  is_published: boolean | null;
};

function unique(values: string[]) {
  return [...new Set(values)];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ValidateCartPayload;
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({
        validItems: [],
        removedItems: [],
      });
    }

    const ids = unique(
      items
        .map((item) => item.id?.trim())
        .filter((value): value is string => Boolean(value))
    );

    const { data, error } = await supabaseAdmin
      .from("artworks")
      .select("id, status, is_published")
      .in("id", ids);

    if (error) {
      console.error("Cart validation error:", error);

      return NextResponse.json(
        { error: "Failed to validate cart." },
        { status: 500 }
      );
    }

    const rows = (data ?? []) as ArtworkRow[];
    const artworkMap = new Map(rows.map((row) => [row.id, row]));

    const validItems: CartItem[] = [];
    const removedItems: CartItem[] = [];

    for (const item of items) {
      const artwork = artworkMap.get(item.id);

      if (
        artwork &&
        artwork.is_published === true &&
        artwork.status === "available"
      ) {
        validItems.push(item);
      } else {
        removedItems.push(item);
      }
    }

    return NextResponse.json({
      validItems,
      removedItems,
    });
  } catch (error) {
    console.error("validate cart route error:", error);

    return NextResponse.json(
      { error: "Failed to validate cart." },
      { status: 500 }
    );
  }
}