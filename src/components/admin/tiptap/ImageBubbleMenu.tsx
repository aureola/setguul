"use client";

import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReplaceIcon } from "../ui/editor-icons";
import { TrashIcon } from "../ui/icons";
import { ToolbarButton } from "./ToolbarButton";

export default function ImageBubbleMenu({ editor }: { editor: Editor }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [alt, setAlt] = useState("");

  useEffect(() => {
    const sync = () => {
      if (editor.isActive("image")) {
        setAlt((editor.getAttributes("image").alt as string | null) ?? "");
      }
    };
    sync();
    editor.on("selectionUpdate", sync);
    editor.on("transaction", sync);
    return () => {
      editor.off("selectionUpdate", sync);
      editor.off("transaction", sync);
    };
  }, [editor]);

  const applyAlt = useCallback(
    (value: string) => {
      setAlt(value);
      editor.chain().updateAttributes("image", { alt: value }).run();
    },
    [editor],
  );

  const replaceImage = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          editor.chain().focus().updateAttributes("image", { src: data.url }).run();
        }
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="imageBubbleMenu"
      shouldShow={({ editor }) => editor.isActive("image")}
      options={{ placement: "top", offset: 8 }}
    >
      <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1 shadow-xl">
        <input
          value={alt}
          onChange={(e) => applyAlt(e.target.value)}
          placeholder="Alt текст"
          className="w-32 rounded-md border border-border bg-background/40 px-2 py-1 text-xs outline-none focus:border-accent"
        />
        <ToolbarButton label="Солих" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <ReplaceIcon />
        </ToolbarButton>
        <ToolbarButton label="Устгах" onClick={() => editor.chain().focus().deleteSelection().run()}>
          <TrashIcon />
        </ToolbarButton>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) replaceImage(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </div>
    </BubbleMenu>
  );
}
