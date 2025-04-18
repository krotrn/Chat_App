"use client";
import { MessageType, ParticipantsType } from "@/types/ChatType";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  Send,
  X,
  FileText,
  Film,
  ImageIcon,
  Music,
  File as FileIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FileUploader from "@/components/chat/file-uploader";
import { Textarea } from "@/components/ui/textarea";
import EmojiPicker from "@/components/chat/emoji-picker";
import CameraCapture from "@/components/chat/camera-capture";
import useTypingIndicator from "@/hooks/useTypingIndicator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";

function SimpleAttachmentPreview({
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
      <div className="group relative flex items-center gap-2 rounded-md border p-2 hover:bg-muted/50">
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
        <button
          className="absolute inset-0"
          onClick={handleClick}
          type="button"
          aria-label={`Preview ${file.name}`}
        />
      </div>
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent className="max-w-3xl">
          <SheetHeader>
            <SheetTitle>{file.name}</SheetTitle>
          </SheetHeader>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={url || "/placeholder.svg"}
              alt={file.name}
              fill
              className="object-contain"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export interface MessageInputProps {
  participants: Array<ParticipantsType>;
  onSendMessage: (
    message: string,
    attachments?: File[],
    replyToId?: string,
  ) => void;
  replyToMessage?: MessageType;
  onCancelReply?: () => void;
  disabled?: boolean;
  chatId: string;
  currentUserId: string;
}

export default function MessageInput({
  participants,
  onSendMessage,
  replyToMessage,
  onCancelReply,
  disabled = false,
  chatId,
  currentUserId,
}: MessageInputProps) {
  const [message, setMessage] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isAttaching, setIsAttaching] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { handleLocalUserTyping } = useTypingIndicator({
    chatId,
    currentUserId,
  });

  useEffect(() => {
    if (replyToMessage && textareaRef.current) {
      textareaRef.current.focus();
    } else {
      setMessage("");
    }
  }, [replyToMessage]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!message.trim() && !attachments.length) return;
      onSendMessage(message, attachments, replyToMessage?._id);
      setMessage("");
      setAttachments([]);
      onCancelReply?.();
    },
    [message, attachments, onSendMessage, onCancelReply, replyToMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      } else if (e.key === "Escape" && replyToMessage) {
        onCancelReply?.();
      }
    },
    [handleSubmit, replyToMessage, onCancelReply],
  );

  const handleEmojiSelect = useCallback(
    (emoji: { native: string }) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage =
        message.slice(0, start) + emoji.native + message.slice(end);
      setMessage(newMessage);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + emoji.native.length;
        textarea.focus();
      }, 0);
    },
    [message],
  );

  const handleFileSelect = useCallback((files: File[]) => {
    setAttachments((prev) => [...prev, ...files]);
    setIsAttaching(false);
  }, []);

  const handleCameraCapture = useCallback((file: File) => {
    setAttachments((prev) => [...prev, file]);
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      handleLocalUserTyping();
    },
    [handleLocalUserTyping],
  );

  const replyToUser = replyToMessage
    ? participants.find((user) => user.userId === replyToMessage.sender.userId)
    : null;

  const attachmentPreview =
    attachments.length > 0 ? (
      <div className="mb-4 grid gap-2">
        {attachments.map((file, index) => (
          <SimpleAttachmentPreview
            key={file.name}
            file={file}
            onRemove={() => removeAttachment(index)}
          />
        ))}
      </div>
    ) : null;

  return (
    <div className="bottom-0 border-t p-4">
      <AnimatePresence>
        {replyToMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex items-center justify-between bg-muted p-2 rounded"
          >
            <div>
              <p className="text-xs font-medium">
                Replying to {replyToUser?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {replyToMessage.content}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancelReply}>
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
        {attachmentPreview}
      </AnimatePresence>
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Popover open={isAttaching} onOpenChange={setIsAttaching}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              disabled={disabled}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-96">
            <FileUploader onFileSelect={handleFileSelect} />
          </PopoverContent>
        </Popover>
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "Connection lost. Reconnecting..."
                : replyToMessage
                  ? "Type your reply..."
                  : "Type a message..."
            }
            className="min-h-10 resize-none"
            rows={1}
            disabled={disabled}
          />
        </div>
        <div className="flex items-center gap-1">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} disabled={disabled} />
          <CameraCapture onCapture={handleCameraCapture} disabled={disabled} />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9"
            disabled={disabled || (!message.trim() && attachments.length === 0)}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
