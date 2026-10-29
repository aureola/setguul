"use client";

import { BubbleMenu } from "@tiptap/react/menus";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  InsertRowIcon,
  InsertColumnIcon,
  DeleteRowIcon,
  DeleteColumnIcon,
  HeaderRowIcon,
  HeaderColumnIcon,
  HeaderCellIcon,
  MergeCellsIcon,
  SplitCellsIcon,
} from "../ui/editor-icons";
import { TrashIcon } from "../ui/icons";
import { ToolbarButton, ToolbarSeparator } from "./ToolbarButton";

export default function TableBubbleMenu({ editor }: { editor: Editor }) {
  const { canMerge, canSplit, isHeaderCell } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      canMerge: editor.can().mergeCells(),
      canSplit: editor.can().splitCell(),
      isHeaderCell: editor.isActive("tableHeader"),
    }),
  });

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableBubbleMenu"
      shouldShow={({ editor }) => editor.isActive("table")}
      options={{ placement: "top", offset: 8 }}
    >
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-xl">
        <ToolbarButton label="Дээр мөр нэмэх" onClick={() => editor.chain().focus().addRowBefore().run()}>
          <InsertRowIcon />
        </ToolbarButton>
        <ToolbarButton label="Доор мөр нэмэх" onClick={() => editor.chain().focus().addRowAfter().run()}>
          <InsertRowIcon className="h-4 w-4 rotate-180" />
        </ToolbarButton>
        <ToolbarButton label="Мөр устгах" onClick={() => editor.chain().focus().deleteRow().run()}>
          <DeleteRowIcon />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton label="Зүүн багана нэмэх" onClick={() => editor.chain().focus().addColumnBefore().run()}>
          <InsertColumnIcon />
        </ToolbarButton>
        <ToolbarButton label="Баруун багана нэмэх" onClick={() => editor.chain().focus().addColumnAfter().run()}>
          <InsertColumnIcon className="h-4 w-4 rotate-180" />
        </ToolbarButton>
        <ToolbarButton label="Багана устгах" onClick={() => editor.chain().focus().deleteColumn().run()}>
          <DeleteColumnIcon />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton label="Нэгтгэх" disabled={!canMerge} onClick={() => editor.chain().focus().mergeCells().run()}>
          <MergeCellsIcon />
        </ToolbarButton>
        <ToolbarButton label="Салгах" disabled={!canSplit} onClick={() => editor.chain().focus().splitCell().run()}>
          <SplitCellsIcon />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton label="Толгой мөр" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
          <HeaderRowIcon />
        </ToolbarButton>
        <ToolbarButton label="Толгой багана" onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
          <HeaderColumnIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Толгой нүд"
          active={isHeaderCell}
          onClick={() => editor.chain().focus().toggleHeaderCell().run()}
        >
          <HeaderCellIcon />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton label="Хүснэгт устгах" onClick={() => editor.chain().focus().deleteTable().run()}>
          <TrashIcon />
        </ToolbarButton>
      </div>
    </BubbleMenu>
  );
}
