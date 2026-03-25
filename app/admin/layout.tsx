"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { createClientBrowser } from "@/lib/supabase-browser";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientBrowser();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/admin/login");
          return;
        }

        const { data: adminUser, error: adminError } = await supabase
          .from("admin_users")
          .select("id, email, full_name, role")
          .eq("id", user.id)
          .maybeSingle();

        if (adminError || !adminUser) {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }

        setEmail(adminUser.email || user.email || "");
      } catch {
        router.replace("/admin/login");
        return;
      } finally {
        setLoading(false);
      }
    }

    // não proteger a própria página de login
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    checkAdmin();
  }, [pathname, router, supabase]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center text-[#4b3226]">
        Loading admin panel...
      </div>
    );
  }

  return <AdminShell email={email}>{children}</AdminShell>;
}