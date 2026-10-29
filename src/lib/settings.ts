import { prisma } from "@/lib/prisma";

const DEFAULTS: Record<string, string> = {
  site_title: "Setguul.mn",
  site_tagline: "Curious. Mindful. Growth.",
  accent_color: "#F2C21C",
  footer_text: "© 2026 SETGUUL.MN. Бүх эрх хуулиар хамгаалагдсан.",
  show_view_count: "false",
  comments_enabled: "true",
  article_url_mode: "slug",
};

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany();
  const map = { ...DEFAULTS };
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? DEFAULTS[key] ?? "";
}
