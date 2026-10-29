import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export async function requireUser(): Promise<ApiUser | NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }
  return session.user as ApiUser;
}

export async function requirePermission(permission: Permission): Promise<ApiUser | NextResponse> {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  if (!hasPermission(user.role, permission)) {
    return NextResponse.json({ error: "Энэ үйлдлийг хийх эрхгүй байна" }, { status: 403 });
  }
  return user;
}

export function isApiUser(value: ApiUser | NextResponse): value is ApiUser {
  return !(value instanceof NextResponse);
}
