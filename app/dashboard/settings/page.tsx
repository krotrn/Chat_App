import type { Metadata } from "next";
import SettingsForm from "@/components/settings/settings-form";

export const metadata: Metadata = {
  title: "Settings | Chat App",
  description: "Customize your Chat App experience",
};

export default function SettingsPage() {
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="space-y-6 w-full max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Chat App experience.
          </p>
        </div>
        <SettingsForm />
      </div>
    </div>
  );
}
