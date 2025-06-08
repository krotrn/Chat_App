import {
  AuthProvider,
  NavMenu,
  OnlineCheckWrapper,
  QueryProvider,
  SessionProviderWrapper,
  SocketLayout,
  StoreProvider,
} from "@/components";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
            <SocketLayout>
              <div className="flex flex-col h-screen w-full space-y-2">
                <NavMenu />
                <main className="flex-1 overflow-x-hidden">
                  <OnlineCheckWrapper>
                    {children}
                    <SpeedInsights />
                  </OnlineCheckWrapper>
                </main>
              </div>
            </SocketLayout>
          </QueryProvider>
        </AuthProvider>
      </SessionProviderWrapper>
    </StoreProvider>
  );
}
