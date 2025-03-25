import NavMenu from "@/components/navigation/NavMenu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-full space-y-4">
      <NavMenu />
      {children}
    </div>
  );
}
