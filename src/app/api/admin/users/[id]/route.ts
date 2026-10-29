import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["ADMINISTRATOR", "MODERATOR", "EDITOR"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(4).max(100).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("users.manage");
  if (!isApiUser(user)) return user;

  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json({ error: "Өөрийн эрхийг энэ хэсгээс өөрчлөх боломжгүй" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: Record<string, unknown> = { ...parsed.data };
  delete data.password;
  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  await logAction({
    userId: user.id,
    action: "user.update",
    entityType: "User",
    entityId: updated.id,
    metadata: { role: updated.role, isActive: updated.isActive },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("users.manage");
  if (!isApiUser(user)) return user;

  const { id } = await params;
  if (id === user.id) {
    return NextResponse.json({ error: "Өөрийгөө устгах боломжгүй" }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { isActive: false } });

  await logAction({
    userId: user.id,
    action: "user.deactivate",
    entityType: "User",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
