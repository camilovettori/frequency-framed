import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type OrderItem = {
  id: string;
  order_id: string;
  artwork_slug: string | null;
  title: string | null;
  price_cents: number | null;
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function getStatusEmailCopy(status: string) {
  switch (status) {
    case "processing":
      return {
        subject: "Your Frequency Framed order is now processing",
        message:
          "We have started preparing your order and will notify you again once it has been dispatched.",
      };

    case "dispatched":
      return {
        subject: "Your Frequency Framed order has been dispatched",
        message:
          "Your order is now on its way. If tracking details are available, you can find them below.",
      };

    case "delivered":
      return {
        subject: "Your Frequency Framed order has been delivered",
        message:
          "Your order has been marked as delivered. Thank you again for your purchase.",
      };

    case "cancelled":
      return {
        subject: "Your Frequency Framed order has been cancelled",
        message:
          "Your order has been marked as cancelled. If you have any questions, please contact us.",
      };

    default:
      return {
        subject: "Your Frequency Framed order has been updated",
        message:
          "There has been an update to your order status. Please see the details below.",
      };
  }
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://frequencyframed.ie"
  ).replace(/\/$/, "");
}

function renderStatusEmailHtml({
  customerName,
  message,
  orderNumber,
  total,
  status,
  trackingNumber,
  carrier,
  trackingUrl,
  reviewUrl,
}: {
  customerName: string;
  message: string;
  orderNumber: string;
  total: string;
  status: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  trackingUrl?: string | null;
  reviewUrl?: string | null;
}) {
  const showTracking = status === "dispatched";
  const showReview = status === "delivered" && Boolean(reviewUrl);
  const siteUrl = getSiteUrl();
  const logoUrl = `${siteUrl}/images/logo.png`;
  const signatureUrl = `${siteUrl}/images/natan-signature.png`;

  return `
  <div style="margin:0;padding:0;background:#f7f2ec;font-family:Arial,Helvetica,sans-serif;color:#3d2b22;">
    <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
      <div style="background:#ffffff;border:1px solid #eadfd3;padding:40px 32px;box-shadow:0 12px 30px rgba(0,0,0,0.04);">
        <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #efe5da;">
          <img
            src="${logoUrl}"
            alt="Frequency Framed"
            style="display:block;margin:0 auto 18px;max-width:220px;height:auto;"
          />
          <p style="margin:0;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#8b6f5d;">
            Frequency Framed
          </p>
          <h1 style="margin:18px 0 0;font-size:30px;line-height:1.05;font-weight:500;color:#4b3226;">
            Order Update
          </h1>
        </div>

        <div style="padding-top:28px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:#6c5445;">
            Hello ${customerName},
          </p>

          <p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:#6c5445;">
            ${message}
          </p>

          <div style="margin:28px 0;padding:22px;background:#fbf8f4;border:1px solid #efe5da;">
            <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8b6f5d;">
              Order Summary
            </p>
            <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4b3226;">
              <strong>Order number:</strong> ${orderNumber}
            </p>
            <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4b3226;">
              <strong>Total:</strong> ${total}
            </p>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#4b3226;text-transform:capitalize;">
              <strong>Status:</strong> ${status}
            </p>
          </div>

          ${
            showTracking
              ? `
            <div style="margin:28px 0;padding:22px;background:#fbf8f4;border:1px solid #efe5da;">
              <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8b6f5d;">
                Tracking Details
              </p>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4b3226;">
                <strong>Tracking number:</strong> ${trackingNumber || "N/A"}
              </p>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4b3226;">
                <strong>Carrier:</strong> ${carrier || "N/A"}
              </p>
              ${
                trackingUrl
                  ? `
                <div style="margin-top:16px;">
                  <a
                    href="${trackingUrl}"
                    style="display:inline-block;background:#4b3226;color:#ffffff;text-decoration:none;padding:14px 22px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;"
                  >
                    Track Order
                  </a>
                </div>
              `
                  : ""
              }
            </div>
          `
              : ""
          }

          ${
            showReview
              ? `
            <div style="margin:28px 0;padding:26px;background:#fbf8f4;border:1px solid #efe5da;">
              <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8b6f5d;">
                A Small Request
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#6c5445;">
                Thank you again for supporting independent art. We truly hope you love your new piece. If you have a moment, we would be grateful if you shared a few words about your experience.
              </p>
              <a
                href="${reviewUrl}"
                style="display:inline-block;background:#4b3226;color:#ffffff;text-decoration:none;padding:14px 24px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;"
              >
                Leave a Review
              </a>
            </div>
          `
              : ""
          }

          <p style="margin:28px 0 0;font-size:15px;line-height:1.8;color:#6c5445;">
            If you have any questions, simply reply to this email.
          </p>

          <div style="margin-top:34px;padding-top:24px;border-top:1px solid #efe5da;">
            <p style="margin:0 0 14px;font-size:15px;line-height:1.8;color:#6c5445;">
              Thank you again for welcoming this piece into your space. I truly hope it brings beauty, presence, and meaning into your home.
            </p>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#6c5445;">
              Warm regards,<br />Natan Ribeiro
            </p>
            <img
              src="${signatureUrl}"
              alt="Natan Ribeiro signature"
              style="display:block;max-width:180px;height:auto;opacity:0.9;"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const status = body.status as string;
    const tracking_number = body.tracking_number as string | null;
    const tracking_url = body.tracking_url as string | null;
    const carrier = body.carrier as string | null;

    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", id);

    if (itemsError) {
      console.error("ORDER ITEMS ERROR:", itemsError);
      return NextResponse.json(
        { error: "Failed to load order items." },
        { status: 500 }
      );
    }

    const previousStatus = order.status || "";
    const nextStatus = status || previousStatus;

    const shouldOpenShippingLabel =
      previousStatus !== "dispatched" && nextStatus === "dispatched";

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: nextStatus,
        tracking_number: tracking_number || null,
        tracking_url: tracking_url || null,
        carrier: carrier || null,
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updatedOrder) {
      console.error("ORDER UPDATE ERROR:", updateError);
      return NextResponse.json(
        { error: "Failed to update order." },
        { status: 500 }
      );
    }

    let reviewUrl: string | null = null;

    console.log("REVIEW DEBUG START", {
      previousStatus,
      nextStatus,
      updatedStatus: updatedOrder.status,
      shippingEmail: updatedOrder.shipping_email,
      itemsCount: items?.length ?? 0,
      items,
    });

    if (
      updatedOrder.status === "delivered" &&
      updatedOrder.shipping_email &&
      items &&
      items.length > 0
    ) {
      const firstItemWithSlug = (items as OrderItem[]).find(
        (item) => item.artwork_slug && item.artwork_slug.trim() !== ""
      );

      console.log("FIRST ITEM WITH SLUG", firstItemWithSlug);

      if (firstItemWithSlug?.artwork_slug) {
        const { data: existingRequest, error: existingRequestError } =
          await supabaseAdmin
            .from("artwork_review_requests")
            .select("*")
            .eq("order_id", updatedOrder.id)
            .eq("artwork_slug", firstItemWithSlug.artwork_slug)
            .eq("customer_email", updatedOrder.shipping_email)
            .maybeSingle();

        if (existingRequestError) {
          console.error("EXISTING REQUEST ERROR:", existingRequestError);
        }

        console.log("EXISTING REQUEST", {
          existingRequest,
          existingRequestError,
        });

        if (existingRequest?.token) {
          reviewUrl = `${getSiteUrl()}/review/${existingRequest.token}`;
          console.log("REUSING REVIEW URL", reviewUrl);
        } else {
          const token = randomUUID();

          const { data: insertedRequest, error: reviewInsertError } =
            await supabaseAdmin
              .from("artwork_review_requests")
              .insert({
                order_id: updatedOrder.id,
                artwork_slug: firstItemWithSlug.artwork_slug,
                customer_email: updatedOrder.shipping_email,
                token,
              })
              .select()
              .single();

          if (reviewInsertError) {
            console.error("REVIEW INSERT ERROR:", reviewInsertError);
          }

          console.log("REVIEW INSERT RESULT", {
            insertedRequest,
            reviewInsertError,
          });

          if (!reviewInsertError && insertedRequest?.token) {
            reviewUrl = `${getSiteUrl()}/review/${insertedRequest.token}`;
            console.log("CREATED REVIEW URL", reviewUrl);
          }
        }
      } else {
        console.log("NO ORDER ITEM WITH artwork_slug FOUND");
      }
    } else {
      console.log("REVIEW BLOCK SKIPPED", {
        updatedStatus: updatedOrder.status,
        shippingEmail: updatedOrder.shipping_email,
        itemsCount: items?.length ?? 0,
      });
    }

    console.log("FINAL reviewUrl", reviewUrl);

    if (updatedOrder.shipping_email) {
      const emailCopy = getStatusEmailCopy(updatedOrder.status);

      const trackingBlock =
        updatedOrder.status === "dispatched"
          ? `
Tracking number: ${updatedOrder.tracking_number || "N/A"}
Carrier: ${updatedOrder.carrier || "N/A"}
Tracking link: ${updatedOrder.tracking_url || "N/A"}
          `
          : "";

      const reviewBlock = reviewUrl
        ? `
We hope you love your new artwork.

If you have a moment, we would be truly grateful if you shared a few words about your piece:
${reviewUrl}
          `
        : "";

      await resend.emails.send({
        from: "Frequency Framed <hello@frequencyframed.ie>",
        to: updatedOrder.shipping_email,
        subject: emailCopy.subject,
        text: `
Hello ${updatedOrder.shipping_full_name || "there"},

${emailCopy.message}

Order number: ${updatedOrder.order_number || updatedOrder.id}
Total: ${formatMoney(
          updatedOrder.amount_total_cents,
          updatedOrder.currency
        )}

Status: ${updatedOrder.status}

${trackingBlock}

${reviewBlock}

If you have any questions, simply reply to this email.

Thank you again for welcoming this piece into your space. I truly hope it brings beauty, presence, and meaning into your home.

Warm regards,
Natan Ribeiro

Frequency Framed
        `,
        html: renderStatusEmailHtml({
          customerName: updatedOrder.shipping_full_name || "there",
          message: emailCopy.message,
          orderNumber: updatedOrder.order_number || updatedOrder.id,
          total: formatMoney(
            updatedOrder.amount_total_cents,
            updatedOrder.currency
          ),
          status: updatedOrder.status,
          trackingNumber: updatedOrder.tracking_number,
          carrier: updatedOrder.carrier,
          trackingUrl: updatedOrder.tracking_url,
          reviewUrl,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      should_open_shipping_label: shouldOpenShippingLabel,
    });
  } catch (error) {
    console.error("Admin order update error:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating the order." },
      { status: 500 }
    );
  }
}