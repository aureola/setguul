export function extractFirstImageSrc(html: string): string | null {
  return extractAllImageSrcs(html)[0] ?? null;
}

export function extractAllImageSrcs(html: string): string[] {
  const srcs: string[] = [];
  for (const match of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    const src = match[1];
    // Only trust locally-hosted uploads; next/image would otherwise reject or
    // mis-render arbitrary external hosts that were never configured.
    if (src.startsWith("/") && !srcs.includes(src)) srcs.push(src);
  }
  return srcs;
}
