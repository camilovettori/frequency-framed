import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
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

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status,
        tracking_number: tracking_number || null,
        tracking_url: tracking_url || null,
        carrier: carrier || null,
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updatedOrder) {
      return NextResponse.json(
        { error: "Failed to update order." },
        { status: 500 }
      );
    }

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

If you have any questions, simply reply to this email.

Frequency Framed
        `,
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Admin order update error:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating the order." },
      { status: 500 }
    );
  }
}