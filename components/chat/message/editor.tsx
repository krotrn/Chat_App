"use client";

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
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="w-full min-h-[60px] text-sm p-2 rounded bg-background border"
      />
      <div className="flex justify-end gap-2">
        <button
          className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/80"
          onClick={onSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
