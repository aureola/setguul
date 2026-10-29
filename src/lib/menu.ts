import { prisma } from "@/lib/prisma";

export async function getMenuItems() {
  return prisma.menuItem.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });
}
