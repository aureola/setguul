import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export async function DELETE(request: Request) {
  const user = await requirePermission("comments.manage");
  if (!isApiUser(user)) return user;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { count } = await prisma.comment.deleteMany({ where: { id: { in: parsed.data.ids } } });

  await logAction({
    userId: user.id,
    action: "comment.deleteMany",
    entityType: "Comment",
    metadata: { count, ids: parsed.data.ids },
  });

  return NextResponse.json({ ok: true, count });
}
