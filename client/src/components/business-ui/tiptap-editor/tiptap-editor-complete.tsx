'use client';

import { AttachmentToolbarButton } from '@/components/business-ui/tiptap-editor/components/attachment-toolbar-button';
import { BlockquoteToolbarButton } from '@/components/business-ui/tiptap-editor/components/blockquote-toolbar-button';
import { CodeBlockToolbarButton } from '@/components/business-ui/tiptap-editor/components/code-block-toolbar-button';
import { ColorHighlightToolbarButton } from '@/components/business-ui/tiptap-editor/components/color-highlight-toolbar-button';
import { HeadingToolbarButton } from '@/components/business-ui/tiptap-editor/components/heading-toolbar-button';
import { HorizontalRuleToolbarButton } from '@/components/business-ui/tiptap-editor/components/horizontal-rule-toolbar-button';
import { ImageUploadToolbarButton } from '@/components/business-ui/tiptap-editor/components/image-upload-toolbar-button';
import { LinkToolbarButton } from '@/components/business-ui/tiptap-editor/components/link-toolbar-button';
import { ListToolbarButton } from '@/components/business-ui/tiptap-editor/components/list-toolbar-button';
import { MarkToolbarButton } from '@/components/business-ui/tiptap-editor/components/mark-toolbar-button';
import { TextAlignToolbarButton } from '@/components/business-ui/tiptap-editor/components/text-align-toolbar-button';
import { UndoRedoToolbarButton } from '@/components/business-ui/tiptap-editor/components/undo-redo-toolbar-button';
import { CompleteKit } from '@/components/business-ui/tiptap-editor/extensions/complete-kit';
import {
  TiptapEditor,
  TiptapEditorContent,
  TiptapEditorToolbar,
  TiptapEditorToolbarSeparator,
  type TiptapEditorProps,
} from '@/components/business-ui/tiptap-editor/tiptap-editor';
import { cn } from '@/lib/utils';

export interface TiptapEditorCompleteProps extends Omit<
  TiptapEditorProps,
  'extensions'
> {
  /** 佔位符文字 */
  placeholder?: string;
}

/**
 * 一個完整、開箱即用的富文字編輯器元件，包含預配置的工具欄。
 * 這是大多數使用場景下的推薦元件。
 *
 * 功能特性：
 * - 預配置的工具欄，包含常用的格式化選項
 * - 已內建完整樣式，包括邊框、焦點態等，你無需在此編輯器外包裹 div 實現樣式
 * - 支援撤銷/重做
 * - 標題樣式 (H1-H6)
 * - 文字對齊
 * - 列表 (無序、有序、任務)
 * - 文字格式化 (加粗、斜體、下劃線、刪除線、程式碼)
 *
 * @example
 * ```tsx
 * <TiptapEditorComplete
 *   value={value}
 *   onValueChange={setValue}
 *   placeholder="在此輸入訊息..."
 *   aria-invalid={invalid}
 *   aria-disabled={disabled}
 * />
 * ```
 */
export function TiptapEditorComplete({
  className,
  placeholder,
  ...props
}: TiptapEditorCompleteProps) {
  const extensions = [CompleteKit.configure({ placeholder: { placeholder } })];

  return (
    <TiptapEditor
      className={cn('max-h-140 min-h-80', className)}
      extensions={extensions}
      {...props}
    >
      <DefaultToolbar />
      <TiptapEditorContent />
    </TiptapEditor>
  );
}

function DefaultToolbar() {
  return (
    <TiptapEditorToolbar>
      {/* 撤銷/重做 */}
      <UndoRedoToolbarButton action="undo" />
      <UndoRedoToolbarButton action="redo" />
      <TiptapEditorToolbarSeparator />

      {/* 標題/正文 */}
      <HeadingToolbarButton />
      <TiptapEditorToolbarSeparator />

      {/* 文字對齊 & 列表 */}
      <TextAlignToolbarButton />
      <ListToolbarButton />
      <TiptapEditorToolbarSeparator />

      {/* 文字格式化: 加粗、刪除線、斜體、下劃線、顏色 */}
      <MarkToolbarButton format="bold" />
      <MarkToolbarButton format="strike" />
      <MarkToolbarButton format="italic" />
      <MarkToolbarButton format="underline" />
      <ColorHighlightToolbarButton />
      <TiptapEditorToolbarSeparator />

      {/* 塊級元素: 引用、分割線、程式碼塊 */}
      <BlockquoteToolbarButton />
      <HorizontalRuleToolbarButton />
      <CodeBlockToolbarButton />

      {/* 連結 & 媒體: 圖片、附件 */}
      <LinkToolbarButton />
      <ImageUploadToolbarButton />
      <AttachmentToolbarButton />
    </TiptapEditorToolbar>
  );
}
