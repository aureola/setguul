import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import MenuManager from "@/components/admin/MenuManager";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function MenuPage() {
  const session = await auth();
  if (!hasPermission(session!.user.role, "menu.manage")) redirect("/admin/dashboard");

  const [items, categories] = await Promise.all([
    prisma.menuItem.findMany({ where: { parentId: null }, orderBy: { order: "asc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { slug: true, nameMn: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Цэс" description="Нүүр цэсний холбоосуудыг удирдах" />
      <MenuManager initial={items} categories={categories} />
    </div>
  );
}
