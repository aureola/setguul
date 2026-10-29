import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  label: z.string().min(1).max(60),
  url: z.string().min(1).max(200),
  order: z.number().int().default(0),
  parentId: z.string().optional().nullable(),
});

export async function GET() {
  const user = await requirePermission("menu.manage");
  if (!isApiUser(user)) return user;
  const items = await prisma.menuItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const user = await requirePermission("menu.manage");
  if (!isApiUser(user)) return user;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const item = await prisma.menuItem.create({ data: parsed.data });

  await logAction({
    userId: user.id,
    action: "menu.create",
    entityType: "MenuItem",
    entityId: item.id,
    metadata: { label: item.label },
  });

  return NextResponse.json(item, { status: 201 });
}
