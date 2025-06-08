import {
  AuthProvider,
  NavMenu,
  OnlineCheckWrapper,
  QueryProvider,
  SessionProviderWrapper,
  StoreProvider,
} from "@/components";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <SessionProviderWrapper>
        <AuthProvider>
          <QueryProvider>
            <div className="flex flex-col h-screen w-full space-y-2">
              <NavMenu />
              <main className="flex-1 overflow-x-hidden">
                <OnlineCheckWrapper>{children}</OnlineCheckWrapper>
              </main>
            </div>
          </QueryProvider>
        </AuthProvider>
      </SessionProviderWrapper>
    </StoreProvider>
  );
}
