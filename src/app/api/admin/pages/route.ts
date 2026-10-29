import { NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  title: z.string().min(2).max(150),
  slug: z.string().min(1).max(150).optional(),
  content: z.string().min(1),
  showInFooter: z.boolean().default(false),
  order: z.number().int().default(0),
});

export async function GET() {
  const user = await requirePermission("pages.manage");
  if (!isApiUser(user)) return user;
  const pages = await prisma.page.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  const user = await requirePermission("pages.manage");
  if (!isApiUser(user)) return user;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const slug = slugify(parsed.data.slug || parsed.data.title, { lower: true, strict: true });

  const conflict = await prisma.page.findUnique({ where: { slug }, select: { id: true } });
  if (conflict) {
    return NextResponse.json({ error: "Энэ slug аль хэдийн ашиглагдаж байна" }, { status: 400 });
  }

  const page = await prisma.page.create({ data: { ...parsed.data, slug } });

  await logAction({
    userId: user.id,
    action: "page.create",
    entityType: "Page",
    entityId: page.id,
    metadata: { title: page.title },
  });

  return NextResponse.json(page, { status: 201 });
}
