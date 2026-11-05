import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const SETTINGS_CACHE_TAG = "site-settings";

const DEFAULTS: Record<string, string> = {
  site_title: "Setguul.mn",
  site_tagline: "Curious. Mindful. Growth.",
  accent_color: "#F2C21C",
  footer_text: "© 2026 SETGUUL.MN. Бүх эрх хуулиар хамгаалагдсан.",
  show_view_count: "authenticated",
  article_author_visibility: "all",
  comments_enabled: "true",
  article_url_mode: "slug",
  category_page_size: "20",
  offline_enabled: "false",
  offline_message: "Сайт түр хугацаанд ажиллахгүй байна. Удахгүй эргэж орж ирнэ үү.",
  social_facebook_url: "",
  social_instagram_url: "",
  social_youtube_url: "",
};

// Every page reads settings through this cache, so a DB round trip happens
// once per revalidation window instead of once per page during a build —
// the host's constrained thread count makes concurrent Prisma calls panic
// (see next.config.ts).
const getCachedSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const rows = await prisma.siteSetting.findMany();
    const map = { ...DEFAULTS };
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  },
  ["site-settings"],
  { tags: [SETTINGS_CACHE_TAG], revalidate: 300 },
);

export async function getSettings(): Promise<Record<string, string>> {
  return getCachedSettings();
}

export async function getSetting(key: string): Promise<string> {
  const settings = await getCachedSettings();
  return settings[key] ?? "";
}
