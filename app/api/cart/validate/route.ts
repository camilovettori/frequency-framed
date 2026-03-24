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
  slug: string;
  status: "available" | "sold" | "reserved";
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

    const slugs = unique(
      items
        .map((item) => item.id?.trim())
        .filter((value): value is string => Boolean(value))
    );

    const { data, error } = await supabaseAdmin
      .from("artworks")
      .select("slug, status")
      .in("slug", slugs);

    if (error) {
      console.error("Cart validation error:", error);

      return NextResponse.json(
        { error: "Failed to validate cart." },
        { status: 500 }
      );
    }

    const rows = (data ?? []) as ArtworkRow[];
    const statusMap = new Map(rows.map((row) => [row.slug, row.status]));

    const validItems: CartItem[] = [];
    const removedItems: CartItem[] = [];

    for (const item of items) {
      const status = statusMap.get(item.id);

      if (status === "available") {
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