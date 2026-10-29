"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useCallback, useRef, useState } from "react";

const HANDLES = [
  { key: "nw", className: "-left-1.5 -top-1.5", cursor: "cursor-nwse-resize" },
  { key: "n", className: "left-1/2 -top-1.5 -translate-x-1/2", cursor: "cursor-ns-resize" },
  { key: "ne", className: "-right-1.5 -top-1.5", cursor: "cursor-nesw-resize" },
  { key: "e", className: "-right-1.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
  { key: "se", className: "-right-1.5 -bottom-1.5", cursor: "cursor-nwse-resize" },
  { key: "s", className: "left-1/2 -bottom-1.5 -translate-x-1/2", cursor: "cursor-ns-resize" },
  { key: "sw", className: "-left-1.5 -bottom-1.5", cursor: "cursor-nesw-resize" },
  { key: "w", className: "-left-1.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
] as const;

const MIN_WIDTH = 60;

export default function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [resizing, setResizing] = useState(false);
  const [liveWidth, setLiveWidth] = useState(0);

  const startResize = useCallback(
    (handleKey: string, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const startWidth = rect.width;
      const aspectRatio = rect.width / rect.height;
      const startX = e.clientX;
      const startY = e.clientY;
      const hDir = handleKey.includes("e") ? 1 : handleKey.includes("w") ? -1 : 0;
      const vDir = handleKey.includes("s") ? 1 : handleKey.includes("n") ? -1 : 0;
      setResizing(true);

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const delta = hDir !== 0 ? dx * hDir : vDir !== 0 ? dy * vDir * aspectRatio : 0;
        const newWidth = Math.max(MIN_WIDTH, Math.round(startWidth + delta));
        setLiveWidth(newWidth);
        updateAttributes({ width: newWidth });
      };
      const onUp = () => {
        setResizing(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [updateAttributes],
  );

  return (
    <NodeViewWrapper
      as="span"
      ref={wrapperRef}
      className="relative inline-block max-w-full align-top"
      style={{ width: node.attrs.width ? `${node.attrs.width}px` : undefined }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ProseMirror NodeView needs a plain DOM img */}
      <img
        src={node.attrs.src}
        alt={node.attrs.alt ?? ""}
        title={node.attrs.title ?? undefined}
        loading="lazy"
        draggable={false}
        className={`block h-auto w-full rounded-lg ${selected ? "outline outline-2 outline-dashed outline-accent outline-offset-2" : ""}`}
      />
      {selected &&
        HANDLES.map((h) => (
          <span
            key={h.key}
            onPointerDown={(e) => startResize(h.key, e)}
            className={`absolute h-3 w-3 rounded-full border-2 border-accent bg-white ${h.className} ${h.cursor}`}
          />
        ))}
      {resizing && (
        <span className="pointer-events-none absolute -bottom-6 right-0 rounded bg-surface px-1.5 py-0.5 text-xs text-muted">
          {liveWidth}px
        </span>
      )}
    </NodeViewWrapper>
  );
}
