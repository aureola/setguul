import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requirePermission, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";
import { UPLOADS_ROOT, datePathForNow } from "@/lib/uploads";

// Kept separate from /api/admin/upload (images) so the much larger size
// limit here doesn't apply to every image-upload call site in the app.
const ALLOWED_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const MAX_SIZE = 30 * 1024 * 1024; // 30MB

export async function POST(request: Request) {
  const user = await requirePermission("banner.manage");
  if (!isApiUser(user)) return user;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл олдсонгүй" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Зөвхөн mp4, webm видео оруулна уу" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Файлын хэмжээ 30MB-аас хэтрэхгүй байх ёстой" }, { status: 400 });
  }

  const datePath = datePathForNow();

  const uploadDir = path.join(UPLOADS_ROOT, datePath);
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const url = `/uploads/${datePath}/${filename}`;

  await logAction({
    userId: user.id,
    action: "file.upload",
    entityType: "Upload",
    entityId: filename,
    metadata: { originalName: file.name, size: file.size, type: file.type, url },
  });

  return NextResponse.json({ url });
}
