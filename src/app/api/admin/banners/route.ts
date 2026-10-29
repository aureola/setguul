import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";
import { sanitizeBannerHtml } from "@/lib/sanitize";

const baseSchema = {
  title: z.string().min(2).max(150),
  linkUrl: z.string().optional().nullable(),
  position: z.string().default("home_top"),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
};

const schema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("IMAGE"), imageUrl: z.string().min(1), ...baseSchema }),
  z.object({ type: z.literal("VIDEO"), videoUrl: z.string().min(1), ...baseSchema }),
  z.object({ type: z.literal("EMBED"), embedHtml: z.string().min(1), ...baseSchema }),
]);

export async function GET() {
  const user = await requirePermission("banner.manage");
  if (!isApiUser(user)) return user;
  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(banners);
}

export async function POST(request: Request) {
  const user = await requirePermission("banner.manage");
  if (!isApiUser(user)) return user;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const banner = await prisma.banner.create({
    data: {
      ...data,
      embedHtml: data.type === "EMBED" ? sanitizeBannerHtml(data.embedHtml) : null,
    },
  });

  await logAction({
    userId: user.id,
    action: "banner.create",
    entityType: "Banner",
    entityId: banner.id,
    metadata: { title: banner.title },
  });

  return NextResponse.json(banner, { status: 201 });
}
