import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireUser, isApiUser } from "@/lib/api-auth";
import { logAction } from "@/lib/audit";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const user = await requireUser();
  if (!isApiUser(user)) return user;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл олдсонгүй" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Зөвхөн jpg, png, webp, gif зураг оруулна уу" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Файлын хэмжээ 5MB-аас хэтрэхгүй байх ёстой" }, { status: 400 });
  }

  const now = new Date();
  const datePath = [
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("/");

  const uploadDir = path.join(process.cwd(), "public", "uploads", datePath);
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
