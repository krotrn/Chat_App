import NavMenu from "@/components/navigation/NavMenu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen w-full space-y-2">
      <NavMenu />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
