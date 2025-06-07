import APICheckWrapper from "@/components/offline/api-check-wrapper";
import SocketLayout from "@/components/SocketLayout";
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
      <SocketLayout>
        <ResizablePanelGroup
          direction="horizontal"
          className="flex h-full overflow-hidden bg-background"
        >
          {chatList}
          <ResizableHandle withHandle />
          {chatMain}
        </ResizablePanelGroup>
      </SocketLayout>
    </APICheckWrapper>
  );
}
