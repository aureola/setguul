import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import PageForm from "@/components/admin/PageForm";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!hasPermission(session!.user.role, "pages.manage")) redirect("/admin/dashboard");

  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div>
      <PageHeader title="Хуудас засах" />
      <PageForm
        initial={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          content: page.content,
          showInFooter: page.showInFooter,
        }}
      />
    </div>
  );
}
