"use client";

import {
  groupAndSortWallets,
  isInstallRequired,
  truncateAddress,
  useWallet,
  WalletReadyState,
} from "@aptos-labs/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── Wallet section ────────────────────────────────────────────── */

/* ─── Wallet SVG Icons ──────────────────────────────────────────── */
const WalletIcons: Record<string, React.ReactNode> = {
  petra: (
    <svg viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="url(#p1)"/>
      <defs><linearGradient id="p1" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#1D4ED8"/><stop offset="1" stopColor="#60A5FA"/></linearGradient></defs>
      <polygon points="20,8 30,14 30,26 20,32 10,26 10,14" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8"/>
      <polygon points="20,14 25,17 25,23 20,26 15,23 15,17" fill="rgba(255,255,255,0.25)"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
    </svg>
  ),
  metamask: (
    <svg viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="url(#mm1)"/>
      <defs><linearGradient id="mm1" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#E2761B"/><stop offset="1" stopColor="#F6851B"/></linearGradient></defs>
      <path d="M8 10L19.5 18.5L17.5 13.5Z" fill="rgba(255,255,255,0.85)"/>
      <path d="M32 10L20.6 18.6L22.5 13.5Z" fill="rgba(255,255,255,0.6)"/>
      <path d="M8 10L12 24L17 21L19.5 18.5Z" fill="rgba(255,255,255,0.75)"/>
      <path d="M32 10L20.5 18.5L23 21L28 24Z" fill="rgba(255,255,255,0.6)"/>
      <path d="M23 21L20.5 18.5L17 21L16 27L24 27Z" fill="white" fillOpacity="0.9"/>
      <path d="M12 24L16 27L17 21Z" fill="rgba(255,255,255,0.7)"/>
      <path d="M28 24L24 27L23 21Z" fill="rgba(255,255,255,0.7)"/>
      <path d="M16 27L15 31L19.5 28.5Z" fill="white"/>
      <path d="M24 27L20.5 28.5L25 31Z" fill="white"/>
      <path d="M19.5 28.5L15 31L16.5 33L19.5 33Z" fill="rgba(255,255,255,0.8)"/>
      <path d="M20.5 28.5L20.5 33L23.5 33L25 31Z" fill="rgba(255,255,255,0.8)"/>
    </svg>
  ),
  phantom: (
    <svg viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="url(#ph1)"/>
      <defs><linearGradient id="ph1" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#551BF9"/><stop offset="1" stopColor="#9945FF"/></linearGradient></defs>
      <path d="M20 9C14 9 9 14 9 20C9 26 14 31 20 31C22 31 23.5 30.5 24.5 30L27 32L27 28.5C29.5 26.8 31 23.6 31 20C31 14 26 9 20 9Z" fill="white" fillOpacity="0.95"/>
      <circle cx="16.5" cy="19.5" r="2" fill="#551BF9"/>
      <circle cx="23.5" cy="19.5" r="2" fill="#551BF9"/>
      <path d="M14 23C15.5 25 18 26 20 26C22 26 24.5 25 26 23" stroke="#551BF9" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  walletconnect: (
    <svg viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="url(#wc1)"/>
      <defs><linearGradient id="wc1" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#1A56DB"/><stop offset="1" stopColor="#3B82F6"/></linearGradient></defs>
      <path d="M13.5 18.5C17 15 23 15 26.5 18.5L27.2 19.2C27.5 19.5 27.5 20 27.2 20.3L25.5 22C25.35 22.15 25.1 22.15 24.95 22L24.05 21.1C21.8 18.85 18.2 18.85 15.95 21.1L15 22C14.85 22.15 14.6 22.15 14.45 22L12.8 20.3C12.5 20 12.5 19.5 12.8 19.2Z" fill="white"/>
      <path d="M17 22.5L18.5 21C19.35 20.15 20.65 20.15 21.5 21L23 22.5C23.15 22.65 23.15 22.9 23 23.05L21 25.05C20.65 25.4 20.15 25.5 19.8 25.5H20.2C19.85 25.5 19.35 25.4 19 25.05L17 23.05C16.85 22.9 16.85 22.65 17 22.5Z" fill="white"/>
    </svg>
  ),
  nightly: (
    <svg viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="url(#nl1)"/>
      <defs><linearGradient id="nl1" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#2D1B69"/><stop offset="1" stopColor="#7C3AED"/></linearGradient></defs>
      <path d="M24 10C18 10 13 15 13 21C13 27 18 32 24 32C26 32 27.8 31.4 29.3 30.4C27.5 30.8 25.6 30.5 24 29.4C19.6 26.5 18.3 20.6 21.2 16.2C22.3 14.5 24 13.4 25.8 12.9C25.2 11.5 24.7 10.7 24 10Z" fill="white" fillOpacity="0.9"/>
      <circle cx="28" cy="14" r="2" fill="rgba(255,255,255,0.6)"/>
      <circle cx="31" cy="20" r="1.2" fill="rgba(255,255,255,0.4)"/>
      <circle cx="26" cy="11" r="0.8" fill="rgba(255,255,255,0.5)"/>
    </svg>
  ),
  pontem: (
    <svg viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="url(#pt1)"/>
      <defs><linearGradient id="pt1" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#064E3B"/><stop offset="1" stopColor="#10B981"/></linearGradient></defs>
      <path d="M9 25C9 25 12 15 20 15C28 15 31 25 31 25" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <rect x="12" y="24" width="4" height="8" rx="1" fill="white" fillOpacity="0.85"/>
      <rect x="24" y="24" width="4" height="8" rx="1" fill="white" fillOpacity="0.85"/>
      <rect x="9" y="23" width="22" height="3" rx="1.5" fill="white" fillOpacity="0.4"/>
    </svg>
  ),
  okx: (
    <svg viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#0C0C0C"/>
      <rect x="1" y="1" width="38" height="38" rx="11" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <rect x="10" y="10" width="8" height="8" rx="1.5" fill="white"/>
      <rect x="22" y="10" width="8" height="8" rx="1.5" fill="white"/>
      <rect x="10" y="22" width="8" height="8" rx="1.5" fill="white"/>
      <rect x="22" y="22" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.35)"/>
    </svg>
  ),
};

