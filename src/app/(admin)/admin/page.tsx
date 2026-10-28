import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canRole } from "@/lib/permissions";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (!role || !canRole(role as never, "read", "center")) redirect("/");
  
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">لوحة المشرف العام</h1>
      <p className="mt-2 text-muted-foreground">مرحلة 2 - قيد التنفيذ</p>
    </main>
  );
}
