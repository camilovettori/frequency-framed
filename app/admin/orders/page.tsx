"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

type Order = {
  id: string;
  order_number: string | null;
  amount_total_cents: number;
  currency: string;
  status: string;
  created_at: string;
  shipping_full_name: string | null;
};

export default function OrdersPage() {
  const supabase = createClientBrowser();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          amount_total_cents,
          currency,
          status,
          created_at,
          shipping_full_name
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
      }

      setLoading(false);
    }

    fetchOrders();
  }, [supabase]);

  function formatMoney(cents: number, currency: string) {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  }

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl mb-6">Orders</h1>

      <div className="border border-[#e7d9ca] bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e7d9ca] text-left">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-[#f0e7dc] hover:bg-[#f9f6f2]"
              >
                <td className="p-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="underline"
                  >
                    {order.order_number || order.id.slice(0, 6)}
                  </Link>
                </td>

                <td className="p-4">
                  {order.shipping_full_name || "—"}
                </td>

                <td className="p-4">
                  {formatMoney(order.amount_total_cents, order.currency)}
                </td>

                <td className="p-4 capitalize">{order.status}</td>

                <td className="p-4">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}