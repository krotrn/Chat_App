import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  File as FileIcon,
  FileText,
  Film,
  ImageIcon,
  Music,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SimpleAttachmentPreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const url = URL.createObjectURL(file);

  const getIcon = () => {
    if (file.type.startsWith("image/"))
      return <ImageIcon className="h-6 w-6" />;
    if (file.type.startsWith("video/")) return <Film className="h-6 w-6" />;
    if (file.type.startsWith("audio/")) return <Music className="h-6 w-6" />;
    if (file.type.startsWith("text/")) return <FileText className="h-6 w-6" />;
    return <FileIcon className="h-6 w-6" />;
  };

  const handleClick = () => {
    if (file.type.startsWith("image/")) {
      setPreviewOpen(true);
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogTrigger asChild>
          <div
            className="group relative flex items-center gap-2 rounded-md border p-2 hover:bg-muted/50"
            onClick={handleClick}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
              {getIcon()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {file.size > 1024 * 1024
                  ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                  : `${(file.size / 1024).toFixed(2)} KB`}
              </p>
            </div>
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{file.name}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={url || "/placeholder.svg"}
              alt={file.name}
              fill
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
