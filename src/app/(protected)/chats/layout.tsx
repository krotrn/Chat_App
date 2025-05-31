import { AuthProvider } from "@/components/AuthProvider";
import APICheckWrapper from "@/components/offline/api-check-wrapper";
import SessionProviderWrapper from "@/components/SessionProvider";
import {
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default async function ChatsLayout({
  chatList,
  chatMain,
}: {
  children: React.ReactNode;
  chatList: React.ReactNode;
  chatMain: React.ReactNode;
}) {
  return (
    <APICheckWrapper>
      <SessionProviderWrapper>
        <AuthProvider>
          <ResizablePanelGroup
            direction="horizontal"
            className="flex h-full overflow-hidden bg-background"
          >
            {chatList}
            <ResizableHandle />
            {chatMain}
          </ResizablePanelGroup>
        </AuthProvider>
      </SessionProviderWrapper>
    </APICheckWrapper>
  );
}
