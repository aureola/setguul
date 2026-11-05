import type { Metadata } from "next";
import { Roboto_Condensed, Geist_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import { getSetting } from "@/lib/settings";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["300", "400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const tagline = await getSetting("site_tagline");
  const description = `Setguul.mn — ${tagline}`;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: "Setguul.mn",
      template: "%s | Setguul.mn",
    },
    description,
    openGraph: {
      type: "website",
      title: "Setguul.mn",
      description,
      siteName: "Setguul.mn",
      locale: "mn_MN",
      images: [{ url: "/og-image.jpg", width: 1260, height: 522 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Setguul.mn",
      description,
      images: ["/og-image.jpg"],
    },
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${robotoCondensed.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
