import Link from "next/link";
import { getPublishedPosts } from "@/lib/public-posts";
export const metadata = {
  title: "Art Journal | Numerology, Symbolism & Paintings",
  description:
    "Explore insights into numerology in art, symbolism, and the creative process behind original oil paintings.",
};
export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-4xl mb-12">Journal</h1>

      {posts.length === 0 && (
        <p className="text-sm text-gray-500">
          No posts yet.
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-10">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <div className="space-y-4 cursor-pointer group">
              {post.cover_image_url && (
                <img
                  src={post.cover_image_url}
                  className="w-full h-64 object-cover"
                />
              )}

              <h2 className="text-xl group-hover:underline">
                {post.title}
              </h2>

              <p className="text-sm text-gray-600">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}