import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-mint-white via-mint-bg to-mint-light/20">
      {/* Decorative background blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-mint-light/15 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[10%] w-[400px] h-[400px] rounded-full bg-mint/10 blur-3xl pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar />
        <main className="flex-1 px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
