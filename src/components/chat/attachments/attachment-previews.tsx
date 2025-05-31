"use client";

import { useState, useCallback } from "react";
import {
  File as FileIcon,
  FileText,
  Film,
  ImageIcon,
  Music,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AttachmentResponse } from "@/types/ChatType";
import {
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileVideo,
} from "lucide-react";
import { FaFilePdf } from "react-icons/fa";

interface AttachmentPreviewProps {
  file: File | AttachmentResponse;
  onRemove?: () => void;
  className?: string;
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

  const getIcon = useCallback(() => {
    if (type.startsWith("image/")) return <ImageIcon className="h-6 w-6" />;
    if (type.startsWith("video/")) return <Film className="h-6 w-6" />;
    if (type.startsWith("audio/")) return <Music className="h-6 w-6" />;
    if (type.startsWith("text/")) return <FileText className="h-6 w-6" />;
    return <FileIcon className="h-6 w-6" />;
  }, [type]);

  const handleClick = useCallback(() => {
    if (type.startsWith("image/")) {
      setPreviewOpen(true);
    } else {
      window.open(url, "_blank");
    }
  }, [type, url]);

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center gap-2 rounded-md border p-2 hover:bg-muted/50",
          className,
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
            aria-label={`Remove ${name}`}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <button
          className="absolute inset-0"
          onClick={handleClick}
          type="button"
          aria-label={`Preview ${name}`}
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

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return FileVideo;
  if (type.startsWith("audio/")) return FileAudio;
  if (type.includes("pdf")) return FaFilePdf;
  if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    type.includes("csv")
  )
    return FileSpreadsheet;
  if (
    type.includes("archive") ||
    type.includes("zip") ||
    type.includes("tar") ||
    type.includes("rar")
  )
    return FileArchive;
  if (type.includes("text") || type.includes("doc") || type.includes("word"))
    return FileText;
  return FileIcon;
};

interface FilePreviewProps {
  file: AttachmentResponse;
  className?: string;
}

function FilePreview({ file, className }: FilePreviewProps) {
  const isImage = file.type.startsWith("image/");
  const FileIcon = getFileIcon(file.type);

  return (
    <div className={cn("rounded-md overflow-hidden p-2", className)}>
      {isImage ? (
        <Image
          src={file.url}
          alt={file.name}
          width={300}
          height={200}
          className="w-full h-auto rounded object-cover"
        />
      ) : (
        <div className="flex items-center gap-2 p-2">
          <FileIcon className="h-6 w-6" />
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{file.type}</p>
          </div>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline text-muted-foreground"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}

interface AttachmentPreviewsProps {
  attachments: AttachmentResponse[];
  isOwn: boolean;
}

export function AttachmentPreviews({
  attachments,
  isOwn,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "grid gap-2",
        isOwn ? "justify-items-end" : "justify-items-start",
      )}
    >
      {attachments.map((attachment, index) => (
        <FilePreview
          key={index}
          file={attachment}
          className={cn(isOwn ? "bg-primary/10" : "bg-muted/50", "max-w-full")}
        />
      ))}
    </div>
  );
}
