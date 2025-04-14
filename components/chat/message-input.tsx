"use client";
import { MessageType, ParticipantsType } from "@/types/ChatType";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, X } from "lucide-react";
import AttachmentPreview from "@/components/chat/attachment-previews";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FileUploader from "@/components/chat/file-uploader";
import { Textarea } from "@/components/ui/textarea";
import EmojiPicker from "@/components/chat/emoji-picker";
import CameraCapture from "@/components/chat/camera-capture";

interface MessageInputProps {
  participants: ParticipantsType[];
  onSendMessage: (
    content: string,
    attachments?: File[],
    replyToId?: string
  ) => void;
  replyToMessage: MessageType | null;
  onCancelReply: () => void;
}

export default function MessageInput({
  participants,
  onSendMessage,
  replyToMessage,
  onCancelReply,
}: MessageInputProps) {
  const [message, setMessage] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isAttaching, setIsAttaching] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      onCancelReply();
    },
    [message, attachments, replyToMessage, onSendMessage, onCancelReply]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      } else if (e.key === "Escape" && replyToMessage) {
        onCancelReply();
      }
    },
    [handleSubmit, replyToMessage, onCancelReply]
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
    [message]
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

  const replyToUser = replyToMessage
    ? participants.find((user) => user.userId === replyToMessage.sender.userId)
    : null;

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
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 grid gap-2"
          >
            {attachments.map((file, index) => (
              <AttachmentPreview
                key={file.name}
                file={file}
                onRemove={() => removeAttachment(index)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Popover open={isAttaching} onOpenChange={setIsAttaching}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
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
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              replyToMessage ? "Type your reply..." : "Type a message..."
            }
            className="min-h-10 resize-none"
            rows={1}
          />
        </div>
        <div className="flex items-center gap-1">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          <CameraCapture onCapture={handleCameraCapture} />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9"
            disabled={!message.trim() && attachments.length === 0}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
