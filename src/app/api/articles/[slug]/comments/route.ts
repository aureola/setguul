import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizePlainText } from "@/lib/sanitize";
import { getSetting } from "@/lib/settings";
import { maskIp } from "@/lib/format";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  content: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Нэр болон сэтгэгдэл заавал бөглөнө үү" }, { status: 400 });
  }

  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true, commentsEnabled: true },
  });
  if (!article) {
    return NextResponse.json({ error: "Мэдээ олдсонгүй" }, { status: 404 });
  }

  const commentsEnabled =
    article.commentsEnabled ?? (await getSetting("comments_enabled")) === "true";
  if (!commentsEnabled) {
    return NextResponse.json({ error: "Энэ мэдээнд сэтгэгдэл бичих боломжгүй байна" }, { status: 403 });
  }

  const name = sanitizePlainText(parsed.data.name);
  const content = sanitizePlainText(parsed.data.content);
  if (!name || !content) {
    return NextResponse.json({ error: "Нэр болон сэтгэгдэл заавал бөглөнө үү" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? null;

  const comment = await prisma.comment.create({
    data: { articleId: article.id, name, content, ip },
    select: { id: true, name: true, content: true, createdAt: true },
  });

  return NextResponse.json({ comment: { ...comment, ip: maskIp(ip) } });
}
