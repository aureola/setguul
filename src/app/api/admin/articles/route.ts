import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions";
import { uniqueArticleSlug } from "@/lib/slug";
import { logAction } from "@/lib/audit";

const createSchema = z.object({
  title: z.string().min(3).max(200),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1),
  coverImage: z.string().optional().nullable(),
  categoryIds: z.array(z.string().min(1)).min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  publishedAt: z.string().datetime().optional().nullable(),
  commentsEnabled: z.boolean().optional().nullable(),
});

export async function GET() {
  const user = await requirePermission("article.create");
  if (!isApiUser(user)) return user;

  const where = hasPermission(user.role, "article.editAny") ? {} : { authorId: user.id };

  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      categories: { select: { nameMn: true } },
      author: { select: { name: true } },
    },
  });

  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const user = await requirePermission("article.create");
  if (!isApiUser(user)) return user;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const status = data.status === "PUBLISHED" && !hasPermission(user.role, "article.publish")
    ? "DRAFT"
    : data.status;

  const slug = await uniqueArticleSlug(data.title);

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt ?? null,
      content: data.content,
      coverImage: data.coverImage ?? null,
      categories: { connect: data.categoryIds.map((id) => ({ id })) },
      authorId: user.id,
      status,
      commentsEnabled: data.commentsEnabled ?? null,
      publishedAt: data.publishedAt
        ? new Date(data.publishedAt)
        : status === "PUBLISHED"
          ? new Date()
          : null,
    },
  });

  await logAction({
    userId: user.id,
    action: "article.create",
    entityType: "Article",
    entityId: article.id,
    metadata: { title: article.title, status: article.status },
  });

  return NextResponse.json(article, { status: 201 });
}
