"use client";
import { ConnectionState, ParticipantsType } from "@/types/ChatType";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, X } from "lucide-react";
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
import { useSendMessageMutation } from "@/hooks/queries/useSendMessageMutation";
import { SimpleAttachmentPreview } from "./simple-attachment-preview";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxType";
import { setReplyMessage } from "@/lib/redux/slices/chat-slice";

export interface MessageInputProps {
  participants: Array<ParticipantsType>;
}

export default function MessageInput({ participants }: MessageInputProps) {
  const [message, setMessage] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isAttaching, setIsAttaching] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentChat: chat, connectionState } = useAppSelector(
    (state) => state.chat,
  );
  const disabled = connectionState !== ConnectionState.CONNECTED;
  const { mutate: handleSendMessage } = useSendMessageMutation();
  const currentUserId = useAppSelector((state) => state.user.user?.id);
  const { replyMessage } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();

  const { handleLocalUserTyping } = useTypingIndicator({
    chatId: chat?._id || "",
    currentUserId: currentUserId!,
  });

  const token = useAppSelector((state) => state.user.token);

  useEffect(() => {
    if (replyMessage && textareaRef.current) {
      textareaRef.current.focus();
    } else {
      setMessage("");
    }
  }, [replyMessage]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!chat) return;
      if (!message.trim() && !attachments.length) return;
      handleSendMessage({
        chatId: chat._id,
        content: message,
        attachments,
        replyToId: replyMessage?._id,
        token: token!,
      });
      setMessage("");
      setMessage("");
      setAttachments([]);
      dispatch(setReplyMessage(null));
    },
    [message, attachments, handleSendMessage, dispatch, replyMessage, chat, token],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      } else if (e.key === "Escape" && replyMessage) {
        dispatch(setReplyMessage(null));
      }
    },
    [handleSubmit, replyMessage, dispatch],
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

  const replyToUser = replyMessage
    ? participants.find((user) => user.userId === replyMessage.sender.userId)
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
        {replyMessage && (
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
                {replyMessage.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(setReplyMessage(null))}
            >
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
            name="message"
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "Connection lost. Reconnecting..."
                : replyMessage
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
