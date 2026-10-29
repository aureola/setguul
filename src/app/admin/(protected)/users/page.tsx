import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import UserManager from "@/components/admin/UserManager";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function UsersPage() {
  const session = await auth();
  if (!hasPermission(session!.user.role, "users.manage")) redirect("/admin/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      _count: { select: { articles: true } },
    },
  });

  return (
    <div>
      <PageHeader title="Хэрэглэгчид" description="Админ панелийн хэрэглэгчид болон тэдний эрхийг удирдах" />
      <UserManager initial={users} />
    </div>
  );
}
