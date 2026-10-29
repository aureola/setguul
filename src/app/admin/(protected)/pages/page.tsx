import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import PageListClient from "@/components/admin/PageListClient";
import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonPrimaryClass } from "@/components/admin/ui/styles";

export default async function PagesPage() {
  const session = await auth();
  if (!hasPermission(session!.user.role, "pages.manage")) redirect("/admin/dashboard");

  const pages = await prisma.page.findMany({
    orderBy: { order: "asc" },
    select: { id: true, title: true, slug: true, showInFooter: true },
  });

  return (
    <div>
      <PageHeader
        title="Хуудас"
        description="Холбоо барих, Бидний тухай, Нууцлалын бодлого зэрэг дурын хуудсуудыг удирдах"
        action={
          <Link href="/admin/pages/new" className={buttonPrimaryClass}>
            + Хуудас нэмэх
          </Link>
        }
      />
      <PageListClient pages={pages} />
    </div>
  );
}
