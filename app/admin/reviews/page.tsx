"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClientBrowser } from "@/lib/supabase-browser";

type ArtworkOption = {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
};

type ReviewRecord = {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  review_text: string;
  rating: number | null;
  is_published: boolean;
  created_at: string | null;
  artwork_id: string;
  artworks: {
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
    is_published: boolean | null;
    status: string | null;
  } | null;
};

export default function AdminReviewsPage() {
  const supabase = useMemo(() => createClientBrowser(), []);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [artworks, setArtworks] = useState<ArtworkOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [artworkId, setArtworkId] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerRole, setReviewerRole] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isPublished, setIsPublished] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [reviewsResponse, artworksResponse] = await Promise.all([
          fetch("/api/admin/reviews"),
          fetch("/api/admin/artworks"),
        ]);

        const reviewsData = await reviewsResponse.json();
        const artworksData = await artworksResponse.json();

        if (!reviewsResponse.ok) {
          throw new Error(reviewsData.error || "Failed to load reviews.");
        }

        if (!artworksResponse.ok) {
          throw new Error(artworksData.error || "Failed to load artworks.");
        }

        setReviews(reviewsData.reviews || []);
        setArtworks(artworksData.artworks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function refreshReviews() {
    const response = await fetch("/api/admin/reviews");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to refresh reviews.");
    }

    setReviews(data.reviews || []);
  }

  async function togglePublish(review: ReviewRecord) {
    setBusyId(review.id);
    setError("");
    setSuccess("");

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

      setSuccess(
        data.review.is_published ? "Review published." : "Review unpublished."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review.");
    } finally {
      setBusyId("");
    }
  }

  async function deleteReview(review: ReviewRecord) {
    const confirmed = window.confirm(
      `Delete review from ${review.reviewer_name}?`
    );

    if (!confirmed) return;

    setBusyId(review.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete review.");
      }

      setReviews((prev) => prev.filter((item) => item.id !== review.id));
      setSuccess("Review deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review.");
    } finally {
      setBusyId("");
    }
  }

  async function createReview(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/reviews/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artwork_id: artworkId,
          reviewer_name: reviewerName,
          reviewer_role: reviewerRole,
          review_text: reviewText,
          rating,
          is_published: isPublished,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create review.");
      }

      setArtworkId("");
      setReviewerName("");
      setReviewerRole("");
      setReviewText("");
      setRating(5);
      setIsPublished(true);

      await refreshReviews();
      setSuccess("Review created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create review.");
    } finally {
      setCreating(false);
    }
  }

  function formatDate(value?: string | null) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  if (loading) {
    return <div className="text-[#4b3226]">Loading reviews...</div>;
  }

  return (
    <div className="space-y-8 text-[#4b3226]">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
          Review Management
        </p>
        <h1 className="mt-4 text-5xl leading-none tracking-[-0.03em]">
          Reviews
        </h1>
        <p className="mt-4 text-lg text-[#6c5445]">
          Publish, unpublish, delete, and manually create collector reviews.
        </p>
      </div>

      <section className="border border-[#e7d9ca] bg-white p-6">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b6f5d]">
            Create Review
          </p>
          <h2 className="mt-3 text-3xl leading-none tracking-[-0.03em]">
            Add a Review Manually
          </h2>
        </div>

        <form onSubmit={createReview} className="mt-8 grid gap-5 lg:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
              Artwork
            </label>
            <select
              value={artworkId}
              onChange={(e) => setArtworkId(e.target.value)}
              className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              required
            >
              <option value="">Select artwork</option>
              {artworks.map((artwork) => (
                <option key={artwork.id} value={artwork.id}>
                  {artwork.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
              Reviewer Name
            </label>
            <input
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
              City / Role
            </label>
            <input
              value={reviewerRole}
              onChange={(e) => setReviewerRole(e.target.value)}
              className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              placeholder="Collector, Dublin"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
              Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
              Review Text
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Publish immediately
            </label>
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center bg-[#4b3226] px-6 py-4 text-sm uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Review"}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <section className="border border-[#e7d9ca] bg-white p-6">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b6f5d]">
            Review Library
          </p>
          <h2 className="mt-3 text-3xl leading-none tracking-[-0.03em]">
            All Reviews
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="mt-8 border border-dashed border-[#d8c6b5] bg-[#fbf8f4] px-5 py-6 text-sm text-[#8b6f5d]">
            No reviews found.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-[#eadfd3] bg-[#fbf8f4] p-5"
              >
                <div className="flex flex-wrap items-start gap-5">
                  {review.artworks?.image_url ? (
                    <img
                      src={review.artworks.image_url}
                      alt={review.artworks.title}
                      className="h-24 w-24 border border-[#e7d9ca] object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 border border-[#e7d9ca] bg-white" />
                  )}

                  <div className="min-w-0 flex-1">
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

                        <p className="mt-2 text-sm text-[#6c5445]">
                          {review.artworks?.title || "Artwork unavailable"}
                        </p>

                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8b6f5d]">
                          {formatDate(review.created_at)}
                        </p>
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
                        onClick={() => togglePublish(review)}
                        disabled={busyId === review.id}
                        className="inline-flex items-center justify-center bg-[#4b3226] px-5 py-3 text-xs uppercase tracking-[0.16em] text-white transition hover:opacity-90 disabled:opacity-60"
                      >
                        {busyId === review.id
                          ? "Updating..."
                          : review.is_published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteReview(review)}
                        disabled={busyId === review.id}
                        className="inline-flex items-center justify-center border border-red-700 bg-white px-5 py-3 text-xs uppercase tracking-[0.16em] text-red-700 transition hover:bg-red-700 hover:text-white disabled:opacity-60"
                      >
                        {busyId === review.id ? "Working..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}