import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const schema = z.record(z.string(), z.string());

export async function GET() {
  const user = await requirePermission("settings.manage");
  if (!isApiUser(user)) return user;
  const rows = await prisma.siteSetting.findMany();
  return NextResponse.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}

export async function PATCH(request: Request) {
  const user = await requirePermission("settings.manage");
  if (!isApiUser(user)) return user;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await prisma.$transaction(
    Object.entries(parsed.data).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );

  await logAction({
    userId: user.id,
    action: "settings.update",
    entityType: "SiteSetting",
    metadata: { keys: Object.keys(parsed.data) },
  });

  return NextResponse.json({ ok: true });
}
