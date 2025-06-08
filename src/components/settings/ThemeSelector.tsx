"use client";

import { Label, RadioGroup, RadioGroupItem } from "@/components/ui";
import { Sun, Moon, Monitor } from "lucide-react";
import { config } from "@/config";
import { cn } from "@/lib/utils";
import { useSettings } from "@/context/ThemeProvider";

export function ThemeSelector() {
  const { theme, setTheme, themes } = useSettings();

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
        value={theme}
        onValueChange={setTheme}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3"
      >
        {themes.map((themeOption) => (
          <div key={themeOption}>
            <RadioGroupItem
              value={themeOption}
              id={`theme-${themeOption}`}
              className="sr-only"
            />
            <Label
              htmlFor={`theme-${themeOption}`}
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent",
                themeOption === theme && " border-primary bg-accent",
              )}
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
