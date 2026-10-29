import { readdir, stat } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { extractAllImageSrcs } from "@/lib/content-image";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export interface MediaUsage {
  type: "article" | "banner";
  id: string;
  title: string;
}

export interface MediaFile {
  url: string;
  size: number;
  mtime: string;
  usedBy: MediaUsage[];
}

/** Resolves a `/uploads/...` URL to an absolute path, rejecting anything that
 * would escape the uploads directory (e.g. `../`). */
export function resolveUploadPath(url: string): string | null {
  if (!url.startsWith("/uploads/")) return null;
  const relative = url.slice("/uploads/".length);
  const absolute = path.join(UPLOADS_ROOT, relative);
  if (!absolute.startsWith(UPLOADS_ROOT + path.sep)) return null;
  return absolute;
}

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

async function walk(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

export async function listUploadedFiles(): Promise<Omit<MediaFile, "usedBy">[]> {
  const absolutePaths = (await walk(UPLOADS_ROOT)).filter((p) =>
    IMAGE_EXTENSIONS.has(path.extname(p).toLowerCase()),
  );
  const files = await Promise.all(
    absolutePaths.map(async (absolute) => {
      const info = await stat(absolute);
      const url = "/uploads/" + path.relative(UPLOADS_ROOT, absolute).split(path.sep).join("/");
      return { url, size: info.size, mtime: info.mtime.toISOString() };
    }),
  );
  return files.sort((a, b) => b.mtime.localeCompare(a.mtime));
}

export async function getMediaUsageMap(): Promise<Map<string, MediaUsage[]>> {
  const [articles, banners] = await Promise.all([
    prisma.article.findMany({ select: { id: true, title: true, coverImage: true, content: true } }),
    prisma.banner.findMany({ select: { id: true, title: true, imageUrl: true } }),
  ]);

  const map = new Map<string, MediaUsage[]>();
  const add = (url: string | null, usage: MediaUsage) => {
    if (!url) return;
    const list = map.get(url) ?? [];
    list.push(usage);
    map.set(url, list);
  };

  for (const article of articles) {
    add(article.coverImage, { type: "article", id: article.id, title: article.title });
    for (const src of extractAllImageSrcs(article.content)) {
      add(src, { type: "article", id: article.id, title: article.title });
    }
  }
  for (const banner of banners) {
    add(banner.imageUrl, { type: "banner", id: banner.id, title: banner.title });
  }

  return map;
}

export async function listMediaWithUsage(): Promise<MediaFile[]> {
  const [files, usageMap] = await Promise.all([listUploadedFiles(), getMediaUsageMap()]);
  return files.map((file) => ({ ...file, usedBy: usageMap.get(file.url) ?? [] }));
}
