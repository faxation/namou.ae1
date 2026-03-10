import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-mint-white via-mint-bg to-mint-light/20 overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-mint-light/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] rounded-full bg-mint/10 blur-3xl pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <main className="flex-1 flex flex-col px-3 sm:px-5 lg:px-8 pt-3 sm:pt-4 lg:pt-6 pb-2 sm:pb-3 lg:pb-4 min-h-0 overflow-y-auto md:overflow-y-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
