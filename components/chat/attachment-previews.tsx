"use client";
import { File as FileIcon, FileText, Film, ImageIcon, Music, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import Image from "next/image";
import { cn } from "@/lib/utils";
interface AttachmentPreviewProps {
  file: File | { url: string; type: string; name: string }
  onRemove?: () => void
  className?: string
}

export default function AttachmentPreview({
  file,
  onRemove,
  className,
}: AttachmentPreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const isFile = file instanceof File;
  const url = isFile ? URL.createObjectURL(file) : file.url;
  const type = isFile ? file.type : file.type;
  const name = isFile ? file.name : file.name;
  const getIcon = () => {
    if (type.startsWith("image/")) return <ImageIcon className="h-6 w-6" />;
    if (type.startsWith("video/")) return <Film className="h-6 w-6" />;
    if (type.startsWith("audio/")) return <Music className="h-6 w-6" />;
    if (type.startsWith("text/")) return <FileText className="h-6 w-6" />;
    return <FileIcon className="h-6 w-6" />;
  };

  const handleClick = () => {
    if (type.startsWith("image/")) {
      setPreviewOpen(true);
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center gap-2 rounded-md border p-2 hover:bg-muted/50", className
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
          {getIcon()}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium">{name}</p>
          {isFile && (
            <p className="text-xs text-muted-foreground">
              {(file as File).size > 1024 * 1024
                ? `${((file as File).size / (1024 * 1024)).toFixed(2)} MB`
                : `${((file as File).size / 1024).toFixed(2)} KB`}
            </p>
          )}
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
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <button
          className="absolute inset-0"
          onClick={handleClick}
          type="button"
        />
      </div>
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent className="max-w-3xl">
          <SheetHeader>
            <SheetTitle>{name}</SheetTitle>
          </SheetHeader>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={url || "/placeholder.svg"}
              alt={name}
              fill
              className="object-contain"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
