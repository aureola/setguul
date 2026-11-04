import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { UPLOADS_ROOT } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function resolveSafePath(segments: string[]): string | null {
  const absolute = path.join(UPLOADS_ROOT, ...segments);
  if (!absolute.startsWith(UPLOADS_ROOT + path.sep)) return null;
  return absolute;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const absolute = resolveSafePath(segments);
  if (!absolute) {
    return new NextResponse(null, { status: 400 });
  }

  let fileStat;
  try {
    fileStat = await stat(absolute);
  } catch {
    return new NextResponse(null, { status: 404 });
  }
  if (!fileStat.isFile()) {
    return new NextResponse(null, { status: 404 });
  }

  const contentType = CONTENT_TYPES[path.extname(absolute).toLowerCase()] ?? "application/octet-stream";
  // Filenames are random UUIDs that are never reused or overwritten, so a
  // long immutable cache is safe.
  const baseHeaders = {
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const start = match?.[1] ? parseInt(match[1], 10) : 0;
    const end = match?.[2] ? parseInt(match[2], 10) : fileStat.size - 1;
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileStat.size) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${fileStat.size}` },
      });
    }
    const stream = createReadStream(absolute, { start, end });
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
      },
    });
  }

  const stream = createReadStream(absolute);
  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    status: 200,
    headers: {
      ...baseHeaders,
      "Content-Length": String(fileStat.size),
    },
  });
}
