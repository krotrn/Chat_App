"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SwitchGroupProps {
  switches: { id: string; label: string; defaultChecked?: boolean }[];
}

export function SwitchGroup({ switches }: SwitchGroupProps) {
  return (
    <div className="space-y-4">
      {switches.map(({ id, label, defaultChecked }) => (
        <div key={id} className="flex items-center justify-between space-x-2">
          <Label htmlFor={id} className="flex flex-1 cursor-pointer items-center">
            <span>{label}</span>
          </Label>
          <Switch id={id} defaultChecked={defaultChecked} />
        </div>
      ))}
    </div>
  );
}