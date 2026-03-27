"use client";

import { FormEvent, useState } from "react";

type Props = {
  token: string;
  artworkSlug: string;
};

export default function ReviewForm({ token, artworkSlug }: Props) {
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerRole, setReviewerRole] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          artwork_slug: artworkSlug,
          reviewer_name: reviewerName,
          reviewer_role: reviewerRole,
          review_text: reviewText,
          rating,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="border border-[var(--border)] bg-white px-6 py-8 shadow-[0_12px_35px_rgba(0,0,0,0.04)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
          Thank You
        </p>
        <p className="mt-4 text-lg leading-8 text-[var(--foreground)]">
          Your review has been received successfully and will be published after
          approval.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border border-[var(--border)] bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.04)]"
    >
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Your Name
        </label>
        <input
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          City / Role (Optional)
        </label>
        <input
          value={reviewerRole}
          onChange={(e) => setReviewerRole(e.target.value)}
          placeholder="Collector, Dublin"
          className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Rating
        </label>

        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`inline-flex h-11 w-11 items-center justify-center border text-sm transition ${
                rating >= value
                  ? "border-[#4b3226] bg-[#4b3226] text-white"
                  : "border-[#d8c6b5] bg-white text-[var(--foreground)]"
              }`}
              aria-label={`Set rating to ${value}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Your Review
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={7}
          className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
          required
        />
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center bg-[var(--foreground)] px-7 py-4 text-sm uppercase tracking-[0.16em] text-white transition-all duration-300 hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}