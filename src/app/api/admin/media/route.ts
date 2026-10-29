import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { z } from "zod";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";
import { listMediaWithUsage, getMediaUsageMap, resolveUploadPath } from "@/lib/media";

export async function GET() {
  const user = await requirePermission("media.manage");
  if (!isApiUser(user)) return user;

  const files = await listMediaWithUsage();
  return NextResponse.json(files);
}

const deleteSchema = z.object({
  url: z.string().min(1),
  force: z.boolean().optional(),
});

export async function DELETE(request: Request) {
  const user = await requirePermission("media.manage");
  if (!isApiUser(user)) return user;

  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Буруу хүсэлт" }, { status: 400 });
  }
  const { url, force } = parsed.data;

  const absolutePath = resolveUploadPath(url);
  if (!absolutePath) {
    return NextResponse.json({ error: "Буруу файлын зам" }, { status: 400 });
  }

  if (!force) {
    const usageMap = await getMediaUsageMap();
    const usedBy = usageMap.get(url) ?? [];
    if (usedBy.length > 0) {
      return NextResponse.json({ error: "Энэ файл ашиглагдаж байна", usedBy }, { status: 409 });
    }
  }

  await unlink(absolutePath).catch((err) => {
    if (err?.code !== "ENOENT") throw err;
  });

  await logAction({
    userId: user.id,
    action: "file.delete",
    entityType: "Upload",
    entityId: url,
    metadata: { url, forced: Boolean(force) },
  });

  return NextResponse.json({ ok: true });
}
