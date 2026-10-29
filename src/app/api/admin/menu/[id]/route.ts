import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  label: z.string().min(1).max(60).optional(),
  url: z.string().min(1).max(200).optional(),
  order: z.number().int().optional(),
  parentId: z.string().optional().nullable(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("menu.manage");
  if (!isApiUser(user)) return user;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const item = await prisma.menuItem.update({ where: { id }, data: parsed.data });

  await logAction({ userId: user.id, action: "menu.update", entityType: "MenuItem", entityId: item.id });

  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("menu.manage");
  if (!isApiUser(user)) return user;

  const { id } = await params;
  await prisma.menuItem.delete({ where: { id } });

  await logAction({ userId: user.id, action: "menu.delete", entityType: "MenuItem", entityId: id });

  return NextResponse.json({ ok: true });
}
