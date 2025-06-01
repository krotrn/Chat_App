import APICheckWrapper from "@/components/offline/api-check-wrapper";
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
      <ResizablePanelGroup
        direction="horizontal"
        className="flex h-full overflow-hidden bg-background"
      >
        {chatList}
        <ResizableHandle />
        {chatMain}
      </ResizablePanelGroup>
    </APICheckWrapper>
  );
}
