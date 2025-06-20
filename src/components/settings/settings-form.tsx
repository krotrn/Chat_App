"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSettings } from "@/context/ThemeProvider";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  FontSizeSelector,
  SettingsCard,
  SwitchGroup,
  ThemeSelector,
} from "@/components";
import {
  appearanceSwitches,
  notificationSwitches,
  privacySwitches,
} from "@/lib/settings/options";
import { config } from "@/config";
import { signout } from "@/actions/auth";

export function SettingsForm() {
  const { setFontSize } = useSettings();

  const handleSaveChanges = () => {
    toast.success("Settings saved successfully");
  };

  const handleResetDefaults = () => {
    setFontSize("medium");
    toast.success("Settings reset to defaults");
  };

  const footer = (
    <>
      <Button
        variant="outline"
        onClick={handleResetDefaults}
        className="w-full sm:w-auto"
      >
        Reset to Defaults
      </Button>
      <Button onClick={handleSaveChanges} className="w-full sm:w-auto">
        Save Changes
      </Button>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance">
          <SettingsCard
            title="Appearance"
            description={`Customize how ${config.appName} looks and feels.`}
            footer={footer}
          >
            <ThemeSelector />
            <FontSizeSelector />
            <SwitchGroup switches={appearanceSwitches} />
          </SettingsCard>
        </TabsContent>
        <TabsContent value="notifications">
          <SettingsCard
            title="Notifications"
            description="Configure how you receive notifications."
            footer={footer}
          >
            <SwitchGroup switches={notificationSwitches} />
          </SettingsCard>
        </TabsContent>
        <TabsContent value="privacy">
          <SettingsCard
            title="Privacy"
            description="Manage your privacy settings."
            footer={footer}
          >
            <SwitchGroup switches={privacySwitches} />
          </SettingsCard>
        </TabsContent>
      </Tabs>
      <Button
        variant="destructive"
        className="w-full mt-4"
        onClick={() => signout()}
      >
        Sign Out
      </Button>
    </motion.div>
  );
}
