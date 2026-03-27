import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/gallery", label: "Gallery Management" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/blog", label: "Blog" },
];

export default function AdminSidebar() {
  return (
    <aside className="min-h-screen border-r border-[#e7d9ca] bg-white p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-[#8b6f5d]">
        Frequency Framed
      </p>

      <h2 className="mt-3 text-2xl tracking-[-0.03em] text-[#4b3226]">
        Admin
      </h2>

      <nav className="mt-10 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-3 text-sm text-[#4b3226] transition hover:bg-[#f5f1eb]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}