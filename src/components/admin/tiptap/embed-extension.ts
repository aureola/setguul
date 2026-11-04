import { Node, mergeAttributes } from "@tiptap/core";

export interface EmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (src: string, width?: number | null, height?: number | null) => ReturnType;
    };
  }
}

const Embed = Node.create<EmbedOptions>({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      // Preserve the source iframe's own aspect ratio (e.g. a portrait
      // Facebook Reel) instead of always forcing 16:9, which would squash
      // tall video into a short wide box.
      width: { default: null },
      height: { default: null },
    };
  },

  parseHTML() {
    const getAttrs = (el: Element) => ({
      src: (el as HTMLElement).getAttribute("src"),
      width: (el as HTMLElement).getAttribute("width"),
      height: (el as HTMLElement).getAttribute("height"),
    });
    return [
      { tag: "div[data-embed] iframe", getAttrs },
      // A bare <iframe>, e.g. pasted as raw HTML via the "HTML код" modal
      // rather than inserted through the embed-link flow.
      { tag: "iframe", getAttrs },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const width = Number(HTMLAttributes.width);
    const height = Number(HTMLAttributes.height);
    const aspectRatio = width > 0 && height > 0 ? `${width} / ${height}` : undefined;

    return [
      "div",
      {
        "data-embed": "",
        class: "embed-wrapper",
        style: aspectRatio ? `aspect-ratio: ${aspectRatio}` : undefined,
      },
      [
        "iframe",
        mergeAttributes(this.options.HTMLAttributes, {
          src: HTMLAttributes.src,
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: "true",
          loading: "lazy",
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setEmbed:
        (src: string, width = null, height = null) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { src, width, height } }),
    };
  },
});

export default Embed;
