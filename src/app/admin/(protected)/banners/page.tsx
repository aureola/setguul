import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { sanitizeBannerHtml } from "@/lib/sanitize";
import BannerManager from "@/components/admin/BannerManager";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function BannersPage() {
  const session = await auth();
  if (!hasPermission(session!.user.role, "banner.manage")) redirect("/admin/dashboard");

  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
  const sanitized = banners.map((b) => ({
    ...b,
    embedHtml: b.embedHtml ? sanitizeBannerHtml(b.embedHtml) : null,
  }));

  return (
    <div>
      <PageHeader title="Баннер" description="Нүүр хуудас болон sidebar-д харуулах баннеруудыг удирдах" />
      <BannerManager initial={sanitized} />
    </div>
  );
}
