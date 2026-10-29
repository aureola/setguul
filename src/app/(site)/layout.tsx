import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getSettings } from "@/lib/settings";
import { getMenuItems } from "@/lib/menu";
import { getFooterPages } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, menuItems, footerPages] = await Promise.all([
    getSettings(),
    getMenuItems(),
    getFooterPages(),
  ]);

  return (
    <div
      className="flex min-h-screen flex-col bg-background text-foreground"
      style={{ "--accent": settings.accent_color } as React.CSSProperties}
    >
      <SiteHeader siteTitle={settings.site_title} menuItems={menuItems} />
      <main className="flex-1">{children}</main>
      <SiteFooter siteTitle={settings.site_title} footerText={settings.footer_text} pages={footerPages} />
    </div>
  );
}
