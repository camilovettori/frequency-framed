"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase-browser";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type UploadedGalleryImage = {
  image_url: string;
  sort_order: number;
};

export default function NewGalleryPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClientBrowser(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("available");
  const [category, setCategory] = useState("Numerology");
  const [description, setDescription] = useState("");
  const [secondaryDescription, setSecondaryDescription] = useState("");
  const [medium, setMedium] = useState("Oil on canvas");
  const [dimensions, setDimensions] = useState("");
  const [year, setYear] = useState("");
  const [framing, setFraming] = useState("Available on request");
  const [displayOrder, setDisplayOrder] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [isHomeHero, setIsHomeHero] = useState(false);
  const [homeHeroOrder, setHomeHeroOrder] = useState("");

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  function handleAddMoreImages(files: FileList | null) {
    if (!files?.length) return;

    const incomingFiles = Array.from(files);
    const incomingPreviews = incomingFiles.map((file) => URL.createObjectURL(file));

    setImageFiles((prev) => [...prev, ...incomingFiles]);
    setImagePreviewUrls((prev) => [...prev, ...incomingPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeNewImage(indexToRemove: number) {
    const previewToRemove = imagePreviewUrls[indexToRemove];
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove);
    }

    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviewUrls((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  }

  async function uploadImages(): Promise<UploadedGalleryImage[]> {
    if (!imageFiles.length) return [];

    const uploaded: UploadedGalleryImage[] = [];

    for (let index = 0; index < imageFiles.length; index += 1) {
      const file = imageFiles[index];
      const cleanName = file.name.replace(/\s+/g, "-").toLowerCase();
      const filePath = `${Date.now()}-${index}-${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(filePath, file, {
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from("artworks").getPublicUrl(filePath);

      uploaded.push({
        image_url: data.publicUrl,
        sort_order: index,
      });
    }

    return uploaded;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const uploadedImages = await uploadImages();
      const coverImageUrl = uploadedImages[0]?.image_url ?? null;

      const response = await fetch("/api/admin/artworks", {
        method: "POST",
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
          image_url: coverImageUrl,
          gallery_images: uploadedImages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create artwork.");
      }

      router.push("/admin/gallery");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create artwork.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 text-[#4b3226]">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
          Gallery Management
        </p>
        <h1 className="mt-4 text-5xl leading-none tracking-[-0.03em]">
          New Artwork
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5 border border-[#e7d9ca] bg-white p-6">
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
          </div>

          <div className="space-y-5 border border-[#e7d9ca] bg-white p-6">
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
                Gallery Images
              </label>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleAddMoreImages(e.target.files)}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center bg-[#4b3226] px-5 py-3 text-sm uppercase tracking-[0.16em] text-white transition hover:opacity-90"
                >
                  Add Images
                </button>

                <span className="text-xs uppercase tracking-[0.14em] text-[#8b6f5d]">
                  Add one by one or select multiple at once
                </span>
              </div>

              <p className="mt-3 text-xs text-[#8b6f5d]">
                The first image in the gallery becomes the main cover image used across the site.
              </p>
            </div>

            {imagePreviewUrls.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                  Selected Images
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {imagePreviewUrls.map((preview, index) => (
                    <div
                      key={`${preview}-${index}`}
                      className="overflow-hidden border border-[#e7d9ca] bg-[#fbf8f4]"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-28 w-full object-cover"
                      />
                      <div className="space-y-2 border-t border-[#e7d9ca] px-3 py-2">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8b6f5d]">
                          {index === 0 ? "Cover Image" : `Gallery ${index + 1}`}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="text-xs uppercase tracking-[0.16em] text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                Published on site
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
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
          {saving ? "Creating..." : "Create Artwork"}
        </button>
      </form>
    </div>
  );
}