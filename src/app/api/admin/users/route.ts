import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  email: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  password: z.string().min(4).max(100),
  role: z.enum(["ADMINISTRATOR", "MODERATOR", "EDITOR"]),
});

export async function GET() {
  const user = await requirePermission("users.manage");
  if (!isApiUser(user)) return user;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const user = await requirePermission("users.manage");
  if (!isApiUser(user)) return user;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "Энэ нэвтрэх нэр бүртгэлтэй байна" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const created = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash,
    },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });

  await logAction({
    userId: user.id,
    action: "user.create",
    entityType: "User",
    entityId: created.id,
    metadata: { email: created.email, role: created.role },
  });

  return NextResponse.json(created, { status: 201 });
}
