"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sun, Moon, Monitor } from "lucide-react";
import { Theme } from "../ThemeProvider";
import { config } from "@/config";

interface ThemeSelectorProps {
  value: Theme;
  onValueChange: (value: Theme) => void;
}

export function ThemeSelector({ value, onValueChange }: ThemeSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor="theme" className="text-base">
          Theme
        </Label>
        <span className="text-sm text-muted-foreground">
          Choose how {config.appName} looks
        </span>
      </div>
      <RadioGroup
        id="theme"
        value={value}
        onValueChange={onValueChange}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3"
      >
        {["light", "dark", "system"].map((themeOption) => (
          <div key={themeOption}>
            <RadioGroupItem
              value={themeOption}
              id={`theme-${themeOption}`}
              className="sr-only"
            />
            <Label
              htmlFor={`theme-${themeOption}`}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              {themeOption === "light" && <Sun className="mb-2 h-6 w-6" />}
              {themeOption === "dark" && <Moon className="mb-2 h-6 w-6" />}
              {themeOption === "system" && <Monitor className="mb-2 h-6 w-6" />}
              {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
