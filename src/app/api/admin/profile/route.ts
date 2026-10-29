import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).max(100).optional(),
  // Matches the existing /api/admin/users schema: this field is used as a
  // freeform login name, not a strictly-validated RFC email address (e.g.
  // the seed admin account's value is literally "admin").
  email: z.string().min(2).max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(4).max(100).optional(),
});

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!isApiUser(user)) return user;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });

  const emailChanged = data.email !== undefined && data.email !== dbUser.email;
  const wantsSensitiveChange = Boolean(data.newPassword) || emailChanged;

  if (wantsSensitiveChange) {
    if (!data.currentPassword) {
      return NextResponse.json({ error: "Одоогийн нууц үгээ оруулна уу" }, { status: 400 });
    }
    const valid = await bcrypt.compare(data.currentPassword, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Одоогийн нууц үг буруу байна" }, { status: 400 });
    }
  }

  if (emailChanged) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Энэ имэйл хаяг өөр хэрэглэгчид бүртгэлтэй байна" }, { status: 400 });
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (emailChanged) updateData.email = data.email;
  if (data.newPassword) updateData.passwordHash = await bcrypt.hash(data.newPassword, 10);

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ name: dbUser.name, email: dbUser.email });
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data: updateData });

  await logAction({
    userId: user.id,
    action: "user.updateProfile",
    entityType: "User",
    entityId: user.id,
    metadata: { changedFields: Object.keys(updateData) },
  });

  return NextResponse.json({ name: updated.name, email: updated.email });
}
