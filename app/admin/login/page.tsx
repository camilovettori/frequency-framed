"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const supabase = createClientBrowser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkExistingSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (adminUser) {
        router.replace("/admin");
      }
    }

    checkExistingSession();
  }, [router, supabase]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Unable to load authenticated user.");
      setLoading(false);
      return;
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError || !adminUser) {
      await supabase.auth.signOut();
      setError("This user is not authorized to access the admin panel.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f5f1eb] px-6 py-12 text-[#4b3226] flex items-center justify-center">
      <div className="w-full max-w-md border border-[#e7d9ca] bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
          Frequency Framed
        </p>

        <h1 className="mt-4 text-4xl leading-none tracking-[-0.03em]">
          Admin Login
        </h1>

        <p className="mt-4 text-base leading-7 text-[#6c5445]">
          Sign in to manage orders, artworks, blog posts, and shipping labels.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#8b6f5d]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-3 w-full border border-[#d8c6b5] bg-white px-4 py-3 outline-none transition focus:border-[#4b3226]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#8b6f5d]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-3 w-full border border-[#d8c6b5] bg-white px-4 py-3 outline-none transition focus:border-[#4b3226]"
            />
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center bg-[#4b3226] px-6 py-4 text-sm uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}