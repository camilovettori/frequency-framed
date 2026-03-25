"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientBrowser } from "@/lib/supabase-browser";

type Artwork = {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  status: string;
  category: string | null;
  is_published: boolean;
  image_url: string | null;
};

export default function AdminGalleryPage() {
  const supabase = useMemo(() => createClientBrowser(), []);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtworks() {
      const response = await fetch("/api/admin/artworks");
      const data = await response.json();

      if (response.ok) {
        setArtworks(data.artworks || []);
      }

      setLoading(false);
    }

    fetchArtworks();
  }, [supabase]);

  function formatMoney(cents: number) {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  }

  if (loading) {
    return <div className="text-[#4b3226]">Loading artworks...</div>;
  }

  return (
    <div className="space-y-8 text-[#4b3226]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
            Gallery Management
          </p>
          <h1 className="mt-4 text-5xl leading-none tracking-[-0.03em]">
            Artworks
          </h1>
          <p className="mt-4 text-lg text-[#6c5445]">
            Manage artworks, visibility, pricing, and artwork details.
          </p>
        </div>

        <Link
          href="/admin/gallery/new"
          className="inline-flex items-center justify-center bg-[#4b3226] px-6 py-4 text-sm uppercase tracking-[0.18em] text-white transition hover:opacity-90"
        >
          Add Artwork
        </Link>
      </div>

      <div className="overflow-hidden border border-[#e7d9ca] bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e7d9ca] bg-[#fbf8f4] text-left">
            <tr>
              <th className="p-4">Artwork</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Published</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {artworks.map((artwork) => (
              <tr
                key={artwork.id}
                className="border-b border-[#f0e7dc] hover:bg-[#f9f6f2]"
              >
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    {artwork.image_url ? (
                      <img
                        src={artwork.image_url}
                        alt={artwork.title}
                        className="h-16 w-16 object-cover border border-[#e7d9ca]"
                      />
                    ) : (
                      <div className="h-16 w-16 border border-[#e7d9ca] bg-[#f5f1eb]" />
                    )}

                    <div>
                      <p className="font-medium">{artwork.title}</p>
                      <p className="mt-1 text-xs text-[#8b6f5d]">{artwork.slug}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4">{artwork.category || "—"}</td>
                <td className="p-4">{formatMoney(artwork.price_cents)}</td>
                <td className="p-4 capitalize">{artwork.status}</td>
                <td className="p-4">{artwork.is_published ? "Yes" : "No"}</td>
                <td className="p-4">
                  <Link
                    href={`/admin/gallery/${artwork.id}`}
                    className="underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}

            {artworks.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#8b6f5d]">
                  No artworks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}