const WALLETS = [
  { id: "petra",         name: "Petra",         desc: "Aptos native wallet",   popular: true  },
  { id: "metamask",      name: "MetaMask",       desc: "EVM & multi-chain",     popular: true  },
  { id: "phantom",       name: "Phantom",        desc: "Multi-chain wallet",    popular: true  },
  { id: "walletconnect", name: "WalletConnect",  desc: "Scan with any wallet",  popular: true  },
  { id: "nightly",       name: "Nightly",        desc: "Aptos & Solana",        popular: false },
  { id: "pontem",        name: "Pontem",         desc: "Aptos wallet",          popular: false },
  { id: "okx",           name: "OKX Wallet",     desc: "Multi-chain wallet",    popular: false },
];

/* ─── Wallet Connect Modal ───────────────────────────────────────── */
function WalletModal({ onClose }: { onClose: () => void }) {
  const { wallets = [], connect } = useWallet();
  const [connectingName, setConnectingName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { availableWallets, installableWallets } = groupAndSortWallets(wallets);
  const allWallets = [...availableWallets, ...installableWallets];
  const connectingWallet = wallets.find((w: any) => w.name === connectingName);

  const handleConnect = async (wallet: any) => {
    if (isInstallRequired(wallet)) {
      window.open(wallet.url ?? "https://petra.app", "_blank");
      return;
    }
    setErrorMsg(null);
    setConnectingName(wallet.name);
    try {
      await connect(wallet.name as any);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Connection rejected.");
      setConnectingName(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Toast — bottom right */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            key={errorMsg}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 rounded-2xl"
            style={{ background: "rgba(20,10,10,0.97)", border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", padding: "14px 18px", maxWidth: 300 }}>
            <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-red-300 text-xs font-semibold">Connection rejected</div>
            </div>
            <button onClick={() => setErrorMsg(null)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
              style={{ color: "rgba(239,68,68,0.4)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(239,68,68,0.8)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(239,68,68,0.4)")}>
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1 1L8 8M8 1L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(14px)" }}
        onClick={() => !connectingName && onClose()} />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full mx-4 overflow-hidden"
        style={{ maxWidth: 400, background: "#161616", borderRadius: 20, boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 40px 100px rgba(0,0,0,0.9)" }}
      >
        {/* Close button */}
        <button onClick={onClose} disabled={!!connectingName}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1.5 1.5L11.5 11.5M11.5 1.5L1.5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <AnimatePresence mode="wait">
          {connectingName ? (
            /* ── Connecting state ── */
            <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center px-8 py-14 gap-5">
              <div className="relative">
                {(connectingWallet as any)?.icon ? (
                  <img src={(connectingWallet as any).icon} alt={connectingName}
                    className="w-20 h-20 rounded-2xl"
                    style={{ boxShadow: "0 0 40px rgba(139,92,246,0.4)" }} />
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    {connectingName[0]}
                  </div>
                )}
                <svg className="absolute -inset-3 -rotate-90 animate-spin" style={{ width: 104, height: 104 }} viewBox="0 0 104 104">
                  <circle cx="52" cy="52" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2"/>
                  <circle cx="52" cy="52" r="48" fill="none" stroke="url(#cg)" strokeWidth="2.5"
                    strokeDasharray="70 230" strokeLinecap="round"/>
                  <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#EC4899"/>
                  </linearGradient></defs>
                </svg>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">Opening {connectingName}</div>
                <div className="text-white/40 text-sm mt-1.5">Confirm the connection in your wallet</div>
              </div>
              <button onClick={() => setConnectingName(null)}
                className="text-sm text-white/30 hover:text-white/60 transition-colors mt-2">
                Cancel
              </button>
            </motion.div>
          ) : (
            /* ── Main list ── */
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Logo + title */}
              <div className="flex flex-col items-center pt-10 pb-7 px-8">
                <Image src="/logo.png" alt="AI Corpus" width={320} height={120} className="object-contain mb-2"
                  style={{ height: 120, width: "auto", filter: "brightness(0) saturate(1) invert(1) sepia(1) saturate(6) hue-rotate(225deg) brightness(1.4)" }} />
              </div>


              {/* Wallet list */}
              <div className="mx-5 mb-4 rounded-2xl overflow-hidden"
                style={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.06)" }}>
                {allWallets.map((wallet: any, i: number) => {
                  const installed = wallet.readyState === WalletReadyState.Installed;
                  const needsInstall = isInstallRequired(wallet);
                  return (
                    <div key={wallet.name}>
                      {i > 0 && <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 18px" }} />}
                      <motion.button
                        whileTap={{ scale: 0.99 }}
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        onClick={() => handleConnect(wallet)}
                        className="w-full flex items-center gap-4 transition-all text-left"
                        style={{ background: "transparent", padding: "13px 18px" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {wallet.icon ? (
                          <img src={wallet.icon} alt={wallet.name} className="w-9 h-9 rounded-xl flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white/50 flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.06)", fontSize: 15 }}>
                            {wallet.name[0]}
                          </div>
                        )}

                        <span className="flex-1 text-white font-semibold text-sm">{wallet.name}</span>

                        {installed ? (
                          <span className="text-xs font-medium px-3 py-1 rounded-lg flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                            Installed
                          </span>
                        ) : needsInstall ? (
                          <span className="text-xs font-medium px-3 py-1 rounded-lg flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.28)" }}>
                            Get ↗
                          </span>
                        ) : null}
                      </motion.button>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-8 pb-6 text-center">
                <p className="text-white/20 text-xs">
                  By connecting you agree to our{" "}
                  <span className="text-white/35 underline underline-offset-2 cursor-pointer hover:text-white/55 transition-colors">Terms of Service</span>
                </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ─── Connected Wallet Dropdown ─────────────────────────────────── */
function WalletDropdown() {
  const { account, wallet, disconnect, network } = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const short = account?.address ? truncateAddress(account.address.toString()) : "Connected";
  const isTestnet = network?.name?.toLowerCase().includes("testnet");

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center rounded-full border transition-all"
        style={{ background: "rgba(139,92,246,0.15)", borderColor: "rgba(139,92,246,0.35)", color: "#d8b4fe", gap: 8, padding: "6px 14px", marginRight: 6 }}>
        {wallet?.icon ? (
          <img src={wallet.icon} alt={wallet.name} style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0 }} />
        ) : (
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#EC4899)", flexShrink: 0 }} />
        )}
        <span className="text-xs font-mono font-medium">{short}</span>
        <span style={{ fontSize: 9, opacity: 0.4 }}>{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15, ease: [0.22,1,0.36,1] }}
            className="absolute top-full right-0 mt-2 rounded-2xl overflow-hidden"
            style={{ width: 220, background: "rgba(12,8,20,0.98)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(24px)", boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.06)" }}>

            {/* Top accent */}
            <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.5),transparent)" }} />

            {/* Wallet info */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2 mb-2">
                {wallet?.icon && <img src={wallet.icon} alt={wallet.name} style={{ width: 18, height: 18, borderRadius: 6 }} />}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{wallet?.name}</span>
                <div className="ml-auto flex items-center gap-1">
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 5px rgba(74,222,128,0.9)" }} />
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>Testnet</span>
                </div>
              </div>
            </div>

            {/* Disconnect */}
            <div style={{ padding: "6px" }}>
              <button onClick={() => { disconnect(); setOpen(false); }}
                className="w-full flex items-center justify-center gap-2 rounded-xl transition-all"
                style={{ padding: "10px", color: "rgba(248,113,113,0.8)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Disconnect</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Nav ─────────────────────────────────────────────────────── */
export function Nav({ activePage = "" }: { activePage?: string }) {
  const { connected } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [profileHandle, setProfileHandle] = useState("me");

  useEffect(() => {
    const handle = localStorage.getItem("ai_corpus_handle") || localStorage.getItem("ai_corpus_username") || "me";
    setProfileHandle(handle);
  }, []);

  return (
    <>
      <div className="fixed top-3 left-4 right-4 z-50 flex justify-center pointer-events-none">
        <nav
          className="pointer-events-auto w-full max-w-6xl rounded-xl px-5 flex items-center justify-between border border-white/15 relative"
          style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", height: "48px" }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image src="/logo.png" alt="AI Corpus" width={600} height={108} className="object-contain"
              style={{ height: "108px", width: "auto", filter: "brightness(0) saturate(1) invert(1) sepia(1) saturate(6) hue-rotate(225deg) brightness(1.4)" }} />
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-8 absolute left-0 right-0 justify-center pointer-events-none" style={{ top: "50%", transform: "translateY(-50%) translateX(-15px)" }}>
            <div className="flex items-center gap-8 pointer-events-auto">
            {[
              { label: "CONTENT DISCOVERY", href: "/content-discovery" },
              { label: "UPLOAD", href: "/upload" },
              { label: "PROFILE", href: `/profile/${profileHandle}` },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                className={`text-xs font-medium tracking-widest transition-colors duration-200 ${activePage === item.label.toLowerCase() ? "text-white" : "text-white/60 hover:text-white"}`}>
                {item.label}
              </Link>
            ))}
            </div>
          </div>

          {/* Right: wallet */}
          <div className="flex items-center flex-shrink-0">
            {connected ? (
              <WalletDropdown />
            ) : (
              <motion.button whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.06, boxShadow: "0 0 28px rgba(139,92,246,0.6)" }} transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", color: "#fff", boxShadow: "0 0 16px rgba(139,92,246,0.35)", padding: "8px 20px", marginRight: "6px" }}>
                Connect Wallet
              </motion.button>
            )}
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {showModal && <WalletModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}

/* ─── GradientText ────────────────────────────────────────────── */
export function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

/* ─── GlassCard ───────────────────────────────────────────────── */
export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}>
      {children}
    </div>
  );
}

/* ─── GradientBorderCard ──────────────────────────────────────── */
export function GradientBorderCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative p-px rounded-2xl ${className}`}
      style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.5), rgba(217,70,239,0.35), rgba(139,92,246,0.15))" }}>
      <div className="rounded-2xl bg-[#0f0f1a] h-full" style={{ padding: "28px 28px" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Tag badge ───────────────────────────────────────────────── */
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
      {children}
    </span>
  );
}

/* ─── Avatar ──────────────────────────────────────────────────── */
export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" }[size];
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-[0_0_16px_rgba(139,92,246,0.35)] flex-shrink-0`}>
      {initials}
    </div>
  );
}

/* ─── ShelbyBadge ─────────────────────────────────────────────── */
export function ShelbyBadge({ blobId }: { blobId: string }) {
  return (
    <a href={`https://explorer.shelby.xyz/blob/${blobId}`} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/40 transition-colors text-[10px] text-white/40 hover:text-purple-300">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_rgba(34,211,165,0.8)] animate-pulse-dot" />
      On Shelby
    </a>
  );
}

/* ─── StatPill ────────────────────────────────────────────────── */
export function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-xs text-white/35">{label}</span>
    </div>
  );
}

/* ─── fmt helper ──────────────────────────────────────────────── */
export function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
