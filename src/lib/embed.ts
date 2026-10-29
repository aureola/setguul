export const ALLOWED_EMBED_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
  "w.soundcloud.com",
  "open.spotify.com",
  "www.google.com",
];

export function extractEmbedSrc(input: string): string | null {
  const trimmed = input.trim();
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  const candidate = iframeMatch ? iframeMatch[1] : trimmed;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return null;
    if (!ALLOWED_EMBED_HOSTS.includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}
