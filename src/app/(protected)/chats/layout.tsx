import {
  APICheckWrapper,
  SocketLayout,
} from "@/components";
import { ResizableHandle, ResizablePanelGroup } from "@/components/ui";

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
        >
          {chatList}
          <ResizableHandle withHandle />
          {chatMain}
        </ResizablePanelGroup>
      </SocketLayout>
    </APICheckWrapper>
  );
}
