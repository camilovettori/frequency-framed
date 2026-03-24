import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

type CustomerRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
};

type ArtworkRow = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  status: "available" | "sold" | "reserved";
};

function unique(values: string[]) {
  return [...new Set(values)];
}

function formatMoneyFromCents(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatAddress(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function generateOrderNumber() {
  const { count, error } = await supabaseAdmin
    .from("orders")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  const next = (count ?? 0) + 1001;
  return `FF-${next}`;
}

function buildBuyerEmailHtml(params: {
  logoUrl: string;
  customerName: string;
  orderNumber: string;
  paymentReference: string;
  itemsHtml: string;
  total: string;
  shippingAddress: string;
}) {
  const {
    logoUrl,
    customerName,
    orderNumber,
    paymentReference,
    itemsHtml,
    total,
    shippingAddress,
  } = params;

  return `
  <div style="margin:0;padding:0;background:#f5f1eb;font-family:Georgia,serif;color:#4b3226;">
    <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
      <div style="background:#ffffff;border:1px solid #e8ddd2;padding:40px;">
        <div style="text-align:center;margin-bottom:32px;">
          <img src="${logoUrl}" alt="Frequency Framed" style="max-width:160px;height:auto;" />
        </div>

        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#8c6f5b;">
          Order Confirmed
        </p>

        <h1 style="margin:0 0 24px;font-size:38px;line-height:1.05;font-weight:400;color:#4b3226;">
          Thank you for your purchase
        </h1>

        <p style="margin:0 0 24px;font-size:18px;line-height:1.7;color:#6f5647;">
          Hello ${escapeHtml(customerName)},
          <br /><br />
          Your order has been confirmed successfully. Thank you for choosing a piece from Frequency Framed.
        </p>

        <div style="border:1px solid #e8ddd2;background:#faf7f2;padding:20px;margin:0 0 28px;">
          <p style="margin:0 0 8px;font-size:14px;color:#6f5647;"><strong>Order number:</strong> ${escapeHtml(orderNumber)}</p>
          <p style="margin:0;font-size:14px;color:#6f5647;"><strong>Payment reference:</strong> ${escapeHtml(paymentReference)}</p>
        </div>

        <h2 style="margin:0 0 14px;font-size:18px;font-weight:400;color:#4b3226;">Order summary</h2>
        <div style="border-top:1px solid #e8ddd2;border-bottom:1px solid #e8ddd2;padding:18px 0;margin-bottom:24px;">
          ${itemsHtml}
        </div>

        <div style="margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#8c6f5b;">
            Total
          </p>
          <p style="margin:0;font-size:28px;color:#4b3226;">${escapeHtml(total)}</p>
        </div>

        <div style="margin-bottom:28px;">
          <p style="margin:0 0 8px;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#8c6f5b;">
            Delivery Address
          </p>
          <p style="margin:0;font-size:16px;line-height:1.7;color:#6f5647;">
            ${escapeHtml(shippingAddress || "No delivery address provided")}
          </p>
        </div>

        <p style="margin:0;font-size:16px;line-height:1.7;color:#6f5647;">
          We will contact you if any further information is needed.
        </p>

        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e8ddd2;">
          <p style="margin:0;font-size:14px;color:#8c6f5b;">
            Frequency Framed
          </p>
        </div>
      </div>
    </div>
  </div>`;
}

function buildOwnerEmailHtml(params: {
  logoUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNumber: string;
  paymentReference: string;
  itemsHtml: string;
  total: string;
  shippingAddress: string;
}) {
  const {
    logoUrl,
    customerName,
    customerEmail,
    customerPhone,
    orderNumber,
    paymentReference,
    itemsHtml,
    total,
    shippingAddress,
  } = params;

  return `
  <div style="margin:0;padding:0;background:#f5f1eb;font-family:Georgia,serif;color:#4b3226;">
    <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
      <div style="background:#ffffff;border:1px solid #e8ddd2;padding:40px;">
        <div style="text-align:center;margin-bottom:32px;">
          <img src="${logoUrl}" alt="Frequency Framed" style="max-width:160px;height:auto;" />
        </div>

        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#8c6f5b;">
          New Order Received
        </p>

        <h1 style="margin:0 0 24px;font-size:38px;line-height:1.05;font-weight:400;color:#4b3226;">
          A new order has arrived
        </h1>

        <div style="border:1px solid #e8ddd2;background:#faf7f2;padding:20px;margin:0 0 28px;">
          <p style="margin:0 0 8px;font-size:14px;color:#6f5647;"><strong>Order number:</strong> ${escapeHtml(orderNumber)}</p>
          <p style="margin:0;font-size:14px;color:#6f5647;"><strong>Payment reference:</strong> ${escapeHtml(paymentReference)}</p>
        </div>

        <h2 style="margin:0 0 14px;font-size:18px;font-weight:400;color:#4b3226;">Customer</h2>
        <div style="margin-bottom:28px;">
          <p style="margin:0 0 6px;font-size:16px;line-height:1.7;color:#6f5647;">
            <strong>Name:</strong> ${escapeHtml(customerName || "N/A")}
          </p>
          <p style="margin:0 0 6px;font-size:16px;line-height:1.7;color:#6f5647;">
            <strong>Email:</strong> ${escapeHtml(customerEmail || "N/A")}
          </p>
          <p style="margin:0;font-size:16px;line-height:1.7;color:#6f5647;">
            <strong>Phone:</strong> ${escapeHtml(customerPhone || "N/A")}
          </p>
        </div>

        <h2 style="margin:0 0 14px;font-size:18px;font-weight:400;color:#4b3226;">Items</h2>
        <div style="border-top:1px solid #e8ddd2;border-bottom:1px solid #e8ddd2;padding:18px 0;margin-bottom:24px;">
          ${itemsHtml}
        </div>

        <div style="margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#8c6f5b;">
            Total
          </p>
          <p style="margin:0;font-size:28px;color:#4b3226;">${escapeHtml(total)}</p>
        </div>

        <div style="margin-bottom:28px;">
          <p style="margin:0 0 8px;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#8c6f5b;">
            Delivery Address
          </p>
          <p style="margin:0;font-size:16px;line-height:1.7;color:#6f5647;">
            ${escapeHtml(shippingAddress || "No delivery address provided")}
          </p>
        </div>
      </div>
    </div>
  </div>`;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const paymentIntentId = paymentIntent.id;
        const currency = paymentIntent.currency;
        const amountTotalCents = paymentIntent.amount;

        const customerEmail = paymentIntent.metadata.customer_email?.trim() || "";
        const customerFullName =
          paymentIntent.metadata.customer_full_name?.trim() || "";
        const customerPhone = paymentIntent.metadata.customer_phone?.trim() || "";

        const shippingAddressLine1 =
          paymentIntent.metadata.shipping_address_1?.trim() || "";
        const shippingAddressLine2 =
          paymentIntent.metadata.shipping_address_2?.trim() || "";
        const shippingCity = paymentIntent.metadata.shipping_city?.trim() || "";
        const shippingCounty =
          paymentIntent.metadata.shipping_county?.trim() || "";
        const shippingPostalCode =
          paymentIntent.metadata.shipping_postal_code?.trim() || "";
        const shippingCountry =
          paymentIntent.metadata.shipping_country?.trim() || "";

        const itemIdsRaw = paymentIntent.metadata.item_ids || "";
        const itemSlugs = unique(
          itemIdsRaw
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
        );

        if (!paymentIntentId) {
          console.error("Missing payment intent id on succeeded event.");
          break;
        }

        if (itemSlugs.length === 0) {
          console.error("No artwork slugs found in payment intent metadata.", {
            paymentIntentId,
            metadata: paymentIntent.metadata,
          });
          break;
        }

        const { data: existingOrder, error: existingOrderError } =
          await supabaseAdmin
            .from("orders")
            .select("id, stripe_payment_intent_id, order_number")
            .eq("stripe_payment_intent_id", paymentIntentId)
            .maybeSingle();

        if (existingOrderError) {
          console.error("Failed checking existing order:", existingOrderError);
          return NextResponse.json(
            { error: "Failed checking existing order." },
            { status: 500 }
          );
        }

        if (existingOrder) {
          console.log(
            "Webhook already processed for payment intent:",
            paymentIntentId
          );
          return NextResponse.json({ received: true, duplicate: true });
        }

        const { data: artworksData, error: artworksError } = await supabaseAdmin
          .from("artworks")
          .select("id, slug, title, price_cents, status")
          .in("slug", itemSlugs);

        if (artworksError) {
          console.error("Failed fetching artworks in webhook:", artworksError);
          return NextResponse.json(
            { error: "Failed fetching artworks." },
            { status: 500 }
          );
        }

        const artworks = (artworksData ?? []) as ArtworkRow[];

        if (artworks.length !== itemSlugs.length) {
          console.error("Webhook artwork mismatch.", {
            paymentIntentId,
            expected: itemSlugs,
            found: artworks.map((artwork) => artwork.slug),
          });

          return NextResponse.json(
            { error: "Some artworks were not found during webhook processing." },
            { status: 500 }
          );
        }

        const unavailable = artworks.filter(
          (artwork) => artwork.status !== "available"
        );

        if (unavailable.length > 0) {
          console.error("Webhook found unavailable artworks.", {
            paymentIntentId,
            unavailable: unavailable.map((artwork) => ({
              slug: artwork.slug,
              status: artwork.status,
            })),
          });

          return NextResponse.json(
            { error: "One or more artworks are no longer available." },
            { status: 409 }
          );
        }

        let customerId: string | null = null;

        if (customerEmail) {
          const { data: existingCustomer, error: existingCustomerError } =
            await supabaseAdmin
              .from("customers")
              .select("id, email, full_name, phone")
              .eq("email", customerEmail)
              .maybeSingle();

          if (existingCustomerError) {
            console.error(
              "Failed checking existing customer:",
              existingCustomerError
            );
            return NextResponse.json(
              { error: "Failed checking existing customer." },
              { status: 500 }
            );
          }

          if (existingCustomer) {
            customerId = (existingCustomer as CustomerRow).id;

            const updates: { full_name?: string; phone?: string } = {};

            if (customerFullName && !existingCustomer.full_name) {
              updates.full_name = customerFullName;
            }

            if (customerPhone && !existingCustomer.phone) {
              updates.phone = customerPhone;
            }

            if (Object.keys(updates).length > 0) {
              const { error: updateCustomerError } = await supabaseAdmin
                .from("customers")
                .update(updates)
                .eq("id", customerId);

              if (updateCustomerError) {
                console.error("Failed updating customer:", updateCustomerError);
                return NextResponse.json(
                  { error: "Failed updating customer." },
                  { status: 500 }
                );
              }
            }
          } else {
            const { data: newCustomer, error: insertCustomerError } =
              await supabaseAdmin
                .from("customers")
                .insert({
                  email: customerEmail,
                  full_name: customerFullName || null,
                  phone: customerPhone || null,
                })
                .select("id")
                .single();

            if (insertCustomerError || !newCustomer) {
              console.error("Failed creating customer:", insertCustomerError);
              return NextResponse.json(
                { error: "Failed creating customer." },
                { status: 500 }
              );
            }

            customerId = newCustomer.id;
          }
        }

        const orderNumber = await generateOrderNumber();

        const { data: createdOrder, error: createOrderError } = await supabaseAdmin
          .from("orders")
          .insert({
            order_number: orderNumber,
            stripe_payment_intent_id: paymentIntentId,
            customer_id: customerId,
            amount_total_cents: amountTotalCents,
            currency,
            shipping_full_name: customerFullName || null,
            shipping_email: customerEmail || null,
            shipping_phone: customerPhone || null,
            shipping_address_line1: shippingAddressLine1 || null,
            shipping_address_line2: shippingAddressLine2 || null,
            shipping_city: shippingCity || null,
            shipping_county: shippingCounty || null,
            shipping_postal_code: shippingPostalCode || null,
            shipping_country: shippingCountry || null,
          })
          .select("id, order_number")
          .single();

        if (createOrderError || !createdOrder) {
          console.error("Failed creating order:", createOrderError);
          return NextResponse.json(
            { error: "Failed creating order." },
            { status: 500 }
          );
        }

        const orderId = createdOrder.id;

        const orderItemsPayload = artworks.map((artwork) => ({
          order_id: orderId,
          artwork_slug: artwork.slug,
          title: artwork.title,
          price_cents: artwork.price_cents,
        }));

        const { error: orderItemsError } = await supabaseAdmin
          .from("order_items")
          .insert(orderItemsPayload);

        if (orderItemsError) {
          console.error("Failed creating order items:", orderItemsError);
          return NextResponse.json(
            { error: "Failed creating order items." },
            { status: 500 }
          );
        }

        const { error: updateArtworksError } = await supabaseAdmin
          .from("artworks")
          .update({ status: "sold" })
          .in("slug", itemSlugs);

        if (updateArtworksError) {
          console.error("Failed marking artworks as sold:", updateArtworksError);
          return NextResponse.json(
            { error: "Failed marking artworks as sold." },
            { status: 500 }
          );
        }

        const formattedTotal = formatMoneyFromCents(amountTotalCents, currency);
        const shippingAddress = formatAddress([
          shippingAddressLine1,
          shippingAddressLine2,
          shippingCity,
          shippingCounty,
          shippingPostalCode,
          shippingCountry,
        ]);

        const itemsText = artworks
          .map(
            (artwork) =>
              `- ${artwork.title} (${formatMoneyFromCents(
                artwork.price_cents,
                currency
              )})`
          )
          .join("\n");

        const itemsHtml = artworks
          .map(
            (artwork) => `
              <div style="display:flex;justify-content:space-between;gap:16px;padding:10px 0;">
                <div style="font-size:16px;line-height:1.6;color:#6f5647;">${escapeHtml(
                  artwork.title
                )}</div>
                <div style="font-size:16px;line-height:1.6;color:#4b3226;">${escapeHtml(
                  formatMoneyFromCents(artwork.price_cents, currency)
                )}</div>
              </div>
            `
          )
          .join("");

        const ownerEmail = process.env.CONTACT_TO_EMAIL;
        const logoUrl = "https://frequencyframed.ie/images/logo.png";

        if (customerEmail) {
          try {
            await resend.emails.send({
              from: "Frequency Framed <onboarding@resend.dev>",
              to: customerEmail,
              subject: `Your Frequency Framed order ${orderNumber} is confirmed`,
              text: `Hello ${customerFullName || "there"},

Thank you for your purchase from Frequency Framed.

Order number: ${orderNumber}
Order ID: ${orderId}
Payment reference: ${paymentIntentId}

Items:
${itemsText}

Total:
${formattedTotal}

Delivery address:
${shippingAddress || "No delivery address provided"}

We will contact you if any further information is needed.

Frequency Framed`,
              html: buildBuyerEmailHtml({
                logoUrl,
                customerName: customerFullName || "there",
                orderNumber,
                paymentReference: paymentIntentId,
                itemsHtml,
                total: formattedTotal,
                shippingAddress,
              }),
            });
          } catch (emailError) {
            console.error("Failed sending buyer email:", emailError);
          }
        }

        if (ownerEmail) {
          try {
            await resend.emails.send({
              from: "Frequency Framed <onboarding@resend.dev>",
              to: ownerEmail,
              replyTo: customerEmail || undefined,
              subject: `New order received - ${orderNumber}`,
              text: `A new order has been placed on Frequency Framed.

Order number: ${orderNumber}
Order ID: ${orderId}
Payment reference: ${paymentIntentId}

Customer:
Name: ${customerFullName || "N/A"}
Email: ${customerEmail || "N/A"}
Phone: ${customerPhone || "N/A"}

Items:
${itemsText}

Total:
${formattedTotal}

Delivery address:
${shippingAddress || "No delivery address provided"}`,
              html: buildOwnerEmailHtml({
                logoUrl,
                customerName: customerFullName || "N/A",
                customerEmail: customerEmail || "N/A",
                customerPhone: customerPhone || "N/A",
                orderNumber,
                paymentReference: paymentIntentId,
                itemsHtml,
                total: formattedTotal,
                shippingAddress,
              }),
            });
          } catch (emailError) {
            console.error("Failed sending owner email:", emailError);
          }
        }

        console.log("✅ Order saved successfully from webhook:", {
          paymentIntentId,
          orderId,
          orderNumber,
          customerEmail,
          artworks: itemSlugs,
        });

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log("❌ Payment failed:", {
          id: paymentIntent.id,
          lastPaymentError: paymentIntent.last_payment_error?.message,
        });

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);

    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    );
  }
}