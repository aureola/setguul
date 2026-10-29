import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import UserEditForm from "@/components/admin/UserEditForm";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!hasPermission(session!.user.role, "users.manage")) redirect("/admin/dashboard");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  if (!user) notFound();

  return (
    <div>
      <PageHeader title="Хэрэглэгч засах" />
      <UserEditForm initial={user} isSelf={user.id === session!.user.id} />
    </div>
  );
}
