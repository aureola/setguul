import { NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  title: z.string().min(2).max(150).optional(),
  slug: z.string().min(1).max(150).optional(),
  content: z.string().min(1).optional(),
  showInFooter: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("pages.manage");
  if (!isApiUser(user)) return user;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.slug !== undefined) {
    data.slug = slugify(parsed.data.slug, { lower: true, strict: true });
  }

  if (typeof data.slug === "string") {
    const conflict = await prisma.page.findFirst({
      where: { slug: data.slug, id: { not: id } },
      select: { id: true },
    });
    if (conflict) {
      return NextResponse.json({ error: "Энэ slug аль хэдийн ашиглагдаж байна" }, { status: 400 });
    }
  }

  const page = await prisma.page.update({ where: { id }, data });

  await logAction({
    userId: user.id,
    action: "page.update",
    entityType: "Page",
    entityId: page.id,
    metadata: { title: page.title },
  });

  return NextResponse.json(page);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("pages.manage");
  if (!isApiUser(user)) return user;

  const { id } = await params;
  await prisma.page.delete({ where: { id } });

  await logAction({
    userId: user.id,
    action: "page.delete",
    entityType: "Page",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
