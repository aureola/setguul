import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "./SocialIcons";

interface FooterPage {
  title: string;
  slug: string;
}

export default function SiteFooter({
  siteTitle,
  footerText,
  pages,
  facebookUrl,
  instagramUrl,
  youtubeUrl,
}: {
  siteTitle: string;
  footerText: string;
  pages: FooterPage[];
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}) {
  const hasSocialLinks = facebookUrl || instagramUrl || youtubeUrl;

  return (
    <footer className="mt-16 border-t border-border/60">
      <div className="container-page flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        {/* Newsletter signup temporarily disabled.
        <div>
          <h3 className="text-lg font-extrabold tracking-wide">
            МЭДЭЭЛЛЭЭ <br /> БҮРТГҮҮЛЭЭРЭЙ
          </h3>
        </div>
        <SubscribeForm />
        */}
        {hasSocialLinks && (
          <div className="flex items-center gap-4">
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted transition hover:text-accent"
              >
                <FacebookIcon />
              </a>
            )}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted transition hover:text-accent"
              >
                <InstagramIcon />
              </a>
            )}
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube"
                className="text-muted transition hover:text-accent"
              >
                <YoutubeIcon />
              </a>
            )}
          </div>
        )}
      </div>
      <div className="border-t border-border/60 py-6">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-xs text-muted md:flex-row">
          <Image
            src="/setguullogo.png"
            alt={siteTitle}
            width={500}
            height={122}
            className="h-7 w-auto"
          />
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
