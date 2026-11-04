import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import OfflineScreen from "@/components/site/OfflineScreen";
import { getSettings } from "@/lib/settings";
import { getMenuItems } from "@/lib/menu";
import { getFooterPages } from "@/lib/pages";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, menuItems, footerPages, session] = await Promise.all([
    getSettings(),
    getMenuItems(),
    getFooterPages(),
    auth(),
  ]);

  if (settings.offline_enabled === "true" && !session) {
    return <OfflineScreen siteTitle={settings.site_title} message={settings.offline_message} />;
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-background text-foreground"
      style={{ "--accent": settings.accent_color } as React.CSSProperties}
    >
      <SiteHeader siteTitle={settings.site_title} menuItems={menuItems} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        siteTitle={settings.site_title}
        footerText={settings.footer_text}
        pages={footerPages}
        facebookUrl={settings.social_facebook_url}
        instagramUrl={settings.social_instagram_url}
        youtubeUrl={settings.social_youtube_url}
      />
    </div>
  );
}
