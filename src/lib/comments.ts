import { prisma } from "@/lib/prisma";
import { maskIp } from "@/lib/format";

export async function getCommentsByArticle(articleId: string) {
  const comments = await prisma.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, content: true, createdAt: true, ip: true },
  });
  return comments.map((comment) => ({ ...comment, ip: maskIp(comment.ip) }));
}
