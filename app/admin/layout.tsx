import { redirect } from "next/navigation"
import { getAdminUser } from "@/lib/admin-auth"
import AdminShell from "@/components/admin/AdminShell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminUser = await getAdminUser()

  if (!adminUser) {
    redirect("/admin/login")
  }

 return (
  <AdminShell email={adminUser.user.email!}>
    {children}
  </AdminShell>
)
}