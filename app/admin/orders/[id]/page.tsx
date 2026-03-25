"use client";

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
      setSuccess("Order updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order.");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-8 text-[#4b3226]">
      <div>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-[#e7d9ca] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b6f5d]">
            Customer
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Name:</strong> {order.shipping_full_name || "—"}</p>
            <p><strong>Email:</strong> {order.shipping_email || "—"}</p>
            <p><strong>Phone:</strong> {order.shipping_phone || "—"}</p>
          </div>
        </div>

        <div className="border border-[#e7d9ca] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b6f5d]">
            Shipping Address
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <p>{order.shipping_address_line1 || "—"}</p>
            {order.shipping_address_line2 ? <p>{order.shipping_address_line2}</p> : null}
            <p>
              {order.shipping_city || ""} {order.shipping_county || ""}
            </p>
            <p>{order.shipping_postal_code || ""}</p>
            <p>{order.shipping_country || ""}</p>
          </div>
        </div>
      </div>

      <div className="border border-[#e7d9ca] bg-white p-6">
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
        {success ? <div className="mt-5 text-sm text-green-700">{success}</div> : null}

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center bg-[#4b3226] px-6 py-4 text-sm uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="border border-[#e7d9ca] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-[#8b6f5d]">
          Payment Reference
        </p>
        <p className="mt-4 text-sm break-all">
          {order.stripe_payment_intent_id || "—"}
        </p>
      </div>
    </div>
  );
}