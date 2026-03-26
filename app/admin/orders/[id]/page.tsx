"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClientBrowser } from "@/lib/supabase-browser";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type Order = {
  id: string;
  order_number: string | null;
  stripe_payment_intent_id: string | null;
  amount_total_cents: number;
  currency: string;
  status: string;
  created_at: string;
  shipping_full_name: string | null;
  shipping_email: string | null;
  shipping_phone: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_county: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  status_updated_at: string | null;
};

export default function OrderDetailPage({ params }: Props) {
  const supabase = useMemo(() => createClientBrowser(), []);

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [status, setStatus] = useState("paid");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [carrier, setCarrier] = useState("");

  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setOrderId(resolved.id);
    }

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!orderId) return;

    async function fetchOrder() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        setError("Failed to load order.");
        setLoading(false);
        return;
      }

      setOrder(data);
      setStatus(data.status || "paid");
      setTrackingNumber(data.tracking_number || "");
      setTrackingUrl(data.tracking_url || "");
      setCarrier(data.carrier || "");
      setLoading(false);
    }

    fetchOrder();
  }, [orderId, supabase]);

  function formatMoney(cents: number, currency: string) {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  }

    async function handleSave() {
    if (!order) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber || null,
          tracking_url: trackingUrl || null,
          carrier: carrier || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order.");
      }

      setOrder(data.order);
      setStatus(data.order.status || "paid");
      setTrackingNumber(data.order.tracking_number || "");
      setTrackingUrl(data.order.tracking_url || "");
      setCarrier(data.order.carrier || "");

      if (data.should_open_shipping_label) {
        setSuccess("Order updated and shipping label ready to print.");

        setTimeout(() => {
          window.print();
        }, 250);
      } else {
        setSuccess("Order updated successfully.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order.");
    } finally {
      setSaving(false);
    }
  }
  function handlePrintShippingLabel() {
    if (!order) return;
    window.print();
  }

  if (loading) {
    return <div className="text-[#4b3226]">Loading order...</div>;
  }

  if (error && !order) {
    return <div className="text-red-700">{error}</div>;
  }

  if (!order) {
    return <div className="text-[#4b3226]">Order not found.</div>;
  }

  const cityLine = [
    order.shipping_city?.trim(),
    order.shipping_county?.trim(),
    order.shipping_postal_code?.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <style jsx global>{`
  @page {
    size: A4 portrait;
    margin: 0;
  }

  .print-only {
    display: none;
  }

  @media print {
    html,
    body {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      background: white !important;
    }

    body * {
      visibility: hidden !important;
    }

    .print-only,
    .print-only * {
      visibility: visible !important;
    }

    .print-only {
      display: block !important;
      position: fixed;
      top: 0;
      left: 0;
      width: 105mm;
      height: 148.5mm;
      margin: 0;
      padding: 0;
      background: white;
      border: 0.4mm solid #d8c6b5;
      box-sizing: border-box;
      overflow: hidden;
      z-index: 999999;
    }

    .no-print {
      display: none !important;
    }
  }
`}</style>

      <div className="space-y-8 text-[#4b3226]">
        <div className="no-print">
          <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
            Order Detail
          </p>
          <h1 className="mt-4 text-5xl leading-none tracking-[-0.03em]">
            {order.order_number || order.id}
          </h1>
          <p className="mt-4 text-lg text-[#6c5445]">
            {formatMoney(order.amount_total_cents, order.currency)} ·{" "}
            <span className="capitalize">{order.status}</span>
          </p>
        </div>

        <div className="no-print grid gap-6 lg:grid-cols-2">
          <div className="border border-[#e7d9ca] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#8b6f5d]">
              Customer
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {order.shipping_full_name || "—"}
              </p>
              <p>
                <strong>Email:</strong> {order.shipping_email || "—"}
              </p>
              <p>
                <strong>Phone:</strong> {order.shipping_phone || "—"}
              </p>
            </div>
          </div>

          <div className="border border-[#e7d9ca] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#8b6f5d]">
              Shipping Address
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p>{order.shipping_address_line1 || "—"}</p>
              {order.shipping_address_line2 ? (
                <p>{order.shipping_address_line2}</p>
              ) : null}
              <p>
                {order.shipping_city || ""} {order.shipping_county || ""}
              </p>
              <p>{order.shipping_postal_code || ""}</p>
              <p>{order.shipping_country || ""}</p>
            </div>
          </div>
        </div>

        <div className="no-print border border-[#e7d9ca] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b6f5d]">
            Order Management
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              >
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Carrier
              </label>
              <input
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Tracking Number
              </label>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Tracking URL
              </label>
              <input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              />
            </div>
          </div>

          {error ? <div className="mt-5 text-sm text-red-700">{error}</div> : null}
          {success ? (
            <div className="mt-5 text-sm text-green-700">{success}</div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center bg-[#4b3226] px-6 py-4 text-sm uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handlePrintShippingLabel}
              className="inline-flex items-center justify-center border border-[#4b3226] bg-white px-6 py-4 text-sm uppercase tracking-[0.18em] text-[#4b3226] transition hover:bg-[#f8f4ef]"
            >
              Print Shipping Label
            </button>
          </div>
        </div>

        <div className="no-print border border-[#e7d9ca] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b6f5d]">
            Payment Reference
          </p>
          <p className="mt-4 break-all text-sm">
            {order.stripe_payment_intent_id || "—"}
          </p>
        </div>

        <div className="no-print border border-dashed border-[#d8c6b5] bg-[#f8f4ef] p-6">
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-[#8b6f5d]">
            Shipping Label Preview
          </p>

          <div className="overflow-auto">
            <div className="mx-auto h-[148.5mm] w-[105mm] border border-[#d8c6b5] bg-white shadow-sm">
              <ShippingLabelCard
                fullName={order.shipping_full_name}
                addressLine1={order.shipping_address_line1}
                addressLine2={order.shipping_address_line2}
                cityLine={cityLine}
                country={order.shipping_country}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="print-only">
        <ShippingLabelCard
          fullName={order.shipping_full_name}
          addressLine1={order.shipping_address_line1}
          addressLine2={order.shipping_address_line2}
          cityLine={cityLine}
          country={order.shipping_country}
        />
      </div>
    </>
  );
}

type ShippingLabelCardProps = {
  fullName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  cityLine: string;
  country: string | null;
};

function ShippingLabelCard({
  fullName,
  addressLine1,
  addressLine2,
  cityLine,
  country,
}: ShippingLabelCardProps) {
  return (
    <div className="flex h-full flex-col justify-between p-7 text-[#2f241d]">
      <div>
        <div className="mb-8 border-b border-[#eadfd3] pb-5 text-center">
          <div className="mx-auto flex justify-center">
            <Image
              src="/images/logo.png"
              alt="Frequency Framed"
              width={160}
              height={52}
              className="h-auto w-auto object-contain"
              priority
            />
          </div>

          <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-[#8b6f5d]">
            Shipping Label
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8b6f5d]">
            Deliver To
          </p>

          <div className="space-y-2 text-[15px] leading-6">
            <p className="font-semibold uppercase tracking-[0.04em]">
              {fullName || "—"}
            </p>

            {addressLine1 ? <p>{addressLine1}</p> : null}
            {addressLine2 ? <p>{addressLine2}</p> : null}
            {cityLine ? <p>{cityLine}</p> : null}
            {country ? (
              <p className="uppercase tracking-[0.04em]">{country}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-[#eadfd3] pt-5">
        <p className="text-center text-[12px] uppercase tracking-[0.18em] text-[#7e6353]">
          Thank you for supporting independent art
        </p>
      </div>
    </div>
  );
}