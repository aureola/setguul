import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";
import { sanitizeBannerHtml } from "@/lib/sanitize";

const schema = z.object({
  title: z.string().min(2).max(150).optional(),
  type: z.enum(["IMAGE", "VIDEO", "EMBED"]).optional(),
  imageUrl: z.string().min(1).optional().nullable(),
  videoUrl: z.string().min(1).optional().nullable(),
  embedHtml: z.string().min(1).optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  position: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("banner.manage");
  if (!isApiUser(user)) return user;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = { ...parsed.data };
  if (data.embedHtml) {
    data.embedHtml = sanitizeBannerHtml(data.embedHtml);
  }

  const banner = await prisma.banner.update({ where: { id }, data });

  await logAction({
    userId: user.id,
    action: "banner.update",
    entityType: "Banner",
    entityId: banner.id,
  });

  return NextResponse.json(banner);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("banner.manage");
  if (!isApiUser(user)) return user;

  const { id } = await params;
  await prisma.banner.delete({ where: { id } });

  await logAction({
    userId: user.id,
    action: "banner.delete",
    entityType: "Banner",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
