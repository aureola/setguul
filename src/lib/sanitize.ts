import sanitizeHtml from "sanitize-html";
import { ALLOWED_EMBED_HOSTS } from "./embed";

// Browsers normalize an inline `style.color = "#rrggbb"` assignment to
// `rgb(r, g, b)` when the DOM is serialized back to a string (which is what
// happens when Tiptap's editor.getHTML() reads the live ProseMirror view),
// so content saved from the editor uses rgb()/rgba(), not the original hex.
const SAFE_COLOR_PATTERNS = [
  /^#[0-9a-fA-F]{3,8}$/,
  /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,
  /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[\d.]+\s*\)$/,
];

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "hr", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "h2", "h3", "h4", "blockquote", "img", "figure", "figcaption", "span", "mark", "sup", "sub",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "iframe",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      span: ["style"],
      mark: ["data-color", "style"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      div: ["data-embed", "class"],
      iframe: ["src", "frameborder", "allow", "allowfullscreen", "loading"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^center$/, /^right$/, /^justify$/],
      },
      span: {
        color: SAFE_COLOR_PATTERNS,
      },
      mark: {
        "background-color": SAFE_COLOR_PATTERNS,
        color: [/^inherit$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ALLOWED_EMBED_HOSTS,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

// Banner HTML is an admin-only, trusted-input feature (gated by the
// "banner.manage" permission) typically used to paste third-party ad/embed
// snippets (ad-exchange carousels, video widgets, etc.) that rely on their
// own inline positioning and arbitrary iframe hosts — so, unlike
// sanitizeArticleHtml, styles and iframe hosts aren't restricted here.
// <script> remains categorically disallowed regardless.
export function sanitizeBannerHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["div", "span", "p", "a", "img", "iframe", "video", "source"],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "width", "height", "style", "title"],
      div: ["class", "style", "title", "aria-label"],
      span: ["class", "style", "title", "aria-label"],
      p: ["style"],
      iframe: [
        "src",
        "frameborder",
        "allow",
        "allowfullscreen",
        "loading",
        "width",
        "height",
        "style",
        "title",
        "aria-label",
        "scrolling",
      ],
      video: ["src", "poster", "controls", "autoplay", "muted", "loop", "playsinline", "width", "height", "style"],
      source: ["src", "type"],
    },
    allowedSchemes: ["https"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

export function sanitizePlainText(text: string): string {
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} }).trim();
}
