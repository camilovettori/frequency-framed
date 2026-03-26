"use client";

import { FormEvent, useMemo, useState } from "react";
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

export default function NewBlogPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClientBrowser(), []);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [isHomeHero, setIsHomeHero] = useState(false);
  const [homeHeroOrder, setHomeHeroOrder] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage() {
    if (!coverFile) return coverImageUrl || null;

    const cleanName = coverFile.name.replace(/\s+/g, "-").toLowerCase();
    const filePath = `posts/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from("artworks")
      .upload(filePath, coverFile, { upsert: false });

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
      const finalCoverImageUrl = await uploadImage();

      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug: slug || slugify(title),
          excerpt,
          content,
          cover_image_url: finalCoverImageUrl,
          is_published: isPublished,
          is_home_hero: isHomeHero,
          home_hero_order: homeHeroOrder,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post.");
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 text-[#4b3226]">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
          Blog Management
        </p>
        <h1 className="mt-4 text-5xl leading-none tracking-[-0.03em]">
          New Post
        </h1>
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
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={4}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="border border-[#e7d9ca] bg-white p-6 space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Cover Image URL
              </label>
              <input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="mt-3 w-full border border-[#d8c6b5] px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-[#8b6f5d]">
                Upload Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="mt-3 block w-full"
              />
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
          {saving ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}