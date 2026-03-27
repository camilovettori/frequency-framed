import StatCard from "@/components/admin/StatCard";
import { supabaseAdmin } from "@/lib/supabase-admin";
export const dynamic = "force-dynamic";
export const revalidate = 0;
async function getDashboardStats() {
  const [
    ordersCount,
    paidOrdersCount,
    availableArtworksCount,
    soldArtworksCount,
    blogPostsCount,
  ] = await Promise.all([
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid"),
    supabaseAdmin
      .from("artworks")
      .select("*", { count: "exact", head: true })
      .eq("status", "available"),
    supabaseAdmin
      .from("artworks")
      .select("*", { count: "exact", head: true })
      .eq("status", "sold"),
    supabaseAdmin
      .from("blog_posts")
      .select("*", { count: "exact", head: true }),
  ]);

  return {
    totalOrders: ordersCount.count ?? 0,
    paidOrders: paidOrdersCount.count ?? 0,
    availableArtworks: availableArtworksCount.count ?? 0,
    soldArtworks: soldArtworksCount.count ?? 0,
    blogPosts: blogPostsCount.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
          Admin Dashboard
        </p>

        <h1 className="mt-4 text-5xl leading-none tracking-[-0.03em] text-[#4b3226]">
          Frequency Framed Control Panel
        </h1>

        <p className="mt-6 text-lg leading-8 text-[#6c5445]">
          Manage orders, artworks, blog content, and fulfilment from one place.
        </p>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Paid Orders" value={stats.paidOrders} />
        <StatCard label="Available Artworks" value={stats.availableArtworks} />
        <StatCard label="Sold Artworks" value={stats.soldArtworks} />
        <StatCard label="Blog Posts" value={stats.blogPosts} />
      </section>
    </div>
  );
}