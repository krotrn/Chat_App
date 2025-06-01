import { AuthProvider } from "@/components/AuthProvider";
import NavMenu from "@/components/navigation/NavMenu";
import OnlineCheckWrapper from "@/components/offline/offline-checkWrapper";
import { QueryProvider } from "@/components/query-provider";
import SessionProviderWrapper from "@/components/SessionProvider";
import StoreProvider from "@/components/StoreProvider";

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
