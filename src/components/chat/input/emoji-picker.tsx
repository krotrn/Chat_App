"use client";

import { useState, useEffect } from "react";
import { EmojiClickData, default as Picker, Theme } from "emoji-picker-react";

import { Smile } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
} from "@/components/ui";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: EmojiClickData) => void;
  disabled?: boolean;
}

export function EmojiPicker({
  onEmojiSelect,
  disabled = false,
}: EmojiPickerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Smile className="h-5 w-5" />
        <span className="sr-only">Pick emoji</span>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          disabled={disabled}
        >
          <Smile className="h-5 w-5" />
          <span className="sr-only">Pick emoji</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="w-full border-none bg-transparent shadow-none"
      >
        <Picker
          searchDisabled
          theme={Theme.AUTO}
          onEmojiClick={onEmojiSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
