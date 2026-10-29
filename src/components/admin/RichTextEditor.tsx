"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { getMarkRange } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import ResizableImage from "./tiptap/resizable-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { useCallback, useRef, useState } from "react";
import MediaLibraryModal from "./MediaLibraryModal";
import EmbedModal from "./EmbedModal";
import HtmlCodeModal from "./HtmlCodeModal";
import LinkModal, { type LinkModalResult } from "./LinkModal";
import TableGridPicker from "./TableGridPicker";
import ColorSplitButton from "./tiptap/ColorSplitButton";
import Embed from "./tiptap/embed-extension";
import { ToolbarButton, ToolbarGroup, ToolbarSeparator } from "./tiptap/ToolbarButton";
import ImageBubbleMenu from "./tiptap/ImageBubbleMenu";
import TableBubbleMenu from "./tiptap/TableBubbleMenu";
import { extractAllImageSrcs } from "@/lib/content-image";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikeIcon,
  BulletListIcon,
  OrderedListIcon,
  QuoteIcon,
  LinkIcon,
  ImageIcon,
  LibraryIcon,
  TableIcon,
  EmbedIcon,
  CodeIcon,
  UndoIcon,
  RedoIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  TextColorIcon,
  HighlightIcon,
  HorizontalRuleIcon,
  ClearFormatIcon,
} from "./ui/editor-icons";

