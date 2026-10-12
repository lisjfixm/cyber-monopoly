'use client';

import * as React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import { useTiptapEditor } from '@/components/business-ui/tiptap-editor/hooks/use-tiptap-editor';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ImageUploadToolbarButton() {
  const { editor } = useTiptapEditor();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ok = editor.chain().focus().insertImages([file]).run();
    if (!ok) {
      toast.error('插入圖片失敗（請確認圖片擴充套件已啟用且提供 upload）');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={700}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="size-6 px-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="size-4" />
            <span className="sr-only">上傳圖片</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>上傳圖片</p>
        </TooltipContent>
      </Tooltip>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </TooltipProvider>
  );
}
