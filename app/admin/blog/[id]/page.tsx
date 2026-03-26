"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase-browser";
import TiptapEditor from "@/components/admin/TiptapEditor";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type PostRecord = {
  id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  is_home_hero: boolean;
  home_hero_order: number | null;
};

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => createClientBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [isHomeHero, setIsHomeHero] = useState(false);
  const [homeHeroOrder, setHomeHeroOrder] = useState("");

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/admin/posts/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load post.");
        }

        const post = data.post as PostRecord;

        setTitle(post.title || "");
        setSlug(post.slug || "");
        setExcerpt(post.excerpt || "");
        setContent(post.content || "");
        setCoverImageUrl(post.cover_image_url || "");
        setIsPublished(Boolean(post.is_published));
        setIsHomeHero(Boolean(post.is_home_hero));
        setHomeHeroOrder(
          post.home_hero_order == null ? "" : String(post.home_hero_order)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post.");
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) {
      loadPost();
    }
  }, [params?.id]);

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

      const response = await fetch(`/api/admin/posts/${params.id}`, {
        method: "PATCH",
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
        throw new Error(data.error || "Failed to update post.");
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-[#4b3226]">Loading post...</div>;
  }
  

  return (
    <div className="space-y-8 text-[#4b3226]">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
          Blog Management
        </p>
        <h1 className="mt-4 text-5xl leading-none tracking-[-0.03em]">
          Edit Post
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
              <TiptapEditor value={content} onChange={setContent} />
            </div>
          </div>

          <div className="space-y-5 border border-[#e7d9ca] bg-white p-6">
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
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}