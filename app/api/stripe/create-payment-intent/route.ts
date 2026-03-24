import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

type CheckoutItem = {
  id: string; // hoje seu id é o slug
  title: string;
  price: number;
  image: string;
};

type CheckoutPayload = {
  items: CheckoutItem[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    county: string;
    postalCode: string;
    country: string;
  };
};

type ArtworkRow = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  image_url: string | null;
  status: "available" | "sold" | "reserved";
};

function unique(values: string[]) {
  return [...new Set(values)];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutPayload;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const slugs = unique(
      body.items
        .map((item) => item.id?.trim())
        .filter((value): value is string => Boolean(value))
    );

    if (slugs.length === 0) {
      return NextResponse.json(
        { error: "No valid artwork IDs were provided." },
        { status: 400 }
      );
    }

    const { data: artworks, error } = await supabaseAdmin
      .from("artworks")
      .select("id, slug, title, price_cents, image_url, status")
      .in("slug", slugs);

    if (error) {
      console.error("Supabase artworks fetch error:", error);
      return NextResponse.json(
        { error: "Failed to validate artworks." },
        { status: 500 }
      );
    }

    const rows = (artworks ?? []) as ArtworkRow[];

    if (rows.length !== slugs.length) {
      const foundSlugs = new Set(rows.map((row) => row.slug));
      const missingSlugs = slugs.filter((slug) => !foundSlugs.has(slug));

      return NextResponse.json(
        {
          error: `Some artworks were not found: ${missingSlugs.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const unavailable = rows.filter((row) => row.status !== "available");

    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          error: `This artwork is no longer available: ${unavailable
            .map((row) => row.title)
            .join(", ")}`,
        },
        { status: 400 }
      );
    }

    const amountCents = rows.reduce((acc, row) => acc + row.price_cents, 0);

    if (!amountCents || amountCents <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const customerFullName =
      `${body.customer.firstName || ""} ${body.customer.lastName || ""}`.trim();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "eur",
      payment_method_types: ["card"],
      receipt_email: body.customer.email || undefined,
      metadata: {
        customer_first_name: body.customer.firstName || "",
        customer_last_name: body.customer.lastName || "",
        customer_full_name: customerFullName,
        customer_email: body.customer.email || "",
        customer_phone: body.customer.phone || "",
        shipping_address_1: body.customer.addressLine1 || "",
        shipping_address_2: body.customer.addressLine2 || "",
        shipping_city: body.customer.city || "",
        shipping_county: body.customer.county || "",
        shipping_postal_code: body.customer.postalCode || "",
        shipping_country: body.customer.country || "",
        item_ids: rows.map((row) => row.slug).join(","),
        item_titles: rows.map((row) => row.title).join(" | "),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("create-payment-intent error:", error);

    return NextResponse.json(
      { error: "Failed to create payment intent." },
      { status: 500 }
    );
  }
}