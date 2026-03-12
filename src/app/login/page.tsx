"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// NOTE: credentials are demo-only (no backend). Replace with a real
// authentication flow before deploying to a public environment.
const USERS = [
  { username: "Jad", password: "123" },
  { username: "William", password: "123" },
];

type ClientType = "Developer" | "Investor" | "Broker";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [clientType, setClientType] = useState<ClientType | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim() || !clientType) {
      setError("Please fill in all fields.");
      return;
    }

    const match = USERS.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (!match) {
      setError("Invalid credentials. Please try again.");
      return;
    }

    setLoading(true);
    sessionStorage.setItem(
      "namou_session",
      JSON.stringify({ username: match.username, clientType })
    );
    router.push("/home");
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all text-sm";

  const labelCls = "text-[10px] uppercase tracking-widest text-white/60 font-medium mb-1.5 block";

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
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <Image
            src="/logo.png"
            alt="Namou Properties"
            width={520}
            height={160}
            className="object-contain w-auto h-[15vh] sm:h-[22vh] lg:h-[26vh]"
            priority
          />
          <p className="text-sm sm:text-base text-white/70 max-w-sm mx-auto leading-relaxed mt-2 sm:mt-3 px-2">
            Sign in to access your investment portal.
          </p>
        </div>

        {/* Login card */}
        <div className="w-full max-w-sm bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl px-6 sm:px-8 py-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Username */}
            <div>
              <label htmlFor="username" className={labelCls}>Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="Enter your username"
                autoComplete="username"
                maxLength={50}
                className={inputCls}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelCls}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                autoComplete="current-password"
                maxLength={50}
                className={inputCls}
              />
            </div>

            {/* Client type */}
            <div>
              <label htmlFor="clientType" className={labelCls}>Client Type</label>
              <div className="relative">
                <select
                  id="clientType"
                  value={clientType}
                  onChange={(e) => { setClientType(e.target.value as ClientType | ""); setError(""); }}
                  className={`${inputCls} appearance-none pr-10 cursor-pointer ${
                    clientType === "" ? "text-white/40" : "text-white"
                  }`}
                >
                  <option value="" disabled className="bg-forest text-white/60">Select client type</option>
                  <option value="Developer" className="bg-forest text-white">Developer</option>
                  <option value="Investor" className="bg-forest text-white">Investor</option>
                  <option value="Broker" className="bg-forest text-white">Broker</option>
                </select>
                {/* Custom chevron */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-300 text-center -mt-1">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-deep-forest transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
