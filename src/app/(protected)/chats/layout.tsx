import { APICheckWrapper } from "@/components";
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
      <ResizablePanelGroup direction="horizontal">
        {chatList}
        <ResizableHandle withHandle />
        {chatMain}
      </ResizablePanelGroup>
    </APICheckWrapper>
  );
}
