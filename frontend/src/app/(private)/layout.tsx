import Sidebar from "@/components/layout/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-16 lg:pb-0">
            {children}
        </main>
    </div>
  );
}