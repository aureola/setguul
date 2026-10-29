import { prisma } from "@/lib/prisma";
import { sanitizeBannerHtml } from "@/lib/sanitize";

export async function getActiveBanners(position: string, take = 3) {
  const banners = await prisma.banner.findMany({
    where: { position, isActive: true },
    orderBy: { order: "asc" },
    take,
    select: { id: true, title: true, type: true, imageUrl: true, videoUrl: true, embedHtml: true, linkUrl: true },
  });
  return banners.map((banner) => ({
    ...banner,
    embedHtml: banner.embedHtml ? sanitizeBannerHtml(banner.embedHtml) : null,
  }));
}
