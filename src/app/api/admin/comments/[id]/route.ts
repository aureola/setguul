import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("comments.manage");
  if (!isApiUser(user)) return user;

  const { id } = await params;
  await prisma.comment.delete({ where: { id } }).catch(() => null);

  await logAction({
    userId: user.id,
    action: "comment.delete",
    entityType: "Comment",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
