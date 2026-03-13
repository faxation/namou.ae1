"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

type ClientType = "Developer" | "Investor" | "Broker";

const clientTypes: { type: ClientType; label: string }[] = [
  { type: "Developer", label: "Developer" },
  { type: "Investor", label: "Investor" },
  { type: "Broker", label: "Broker" },
];

export default function LoginPage() {
  const router = useRouter();

  function handleSelect(clientType: ClientType) {
    sessionStorage.setItem(
      "namou_session",
      JSON.stringify({ clientType })
    );
    router.push("/home");
  }

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/rak-hero.jpg')" }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-deep-forest/40" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-center px-4 sm:px-12 py-4 sm:py-6">
        <span className="text-xs tracking-[0.35em] uppercase text-white/60 font-heading">
          Real Estate Done Right
        </span>
      </header>

      {/* Center content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 sm:px-8 pt-4 sm:pt-6 pb-6 sm:pb-10">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
          <Image
            src="/logo.png"
            alt="Namou Properties"
            width={520}
            height={160}
            className="object-contain w-auto h-[15vh] sm:h-[28vh] lg:h-[34vh]"
            priority
          />
          <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed mt-2 sm:mt-3 px-2">
            Strategic land investment opportunities across Ras Al Khaimah.
            Curated plots, transparent ROI, and a clear path to ownership.
          </p>
        </div>

        {/* Client type selector card */}
        <div className="w-full max-w-4xl bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl px-4 sm:px-10 py-6 sm:py-8 shadow-2xl flex flex-col items-center gap-6">
          <div className="w-full">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4 text-center">Select your client type</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {clientTypes.map((ct) => (
                <button
                  key={ct.type}
                  onClick={() => handleSelect(ct.type)}
                  className="py-4 sm:py-6 px-4 sm:px-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-sm sm:text-base font-semibold text-white hover:bg-white/30 hover:border-white/50 transition-all text-center"
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
