import { NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  nameMn: z.string().min(2).max(100),
  order: z.number().int().default(0),
});

export async function GET() {
  const user = await requirePermission("category.manage");
  if (!isApiUser(user)) return user;
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const user = await requirePermission("category.manage");
  if (!isApiUser(user)) return user;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const slug = slugify(parsed.data.nameMn, { lower: true, strict: true });
  const category = await prisma.category.create({ data: { ...parsed.data, slug } });

  await logAction({
    userId: user.id,
    action: "category.create",
    entityType: "Category",
    entityId: category.id,
    metadata: { nameMn: category.nameMn },
  });

  return NextResponse.json(category, { status: 201 });
}
