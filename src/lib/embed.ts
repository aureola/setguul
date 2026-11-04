export const ALLOWED_EMBED_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
  "w.soundcloud.com",
  "open.spotify.com",
  "www.google.com",
  "www.facebook.com",
];

export interface ExtractedEmbed {
  src: string;
  width: number | null;
  height: number | null;
}

export function extractEmbed(input: string): ExtractedEmbed | null {
  const trimmed = input.trim();
  const iframeMatch = trimmed.match(/<iframe[^>]+>/i);
  const iframeTag = iframeMatch?.[0];
  const srcMatch = iframeTag?.match(/\ssrc=["']([^"']+)["']/i);
  const candidate = srcMatch ? srcMatch[1] : trimmed;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return null;
    if (!ALLOWED_EMBED_HOSTS.includes(url.hostname)) return null;

    const widthMatch = iframeTag?.match(/\swidth=["']?(\d+)/i);
    const heightMatch = iframeTag?.match(/\sheight=["']?(\d+)/i);

    return {
      src: url.toString(),
      width: widthMatch ? Number(widthMatch[1]) : null,
      height: heightMatch ? Number(heightMatch[1]) : null,
    };
  } catch {
    return null;
  }
}
