"use client";

import { Button, Textarea } from "@/components/ui";

interface MessageEditorProps {
  editContent: string;
  setEditContent: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function MessageEditor({
  editContent,
  setEditContent,
  onSave,
  onCancel,
}: MessageEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="w-full min-h-[60px] text-sm p-2 rounded border"
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          className="text-xs px-2 py-1 rounded"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          className="text-xs px-2 py-1 rounded "
          onClick={onSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
