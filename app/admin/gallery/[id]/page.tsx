"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase-browser";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type Artwork = {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  image_url: string | null;
  status: string;
  category: string | null;
  description: string | null;
  is_published: boolean;
  medium: string | null;
  dimensions: string | null;
  year: string | null;
  featured: boolean;
  display_order: number | null;
  secondary_description: string | null;
framing: string | null;
is_home_hero: boolean;
home_hero_order: number | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function GalleryDetailPage({ params }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClientBrowser(), []);

  const [artworkId, setArtworkId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("available");
  const [category, setCategory] = useState("Numerology");
  const [description, setDescription] = useState("");
  const [medium, setMedium] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [year, setYear] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [secondaryDescription, setSecondaryDescription] = useState("");
const [framing, setFraming] = useState("");
const [isHomeHero, setIsHomeHero] = useState(false);
const [homeHeroOrder, setHomeHeroOrder] = useState("");

  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setArtworkId(resolved.id);
    }

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!artworkId) return;

    async function fetchArtwork() {
      const response = await fetch(`/api/admin/artworks/${artworkId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load artwork.");
        setLoading(false);
        return;
      }

      const artwork: Artwork = data.artwork;

      setTitle(artwork.title || "");
      setSlug(artwork.slug || "");
      setPrice(String((artwork.price_cents || 0) / 100));
      setStatus(artwork.status || "available");
      setCategory(artwork.category || "Other");
      setDescription(artwork.description || "");
      setMedium(artwork.medium || "");
      setDimensions(artwork.dimensions || "");
      setSecondaryDescription(artwork.secondary_description || "");
      setFraming(artwork.framing || "");
      setYear(artwork.year || "");
      setDisplayOrder(
        artwork.display_order == null ? "" : String(artwork.display_order)
      );
      setIsPublished(Boolean(artwork.is_published));
      setFeatured(Boolean(artwork.featured));
      setImageUrl(artwork.image_url || "");
      setLoading(false);
      setIsHomeHero(Boolean(artwork.is_home_hero));
setHomeHeroOrder(
  artwork.home_hero_order == null ? "" : String(artwork.home_hero_order)
);
    }

    fetchArtwork();
  }, [artworkId]);

  async function uploadImage() {
    if (!imageFile) return imageUrl || null;

    const cleanName = imageFile.name.replace(/\s+/g, "-").toLowerCase();
    const filePath = `${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from("artworks")
      .upload(filePath, imageFile, {
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("artworks").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const finalImageUrl = await uploadImage();

      const response = await fetch(`/api/admin/artworks/${artworkId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  title,
  slug: slug || slugify(title),
  price_cents: Math.round(Number(price || 0) * 100),
  status,
  category,
  description,
  secondary_description: secondaryDescription,
  medium,
  dimensions,
  year,
  framing,
  display_order: displayOrder,
  is_published: isPublished,
  featured,
  is_home_hero: isHomeHero,
home_hero_order: homeHeroOrder,
  
  image_url: finalImageUrl,
}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update artwork.");
      }

      router.push("/admin/gallery");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update artwork.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this artwork?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/artworks/${artworkId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete artwork.");
      }

      router.push("/admin/gallery");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete artwork.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="text-[#4b3226]">Loading artwork...</div>;
  }

  return (
    <div className="space-y-8 text-[#4b3226]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
            Gallery Management
          </p>
          <h1 className="mt-4 text-5xl leading-none tracking-[-0.03em]">
            Edit Artwork
          </h1>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center justify-center border border-red-700 px-6 py-4 text-sm uppercase tracking-[0.18em] text-red-700 transition hover:bg-red-700 hover:text-white disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete Artwork"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border border-[#e7d9ca] bg-white p-6 space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slug) setSlug(slugify(e.target.value));
                }}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Slug
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Price (EUR)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
                >
                  <option>Numerology</option>
                  <option>Nature</option>
                  <option>Cosmic & Spiritual</option>
                  <option>Symbols</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              />
            </div>
          </div>
          <div>
  <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
    Secondary Description
  </label>
  <textarea
    value={secondaryDescription}
    onChange={(e) => setSecondaryDescription(e.target.value)}
    rows={5}
    className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
  />
</div>

          <div className="border border-[#e7d9ca] bg-white p-6 space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Medium
              </label>
              <input
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Dimensions
              </label>
              <input
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                  Year
                </label>
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
                />
              </div>
            </div>
            <div>
  <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
    Framing
  </label>
  <input
    value={framing}
    onChange={(e) => setFraming(e.target.value)}
    className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
  />
</div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Current Image URL
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Replace Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-3 block w-full"
              />
            </div>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Published on site
            </label>

                       <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
               
                Featured artwork
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={isHomeHero}
                  onChange={(e) => setIsHomeHero(e.target.checked)}
                />
                Homepage hero
              </label>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Hero Order
              </label>
              <input
                type="number"
                value={homeHeroOrder}
                onChange={(e) => setHomeHeroOrder(e.target.value)}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              />
            </div>

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="mt-3 max-h-72 border border-[#e7d9ca] object-cover"
              />
            ) : null}
          </div>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center bg-[#4b3226] px-6 py-4 text-sm uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}