import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

type CheckoutItem = {
  id: string;
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

type ReservedArtwork = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  image_url: string | null;
};

type ReservationRow = {
  reservation_id: string;
  reserved_until: string;
  amount_cents: number;
  currency: string;
  items: ReservedArtwork[] | string | null;
};

type ReservationResponseItem = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  image_url: string | null;
};

const RESERVATION_MINUTES = 15;

function unique(values: string[]) {
  return [...new Set(values)];
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseReservationItems(items: ReservationRow["items"]) {
  if (Array.isArray(items)) {
    return items as ReservedArtwork[];
  }

  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items) as unknown;

      if (Array.isArray(parsed)) {
        return parsed as ReservedArtwork[];
      }
    } catch {
      return [];
    }
  }

  return [];
}

async function releaseReservation(reservationId: string) {
  const { error } = await supabaseAdmin.rpc("release_artwork_reservation", {
    p_reservation_id: reservationId,
  });

  if (error) {
    console.error("Failed to release artwork reservation:", {
      reservationId,
      error,
    });
  }
}

export async function POST(request: Request) {
  let body: CheckoutPayload;

  try {
    body = (await request.json()) as CheckoutPayload;
  } catch (error) {
    console.error("Invalid JSON payload for checkout:", error);

    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const ids = unique(
      items
        .map((item) => normalizeString(item?.id))
        .filter((value): value is string => Boolean(value))
    );

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "No valid artwork IDs were provided." },
        { status: 400 }
      );
    }

    const customer = body.customer || ({} as CheckoutPayload["customer"]);

    const firstName = normalizeString(customer.firstName);
    const lastName = normalizeString(customer.lastName);
    const email = normalizeString(customer.email);
    const phone = normalizeString(customer.phone);
    const addressLine1 = normalizeString(customer.addressLine1);
    const addressLine2 = normalizeString(customer.addressLine2);
    const city = normalizeString(customer.city);
    const county = normalizeString(customer.county);
    const postalCode = normalizeString(customer.postalCode);
    const country = normalizeString(customer.country);

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Customer first and last name are required." },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid customer email is required." },
        { status: 400 }
      );
    }

    if (!addressLine1 || !city || !postalCode || !country) {
      return NextResponse.json(
        { error: "A complete delivery address is required." },
        { status: 400 }
      );
    }

    const customerFullName = `${firstName} ${lastName}`.trim();

    const { data: reservationData, error: reservationError } =
      await supabaseAdmin.rpc("reserve_artworks_for_checkout", {
        p_artwork_ids: ids,
        p_customer_email: email,
        p_customer_full_name: customerFullName,
        p_customer_first_name: firstName,
        p_customer_last_name: lastName,
        p_customer_phone: phone || null,
        p_shipping_address_line1: addressLine1,
        p_shipping_address_line2: addressLine2 || null,
        p_shipping_city: city,
        p_shipping_county: county || null,
        p_shipping_postal_code: postalCode,
        p_shipping_country: country,
        p_reservation_minutes: RESERVATION_MINUTES,
      });

    if (reservationError) {
      console.error("Artwork reservation failed:", reservationError);

      const reservationMessage = reservationError.message.toLowerCase();
      const isConflict =
        reservationMessage.includes("available") ||
        reservationMessage.includes("reserve") ||
        reservationMessage.includes("published") ||
        reservationMessage.includes("status") ||
        reservationError.code === "P0001";

      return NextResponse.json(
        {
          error: isConflict
            ? "One or more artworks are no longer available."
            : "Failed to reserve artworks.",
        },
        { status: isConflict ? 409 : 500 }
      );
    }

    const reservationRows = Array.isArray(reservationData)
      ? (reservationData as ReservationRow[])
      : reservationData
      ? [reservationData as ReservationRow]
      : [];

    const reservation = reservationRows[0];

    if (!reservation?.reservation_id || !reservation?.reserved_until) {
      console.error("Reservation RPC returned no reservation payload.", {
        reservationData,
      });

      return NextResponse.json(
        { error: "Failed to reserve artworks." },
        { status: 500 }
      );
    }

    const reservedItems = parseReservationItems(reservation.items);

    if (reservedItems.length === 0) {
      console.error("Reservation RPC returned no reserved items.", {
        reservationId: reservation.reservation_id,
        reservationData,
      });

      await releaseReservation(reservation.reservation_id);

      return NextResponse.json(
        { error: "Failed to reserve artworks." },
        { status: 500 }
      );
    }

    const amountCents =
      Number(reservation.amount_cents) ||
      reservedItems.reduce((acc, row) => acc + Number(row.price_cents || 0), 0);

    if (!amountCents || amountCents <= 0) {
      console.error("Reservation returned an invalid amount.", {
        reservationId: reservation.reservation_id,
        amountCents,
      });

      await releaseReservation(reservation.reservation_id);

      return NextResponse.json(
        { error: "Failed to reserve artworks." },
        { status: 500 }
      );
    }

    const currency = normalizeString(reservation.currency).toLowerCase() || "eur";

    let paymentIntentId: string | null = null;

    try {
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amountCents,
          currency,
          automatic_payment_methods: {
            enabled: true,
          },
          receipt_email: email,
          metadata: {
            reservation_id: reservation.reservation_id,
            reserved_until: reservation.reserved_until,
            customer_first_name: firstName,
            customer_last_name: lastName,
            customer_full_name: customerFullName,
            customer_email: email,
            customer_phone: phone,
            shipping_address_1: addressLine1,
            shipping_address_2: addressLine2,
            shipping_city: city,
            shipping_county: county,
            shipping_postal_code: postalCode,
            shipping_country: country,
            item_ids: reservedItems.map((row) => row.id).join(","),
            item_slugs: reservedItems.map((row) => row.slug).join(","),
            item_titles: reservedItems.map((row) => row.title).join(" | "),
            reservation_minutes: String(RESERVATION_MINUTES),
          },
        },
        {
          idempotencyKey: reservation.reservation_id,
        }
      );

      paymentIntentId = paymentIntent.id;

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        reservationId: reservation.reservation_id,
        reservedUntil: reservation.reserved_until,
        amountCents,
        currency,
        items: reservedItems.map((item): ReservationResponseItem => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          price_cents: item.price_cents,
          image_url: item.image_url,
        })),
      });
    } catch (stripeError) {
      console.error("Failed to create Stripe PaymentIntent:", {
        reservationId: reservation.reservation_id,
        reservationData,
        stripeError,
      });

      await releaseReservation(reservation.reservation_id);

      return NextResponse.json(
        { error: "Failed to create payment intent." },
        { status: 500 }
      );
    } finally {
      if (!paymentIntentId) {
        console.warn("PaymentIntent was not created for reservation.", {
          reservationId: reservation.reservation_id,
        });
      }
    }
  } catch (error) {
    console.error("create-payment-intent error:", error);

    return NextResponse.json(
      { error: "Failed to create payment intent." },
      { status: 500 }
    );
  }
}
