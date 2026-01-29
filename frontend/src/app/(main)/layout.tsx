import Sidebar from "@/components/layout/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
        <Sidebar />
        <main>
            {children}
        </main>
    </div>
  );
}