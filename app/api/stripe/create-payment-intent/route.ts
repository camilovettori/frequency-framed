import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutPayload;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const amount = body.items.reduce((acc, item) => acc + item.price, 0);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: body.customer.email || undefined,
      metadata: {
        customer_first_name: body.customer.firstName || "",
        customer_last_name: body.customer.lastName || "",
        customer_email: body.customer.email || "",
        customer_phone: body.customer.phone || "",
        shipping_address_1: body.customer.addressLine1 || "",
        shipping_address_2: body.customer.addressLine2 || "",
        shipping_city: body.customer.city || "",
        shipping_county: body.customer.county || "",
        shipping_postal_code: body.customer.postalCode || "",
        shipping_country: body.customer.country || "",
        item_ids: body.items.map((item) => item.id).join(","),
        item_titles: body.items.map((item) => item.title).join(" | "),
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