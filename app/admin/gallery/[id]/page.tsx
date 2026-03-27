"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase-browser";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type ArtworkImage = {
  id?: string;
  image_url: string;
  sort_order: number | null;
};

type ArtworkReview = {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  review_text: string;
  rating: number | null;
  is_published: boolean;
  created_at?: string | null;
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
  artwork_images?: ArtworkImage[];
  artwork_reviews?: ArtworkReview[];
};

type GalleryImageInput = {
  image_url: string;
  sort_order: number;
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
  const [secondaryDescription, setSecondaryDescription] = useState("");
  const [framing, setFraming] = useState("");
  const [isHomeHero, setIsHomeHero] = useState(false);
  const [homeHeroOrder, setHomeHeroOrder] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [existingGalleryImages, setExistingGalleryImages] = useState<
    GalleryImageInput[]
  >([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([]);

  const [reviews, setReviews] = useState<ArtworkReview[]>([]);
  const [reviewsBusyId, setReviewsBusyId] = useState<string>("");
  const [reviewsError, setReviewsError] = useState("");

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
      setIsHomeHero(Boolean(artwork.is_home_hero));
      setHomeHeroOrder(
        artwork.home_hero_order == null ? "" : String(artwork.home_hero_order)
      );

      const sortedExistingImages =
        artwork.artwork_images
          ?.slice()
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((item, index) => ({
            image_url: item.image_url,
            sort_order: item.sort_order ?? index,
          })) ?? [];

      setExistingGalleryImages(sortedExistingImages);

      const sortedReviews =
        artwork.artwork_reviews
          ?.slice()
          .sort((a, b) => {
            const aPublished = a.is_published ? 0 : 1;
            const bPublished = b.is_published ? 0 : 1;
            if (aPublished !== bPublished) return aPublished - bPublished;
            return (b.created_at || "").localeCompare(a.created_at || "");
          }) ?? [];

      setReviews(sortedReviews);
      setLoading(false);
    }

    fetchArtwork();
  }, [artworkId]);

  useEffect(() => {
    return () => {
      newImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviewUrls]);

  function handleAddMoreImages(files: FileList | null) {
    if (!files?.length) return;

    const incomingFiles = Array.from(files);
    const incomingPreviews = incomingFiles.map((file) => URL.createObjectURL(file));

    setNewImageFiles((prev) => [...prev, ...incomingFiles]);
    setNewImagePreviewUrls((prev) => [...prev, ...incomingPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadNewImages(): Promise<GalleryImageInput[]> {
    if (!newImageFiles.length) return [];

    const uploaded: GalleryImageInput[] = [];

    for (let index = 0; index < newImageFiles.length; index += 1) {
      const file = newImageFiles[index];
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
        sort_order: existingGalleryImages.length + index,
      });
    }

    return uploaded;
  }

  function removeExistingGalleryImage(indexToRemove: number) {
    setExistingGalleryImages((prev) =>
      prev
        .filter((_, index) => index !== indexToRemove)
        .map((item, index) => ({
          ...item,
          sort_order: index,
        }))
    );
  }

  function removeNewImage(indexToRemove: number) {
    const previewToRemove = newImagePreviewUrls[indexToRemove];
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove);
    }

    setNewImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setNewImagePreviewUrls((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const uploadedNewImages = await uploadNewImages();

      const combinedGalleryImages = [
        ...existingGalleryImages,
        ...uploadedNewImages,
      ].map((item, index) => ({
        image_url: item.image_url,
        sort_order: index,
      }));

      const coverImageUrl =
        combinedGalleryImages[0]?.image_url || imageUrl || null;

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
          image_url: coverImageUrl,
          gallery_images: combinedGalleryImages,
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

  async function toggleReviewPublish(review: ArtworkReview) {
    setReviewsBusyId(review.id);
    setReviewsError("");

    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_published: !review.is_published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update review.");
      }

      setReviews((prev) =>
        prev.map((item) =>
          item.id === review.id
            ? { ...item, is_published: data.review.is_published }
            : item
        )
      );
    } catch (err) {
      setReviewsError(
        err instanceof Error ? err.message : "Failed to update review."
      );
    } finally {
      setReviewsBusyId("");
    }
  }

  async function deleteReview(review: ArtworkReview) {
    const confirmed = window.confirm(
      `Delete review from ${review.reviewer_name}?`
    );

    if (!confirmed) return;

    setReviewsBusyId(review.id);
    setReviewsError("");

    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete review.");
      }

      setReviews((prev) => prev.filter((item) => item.id !== review.id));
    } catch (err) {
      setReviewsError(
        err instanceof Error ? err.message : "Failed to delete review."
      );
    } finally {
      setReviewsBusyId("");
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

            {existingGalleryImages.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                  Current Gallery
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {existingGalleryImages.map((image, index) => (
                    <div
                      key={`${image.image_url}-${index}`}
                      className="overflow-hidden border border-[#e7d9ca] bg-[#fbf8f4]"
                    >
                      <img
                        src={image.image_url}
                        alt={`Gallery ${index + 1}`}
                        className="h-28 w-full object-cover"
                      />
                      <div className="space-y-2 border-t border-[#e7d9ca] px-3 py-2">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8b6f5d]">
                          {index === 0 ? "Cover Image" : `Gallery ${index + 1}`}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingGalleryImage(index)}
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

            {newImagePreviewUrls.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                  New Images to Upload
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {newImagePreviewUrls.map((preview, index) => (
                    <div
                      key={`${preview}-${index}`}
                      className="overflow-hidden border border-[#e7d9ca] bg-[#fbf8f4]"
                    >
                      <img
                        src={preview}
                        alt={`New preview ${index + 1}`}
                        className="h-28 w-full object-cover"
                      />
                      <div className="space-y-2 border-t border-[#e7d9ca] px-3 py-2">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8b6f5d]">
                          New image {index + 1}
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

            {imageUrl ? (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                  Main Cover Preview
                </p>
                <img
                  src={imageUrl}
                  alt={title}
                  className="mt-3 max-h-72 border border-[#e7d9ca] object-cover"
                />
              </div>
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

      <section className="space-y-5 border border-[#e7d9ca] bg-white p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
            Collector Reflections
          </p>
          <h2 className="mt-3 text-3xl leading-none tracking-[-0.03em]">
            Reviews
          </h2>
          <p className="mt-3 text-sm text-[#6c5445]">
            Approve or remove customer reviews for this artwork.
          </p>
        </div>

        {reviewsError && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {reviewsError}
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="border border-dashed border-[#d8c6b5] bg-[#fbf8f4] px-5 py-6 text-sm text-[#8b6f5d]">
            No reviews yet for this artwork.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-[#eadfd3] bg-[#fbf8f4] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg text-[#4b3226]">
                      {review.reviewer_name}
                    </p>

                    {review.reviewer_role ? (
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#8b6f5d]">
                        {review.reviewer_role}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-2 text-[10px] uppercase tracking-[0.18em] ${
                        review.is_published
                          ? "bg-[#4b3226] text-white"
                          : "border border-[#d8c6b5] bg-white text-[#8b6f5d]"
                      }`}
                    >
                      {review.is_published ? "Published" : "Pending"}
                    </span>

                    {review.rating ? (
                      <span className="text-sm text-[#4b3226]">
                        {"★".repeat(review.rating)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="mt-4 text-[16px] leading-8 text-[#6c5445]">
                  “{review.review_text}”
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => toggleReviewPublish(review)}
                    disabled={reviewsBusyId === review.id}
                    className="inline-flex items-center justify-center bg-[#4b3226] px-5 py-3 text-xs uppercase tracking-[0.16em] text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {reviewsBusyId === review.id
                      ? "Updating..."
                      : review.is_published
                      ? "Unpublish"
                      : "Publish"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteReview(review)}
                    disabled={reviewsBusyId === review.id}
                    className="inline-flex items-center justify-center border border-red-700 bg-white px-5 py-3 text-xs uppercase tracking-[0.16em] text-red-700 transition hover:bg-red-700 hover:text-white disabled:opacity-60"
                  >
                    {reviewsBusyId === review.id ? "Working..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}