import NavMenu from "@/components/navigation/NavMenu";
import CheckWrapper from "@/components/offline/check-wrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen w-full space-y-2">
      <NavMenu />
      <main className="flex-1 overflow-x-hidden">
        <CheckWrapper>{children}</CheckWrapper>
      </main>
    </div>
  );
}
