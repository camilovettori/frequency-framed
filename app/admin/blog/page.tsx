"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  is_published: boolean;
  is_home_hero: boolean;
  created_at: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/posts", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load posts.");
        }

        setPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts.");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-[#4b3226]">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-8 text-[#4b3226]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
            Blog Management
          </p>
          <h1 className="mt-4 text-5xl leading-none tracking-[-0.03em]">
            Journal Posts
          </h1>
        </div>

        <Link
          href="/admin/blog/new"
          className="inline-flex items-center justify-center bg-[#4b3226] px-6 py-4 text-sm uppercase tracking-[0.18em] text-white transition hover:opacity-90"
        >
          New Post
        </Link>
      </div>

      <div className="overflow-hidden border border-[#e7d9ca] bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e7d9ca] bg-[#fbf8f4] text-left">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Published</th>
              <th className="p-4">Homepage Hero</th>
              <th className="p-4">Created</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-[#f0e7dc] hover:bg-[#f9f6f2]"
              >
                <td className="p-4">{post.title}</td>
                <td className="p-4">{post.slug}</td>
                <td className="p-4">{post.is_published ? "Yes" : "No"}</td>
                <td className="p-4">{post.is_home_hero ? "Yes" : "No"}</td>
                <td className="p-4">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <Link href={`/admin/blog/${post.id}`} className="underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}

            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#8b6f5d]">
                  No posts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}