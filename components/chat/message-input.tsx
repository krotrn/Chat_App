"use client";
import { mockUsers } from "@/lib/mock-data";
import { Message } from "@/types/ChatType";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Paperclip, Send, X } from "lucide-react";
import AttachmentPreview from "./attachment-previews";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import FileUploader from "./file-uploader";
import { Textarea } from "../ui/textarea";
import EmojiPicker from "./emoji-picker";
import CameraCapture from "./camera-capture";

interface MessageInputProps {
  onSendMessage: (
    content: string,
    attachments?: File[],
    replyToId?: string
  ) => void;
  replyToMessage: Message | null;
  onCancelReply: () => void;
}

export default function MessageInput({
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
      setMessage(replyToMessage.content);
    } else {
      setMessage("");
    }
  }, [replyToMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() && !attachments.length) return;
    onSendMessage(message, attachments, replyToMessage?.id);
    setMessage("");
    setAttachments([]);
    onCancelReply();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === "Escape" && replyToMessage) {
      onCancelReply();
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
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
  };

  const handleFileSelect = (file: File[]) => {
    setAttachments((prev) => [...prev, ...file]);
    setIsAttaching(false);
  };

  const handleCameraCapture = (file: File) => {
    setAttachments((prev) => [...prev, file]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const replyToUser = replyToMessage
    ? mockUsers.find((user) => user.id === replyToMessage.senderId)
    : null;

  return (
    <div className="border-t p-4">
      <AnimatePresence>
        {replyToMessage ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{opacity:1, height:0}}
            exit={{opacity:0, height:0}}
          >
            <Button
              
            >
              <X />
            </Button>
            <p>Replying to {replyToUser?.name}</p>
            <p>{replyToMessage.content}</p>
          </motion.div>
        ) : (
          <></>
        )}
        {attachments.length > 0 ? (
          <motion.div>
            {attachments.map((file, index) => (
              <AttachmentPreview
                key={file.name}
                file={file}
                onRemove={() => removeAttachment(index)}
              />
            ))}
          </motion.div>
        ) : (
          <></>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <Popover open={isAttaching} onOpenChange={setIsAttaching}>
          <PopoverTrigger asChild>
            <Button>
              <Paperclip />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <FileUploader onFileSelect={handleFileSelect} />
          </PopoverContent>
        </Popover>

        <div>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              replyToMessage ? "Type your reply..." : "Type a message..."
            }
          />
        </div>

        <div>
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
