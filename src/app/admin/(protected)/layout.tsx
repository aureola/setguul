import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  // The session JWT's `name` is fixed at login time, so re-read the live
  // name from the DB here — otherwise a self-service profile name change
  // wouldn't show up in the sidebar until the next login.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  return (
    <AdminThemeProvider>
      <AdminSidebar role={session.user.role} name={dbUser?.name ?? session.user.name} />
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">{children}</main>
    </AdminThemeProvider>
  );
}
