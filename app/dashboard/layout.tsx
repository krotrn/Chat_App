import NavMenu from "@/components/navigation/NavMenu";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <NavMenu />
        <main className="flex-1">{children}</main>
      </div>
    </SessionProvider>
  );
}