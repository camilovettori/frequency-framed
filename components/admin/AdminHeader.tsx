"use client";

import { useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase-browser";

type AdminHeaderProps = {
  email: string;
};

export default function AdminHeader({ email }: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createClientBrowser();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-[#e7d9ca] bg-white px-8 py-5">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[#8b6f5d]">
          Logged in as
        </p>
        <p className="mt-1 text-sm text-[#4b3226]">{email}</p>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center justify-center border border-[#4b3226] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#4b3226] transition hover:bg-[#4b3226] hover:text-white"
      >
        Logout
      </button>
    </header>
  );
}