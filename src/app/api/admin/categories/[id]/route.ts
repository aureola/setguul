import { NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  nameMn: z.string().min(2).max(100).optional(),
  slug: z.string().min(1).max(150).optional(),
  order: z.number().int().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("category.manage");
  if (!isApiUser(user)) return user;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (parsed.data.nameMn !== undefined) data.nameMn = parsed.data.nameMn;
  if (parsed.data.order !== undefined) data.order = parsed.data.order;

  if (parsed.data.slug !== undefined) {
    data.slug = slugify(parsed.data.slug, { lower: true, strict: true });
  } else if (parsed.data.nameMn !== undefined) {
    data.slug = slugify(parsed.data.nameMn, { lower: true, strict: true });
  }

  if (typeof data.slug === "string") {
    const conflict = await prisma.category.findFirst({
      where: { slug: data.slug, id: { not: id } },
      select: { id: true },
    });
    if (conflict) {
      return NextResponse.json({ error: "Энэ slug аль хэдийн ашиглагдаж байна" }, { status: 400 });
    }
  }

  const category = await prisma.category.update({ where: { id }, data });

  await logAction({
    userId: user.id,
    action: "category.update",
    entityType: "Category",
    entityId: category.id,
    metadata: { nameMn: category.nameMn },
  });

  return NextResponse.json(category);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("category.manage");
  if (!isApiUser(user)) return user;

  const { id } = await params;
  const articleCount = await prisma.article.count({ where: { categories: { some: { id } } } });
  if (articleCount > 0) {
    return NextResponse.json(
      { error: "Энэ ангилалд мэдээ байгаа тул устгах боломжгүй" },
      { status: 400 },
    );
  }

  await prisma.category.delete({ where: { id } });

  await logAction({
    userId: user.id,
    action: "category.delete",
    entityType: "Category",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
