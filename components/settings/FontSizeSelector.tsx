"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Type } from "lucide-react";
import { FontSize } from "../ThemeProvider";

interface FontSizeSelectorProps {
  value: FontSize;
  onValueChange: (value: FontSize) => void;
}

export function FontSizeSelector({
  value,
  onValueChange,
}: FontSizeSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor="font-size" className="text-base">
          Font Size
        </Label>
        <span className="text-sm text-muted-foreground">
          Adjust text size for better readability
        </span>
      </div>
      <RadioGroup
        id="font-size"
        value={value}
        onValueChange={onValueChange}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3"
      >
        {["small", "medium", "large"].map((size) => (
          <div key={size}>
            <RadioGroupItem
              value={size}
              id={`font-${size}`}
              className="sr-only"
            />
            <Label
              htmlFor={`font-${size}`}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <Type
                className={`mb-2 h-${
                  size === "small" ? 5 : size === "medium" ? 6 : 7
                } w-${size === "small" ? 5 : size === "medium" ? 6 : 7}`}
              />
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
