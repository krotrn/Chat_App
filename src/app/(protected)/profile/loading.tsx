import { ProfileUpdateSkeleton } from "@/components";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { config } from "@/config";

export default function ProfileLoading() {
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="space-y-6 w-full max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Customize your {config.appName} experience.
          </p>
        </div>
        <div>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
            <ProfileUpdateSkeleton />
          </Tabs>
        </div>
      </div>
    </div>
  );
}
