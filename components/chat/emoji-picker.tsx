"use client";

import { useState, useEffect } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: { native: string }) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
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
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Smile className="h-5 w-5" />
          <span className="sr-only">Pick emoji</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-full border-none bg-transparent shadow-none">
        <Picker data={data} onEmojiSelect={onEmojiSelect} theme="light" set="native" />
      </PopoverContent>
    </Popover>
  );
}