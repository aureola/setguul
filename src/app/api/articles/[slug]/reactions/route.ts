import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ARTICLE_REACTIONS,
  ARTICLE_REACTION_EMOJIS,
  type ArticleReactionEmoji,
} from "@/lib/article-reactions";
import { prisma } from "@/lib/prisma";

const voterCookieName = "article-reaction-voter";
const voterIdSchema = z.string().uuid();
const reactionSchema = z.object({
  emoji: z.enum(ARTICLE_REACTION_EMOJIS),
});

async function getVoterId() {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(voterCookieName)?.value;
  const parsedId = voterIdSchema.safeParse(existingId);
  if (parsedId.success) return parsedId.data;

  const voterId = randomUUID();
  cookieStore.set(voterCookieName, voterId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/articles",
    maxAge: 60 * 60 * 24 * 365,
  });
  return voterId;
}

async function getPublishedArticleId(identifier: string) {
  const numericId = /^\d+$/.test(identifier) ? Number(identifier) : null;
  const article = await prisma.article.findFirst({
    where: {
      status: "PUBLISHED",
      ...(numericId !== null && Number.isSafeInteger(numericId)
        ? { OR: [{ numericId }, { slug: identifier }] }
        : { slug: identifier }),
    },
    select: { id: true },
  });
  return article?.id ?? null;
}

async function getSummary(articleId: string, voterId: string) {
  const [groups, selectedReaction] = await Promise.all([
    prisma.articleReaction.groupBy({
      by: ["emoji"],
      where: { articleId },
      _count: { _all: true },
    }),
    prisma.articleReaction.findUnique({
      where: { articleId_voterId: { articleId, voterId } },
      select: { emoji: true },
    }),
  ]);
  const counts = Object.fromEntries(ARTICLE_REACTIONS.map(({ emoji }) => [emoji, 0])) as Record<
    ArticleReactionEmoji,
    number
  >;

  for (const group of groups) {
    const reaction = ARTICLE_REACTIONS.find(({ emoji }) => emoji === group.emoji);
    if (reaction) counts[reaction.emoji] = group._count._all;
  }

  const selected =
    ARTICLE_REACTIONS.find(({ emoji }) => emoji === selectedReaction?.emoji)?.emoji ?? null;

  return { counts, selected };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug: identifier } = await params;
  const articleId = await getPublishedArticleId(identifier);
  if (!articleId) {
    return NextResponse.json({ error: "Мэдээ олдсонгүй" }, { status: 404 });
  }

  const voterId = await getVoterId();
  return NextResponse.json(await getSummary(articleId, voterId));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug: identifier } = await params;
  const body = await request.json().catch(() => null);
  const parsed = reactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Үнэлгээгээ сонгоно уу" }, { status: 400 });
  }

  const articleId = await getPublishedArticleId(identifier);
  if (!articleId) {
    return NextResponse.json({ error: "Мэдээ олдсонгүй" }, { status: 404 });
  }

  const voterId = await getVoterId();
  await prisma.articleReaction.upsert({
    where: { articleId_voterId: { articleId, voterId } },
    create: { articleId, voterId, emoji: parsed.data.emoji },
    update: { emoji: parsed.data.emoji },
  });

  return NextResponse.json(await getSummary(articleId, voterId));
}
