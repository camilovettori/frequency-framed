import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

type AdminShellProps = {
  email: string;
  children: ReactNode;
};

export default function AdminShell({
  email,
  children,
}: AdminShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-[280px_1fr] bg-[#f5f1eb]">
      <AdminSidebar />

      <div className="min-w-0">
        <AdminHeader email={email} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}