function Toolbar({ editor }: { editor: Editor }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [gridPickerOpen, setGridPickerOpen] = useState(false);
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [lastTextColor, setLastTextColor] = useState("#ef4444");
  const [lastHighlightColor, setLastHighlightColor] = useState("#f2c21c");
  const [linkModal, setLinkModal] = useState<{
    range: { from: number; to: number };
    url: string;
    text: string;
    openInNewTab: boolean;
    hasExistingLink: boolean;
  } | null>(null);

  const insertImages = useCallback(
    (urls: string[]) => {
      if (urls.length === 0) return;
      // If the current selection is a NodeSelection (e.g. right after a
      // previously inserted image), inserting at it would replace that node
      // instead of adding after it — so insert after the selection instead.
      const { selection } = editor.state;
      const insertPos = selection instanceof NodeSelection ? selection.to : selection.from;
      editor
        .chain()
        .focus()
        .insertContentAt(insertPos, urls.map((src) => ({ type: "image", attrs: { src } })))
        .run();
    },
    [editor],
  );

  const handleImageFiles = useCallback(
    async (fileList: FileList) => {
      setUploading(true);
      try {
        const uploaded: string[] = [];
        for (const file of Array.from(fileList)) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            uploaded.push(data.url);
          }
        }
        if (uploaded.length > 0) insertImages(uploaded);
      } finally {
        setUploading(false);
      }
    },
    [insertImages],
  );

  // If the current selection is a NodeSelection (e.g. an image that was just
  // clicked or resized), inserting block content "at" it would replace that
  // node instead of adding after it — so resolve a safe text-selection
  // position after it first.
  const focusPastNodeSelection = useCallback(() => {
    const { selection } = editor.state;
    if (selection instanceof NodeSelection) {
      editor.chain().focus(selection.to).run();
    }
  }, [editor]);

  const openLinkModal = useCallback(() => {
    const { state } = editor;
    const { $from, from, to, empty } = state.selection;
    const linkMark = state.schema.marks.link;
    const hasExistingLink = editor.isActive("link");
    let rangeFrom = from;
    let rangeTo = to;
    if (empty && hasExistingLink) {
      const range = getMarkRange($from, linkMark);
      if (range) {
        rangeFrom = range.from;
        rangeTo = range.to;
      }
    }
    const attrs = editor.getAttributes("link");
    setLinkModal({
      range: { from: rangeFrom, to: rangeTo },
      url: (attrs.href as string) ?? "",
      text: state.doc.textBetween(rangeFrom, rangeTo, " "),
      openInNewTab: hasExistingLink ? attrs.target === "_blank" : true,
      hasExistingLink,
    });
  }, [editor]);

  const applyLink = useCallback(
    ({ url, text, openInNewTab }: LinkModalResult) => {
      if (!linkModal) return;
      const { from, to } = linkModal.range;
      const linkText = text || url;
      const mark = {
        type: "link",
        attrs: {
          href: url,
          target: openInNewTab ? "_blank" : null,
          rel: openInNewTab ? "noopener noreferrer" : null,
        },
      };
      editor
        .chain()
        .focus()
        .insertContentAt({ from, to }, [{ type: "text", text: linkText, marks: [mark] }])
        .run();
      setLinkModal(null);
    },
    [editor, linkModal],
  );

  const removeLink = useCallback(() => {
    if (!linkModal) return;
    editor.chain().focus().setTextSelection(linkModal.range).extendMarkRange("link").unsetLink().run();
    setLinkModal(null);
  }, [editor, linkModal]);

  const insertEmbed = useCallback(
    (src: string) => {
      focusPastNodeSelection();
      editor.chain().focus().setEmbed(src).run();
      setEmbedModalOpen(false);
    },
    [editor, focusPastNodeSelection],
  );

  const insertTable = useCallback(
    (rows: number, cols: number) => {
      focusPastNodeSelection();
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    },
    [editor, focusPastNodeSelection],
  );

  const applyCaseTransform = useCallback(
    (transform: (text: string) => string) => {
      const { from, to, empty } = editor.state.selection;
      if (empty) return;
      const text = editor.state.doc.textBetween(from, to, "\n");
      const marks = editor.state.doc.resolve(from).marks();
      editor
        .chain()
        .focus()
        .insertContentAt({ from, to }, [
          {
            type: "text",
            text: transform(text),
            marks: marks.map((mark) => ({ type: mark.type.name, attrs: mark.attrs })),
          },
        ])
        .run();
    },
    [editor],
  );

  const clearFormatting = useCallback(() => {
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-t-xl border border-b-0 border-border bg-background px-2.5 py-2">
      <ToolbarGroup>
        <ToolbarButton label="Тод" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton label="Налуу" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Доогуур зураас"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Дундуур зураас"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikeIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          label="Зүүн тийш"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeftIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Төвд"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenterIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Баруун тийш"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRightIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Тэгшлэх"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustifyIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <div className="relative">
          <ToolbarButton
            label="Хүснэгт нэмэх"
            active={editor.isActive("table")}
            onClick={() => setGridPickerOpen((v) => !v)}
          >
            <TableIcon />
          </ToolbarButton>
          {gridPickerOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setGridPickerOpen(false)} />
              <TableGridPicker onClose={() => setGridPickerOpen(false)} onPick={insertTable} />
            </>
          )}
        </div>
        <ToolbarButton
          label="Жагсаалт"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <BulletListIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Дугаарласан жагсаалт"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <OrderedListIcon />
        </ToolbarButton>
        <ToolbarButton label="Хэвтээ зураас" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <HorizontalRuleIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Ишлэл"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <QuoteIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Холбоос" active={editor.isActive("link")} onClick={openLinkModal}>
          <LinkIcon />
        </ToolbarButton>
        <ToolbarButton label="Зураг оруулах" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <ImageIcon />
        </ToolbarButton>
        <ToolbarButton label="Файлын сангаас сонгох" onClick={() => setLibraryOpen(true)}>
          <LibraryIcon />
        </ToolbarButton>
      </ToolbarGroup>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleImageFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <ToolbarGroup>
        <ToolbarButton
          label="Гарчиг 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Гарчиг 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          label="Гарчиг 4"
          active={editor.isActive("heading", { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        >
          H4
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          label="Том үсэг"
          onClick={() => applyCaseTransform((t) => t.toLocaleUpperCase())}
        >
          AA
        </ToolbarButton>
        <ToolbarButton
          label="Жижиг үсэг"
          onClick={() => applyCaseTransform((t) => t.toLocaleLowerCase())}
        >
          aa
        </ToolbarButton>
        <ToolbarButton
          label="Үг бүрийг томоор эхлэх"
          onClick={() =>
            applyCaseTransform((t) =>
              t.replace(/\p{L}+/gu, (word) => word[0].toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()),
            )
          }
        >
          Aa
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ColorSplitButton
          label="Текстийн өнгө"
          icon={<TextColorIcon className="h-3.5 w-3.5" />}
          color={lastTextColor}
          onPick={(color) => {
            setLastTextColor(color);
            editor.chain().focus().setColor(color).run();
          }}
          onClear={() => editor.chain().focus().unsetColor().run()}
        />
        <ColorSplitButton
          label="Тодруулах"
          icon={<HighlightIcon className="h-3.5 w-3.5" />}
          color={lastHighlightColor}
          active={editor.isActive("highlight")}
          onPick={(color) => {
            setLastHighlightColor(color);
            editor.chain().focus().setHighlight({ color }).run();
          }}
          onClear={() => editor.chain().focus().unsetHighlight().run()}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton
          label="Дээд индекс"
          active={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          X²
        </ToolbarButton>
        <ToolbarButton
          label="Доод индекс"
          active={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          X₂
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Embed код оруулах" onClick={() => setEmbedModalOpen(true)}>
          <EmbedIcon />
        </ToolbarButton>
        <ToolbarButton label="HTML Code" onClick={() => setHtmlModalOpen(true)}>
          <CodeIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ToolbarButton label="Буцаах" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <UndoIcon />
        </ToolbarButton>
        <ToolbarButton label="Сэргээх" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <RedoIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Формат арилгах" onClick={clearFormatting}>
          <ClearFormatIcon />
        </ToolbarButton>
      </ToolbarGroup>

      {uploading && <span className="ml-1 text-xs text-muted">Зураг хуулж байна...</span>}

      {libraryOpen && (
        <MediaLibraryModal
          initialFiles={extractAllImageSrcs(editor.getHTML())}
          onClose={() => setLibraryOpen(false)}
          onInsert={(urls) => {
            insertImages(urls);
            setLibraryOpen(false);
          }}
        />
      )}

      {embedModalOpen && <EmbedModal onClose={() => setEmbedModalOpen(false)} onInsert={insertEmbed} />}

      {htmlModalOpen && (
        <HtmlCodeModal
          initialHtml={editor.getHTML()}
          onClose={() => setHtmlModalOpen(false)}
          onApply={(html) => {
            editor.commands.setContent(html);
            setHtmlModalOpen(false);
          }}
        />
      )}

      {linkModal && (
        <LinkModal
          initialUrl={linkModal.url}
          initialText={linkModal.text}
          initialOpenInNewTab={linkModal.openInNewTab}
          showRemove={linkModal.hasExistingLink}
          onClose={() => setLinkModal(null)}
          onInsert={applyLink}
          onRemove={removeLink}
        />
      )}
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Superscript,
      Subscript,
      ResizableImage.configure({ HTMLAttributes: { loading: "lazy" } }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Embed,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[280px] px-3 py-2.5 outline-none prose-headings:uppercase prose-a:text-accent",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <ImageBubbleMenu editor={editor} />
      <TableBubbleMenu editor={editor} />
    </div>
  );
}
