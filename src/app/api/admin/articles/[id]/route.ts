import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, isApiUser } from "@/lib/api-auth";
import { canEditArticle, canDeleteArticle, hasPermission } from "@/lib/permissions";
import { uniqueArticleSlug } from "@/lib/slug";
import { logAction } from "@/lib/audit";

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1).optional(),
  coverImage: z.string().optional().nullable(),
  categoryIds: z.array(z.string().min(1)).min(1).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  commentsEnabled: z.boolean().optional().nullable(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!isApiUser(user)) return user;

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });

  if (!canEditArticle(user.role, article.authorId, user.id)) {
    return NextResponse.json({ error: "Эрхгүй байна" }, { status: 403 });
  }

  return NextResponse.json(article);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!isApiUser(user)) return user;

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });

  if (!canEditArticle(user.role, article.authorId, user.id)) {
    return NextResponse.json({ error: "Энэ мэдээг засах эрхгүй байна" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  let status = data.status ?? article.status;
  if (status === "PUBLISHED" && !hasPermission(user.role, "article.publish")) {
    status = article.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  }

  const slug = data.title && data.title !== article.title
    ? await uniqueArticleSlug(data.title, article.id)
    : article.slug;

  const publishedAt = data.publishedAt !== undefined
    ? (data.publishedAt ? new Date(data.publishedAt) : null)
    : status === "PUBLISHED" && article.status !== "PUBLISHED"
      ? new Date()
      : article.publishedAt;

  const updated = await prisma.article.update({
    where: { id },
    data: {
      title: data.title ?? article.title,
      slug,
      excerpt: data.excerpt === undefined ? article.excerpt : data.excerpt,
      content: data.content ?? article.content,
      coverImage: data.coverImage === undefined ? article.coverImage : data.coverImage,
      ...(data.categoryIds ? { categories: { set: data.categoryIds.map((cid) => ({ id: cid })) } } : {}),
      status,
      publishedAt,
      commentsEnabled: data.commentsEnabled === undefined ? article.commentsEnabled : data.commentsEnabled,
    },
  });

  await logAction({
    userId: user.id,
    action: "article.update",
    entityType: "Article",
    entityId: updated.id,
    metadata: { title: updated.title, status: updated.status },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!isApiUser(user)) return user;

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 });

  if (!canDeleteArticle(user.role, article.authorId, user.id)) {
    return NextResponse.json({ error: "Энэ мэдээг устгах эрхгүй байна" }, { status: 403 });
  }

  await prisma.article.delete({ where: { id } });

  await logAction({
    userId: user.id,
    action: "article.delete",
    entityType: "Article",
    entityId: id,
    metadata: { title: article.title },
  });

  return NextResponse.json({ ok: true });
}
