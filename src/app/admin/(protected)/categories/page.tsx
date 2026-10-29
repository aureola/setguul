import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import CategoryManager from "@/components/admin/CategoryManager";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function CategoriesPage() {
  const session = await auth();
  if (!hasPermission(session!.user.role, "category.manage")) redirect("/admin/dashboard");

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <PageHeader title="Ангилал" description="Мэдээний ангиллуудыг нэмэх, засах, устгах" />
      <CategoryManager initial={categories} />
    </div>
  );
}
