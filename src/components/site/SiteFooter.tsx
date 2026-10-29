import Link from "next/link";
import SubscribeForm from "./SubscribeForm";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "./SocialIcons";

interface FooterPage {
  title: string;
  slug: string;
}

export default function SiteFooter({
  siteTitle,
  footerText,
  pages,
}: {
  siteTitle: string;
  footerText: string;
  pages: FooterPage[];
}) {
  return (
    <footer className="mt-16 border-t border-border/60">
      <div className="container-page flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-extrabold tracking-wide">
            МЭДЭЭЛЛЭЭ <br /> БҮРТГҮҮЛЭЭРЭЙ
          </h3>
        </div>
        <SubscribeForm />
        <div className="flex items-center gap-4">
          <a href="#" aria-label="Facebook" className="text-muted transition hover:text-accent">
            <FacebookIcon />
          </a>
          <a href="#" aria-label="Instagram" className="text-muted transition hover:text-accent">
            <InstagramIcon />
          </a>
          <a href="#" aria-label="Youtube" className="text-muted transition hover:text-accent">
            <YoutubeIcon />
          </a>
        </div>
      </div>
      <div className="border-t border-border/60 py-6">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-xs text-muted md:flex-row">
          <span className="text-base font-extrabold text-foreground">
            <span className="text-accent">{siteTitle.split(".")[0]}</span>.mn
          </span>
          <span>{footerText}</span>
          {pages.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {pages.map((page) => (
                <Link key={page.slug} href={`/page/${page.slug}`} className="hover:text-accent">
                  {page.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
