import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

interface LogActionInput {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAction({ userId, action, entityType, entityId, metadata }: LogActionInput) {
  let ip: string | null = null;
  let userAgent: string | null = null;

  try {
    const h = await headers();
    ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
    userAgent = h.get("user-agent");
  } catch {
    // headers() unavailable outside a request scope (e.g. seed scripts)
  }

  await prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ip,
      userAgent,
    },
  });
}
