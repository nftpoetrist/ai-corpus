"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import type { Post } from "@/lib/posts";

const PRESETS = [
  { label: "0.001 APT", value: 0.001 },
  { label: "0.01 APT",  value: 0.01  },
  { label: "0.1 APT",   value: 0.1   },
  { label: "Custom",    value: -1     },
];

const APT_USD = 8.5;

type Status = "idle" | "sending" | "success" | "error";

export function TipModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const { signAndSubmitTransaction, connected } = useWallet();
  const [selected, setSelected] = useState(0.001);
  const [custom, setCustom] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const isCustom = selected === -1;
  const amount = isCustom ? parseFloat(custom || "0") : selected;
  const usd = (amount * APT_USD).toFixed(4);
  const canSend = connected && amount > 0 && status === "idle";

  const send = async () => {
    if (!canSend) return;
    setStatus("sending");
    setError("");
    try {
      const octas = BigInt(Math.round(amount * 1e8));
      const response = await signAndSubmitTransaction({
        data: {
          function: "0x1::aptos_account::transfer",
          functionArguments: [post.author.address, octas],
        },
      });
      setTxHash((response as any).hash ?? "");
      setStatus("success");
    } catch (err: any) {
      setError(err?.message ?? "Transaction failed.");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(14px)" }}
        onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full mx-4 rounded-3xl"
        style={{ maxWidth: 520, background: "#1a1523", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 48px 120px rgba(0,0,0,0.85)" }}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center"
              style={{ padding: "48px 40px" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-5"
                style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", boxShadow: "0 0 40px rgba(139,92,246,0.5)" }}>
                ✓
              </div>
              <div className="text-white font-bold text-xl mb-2">Tip Sent!</div>
              <div className="text-white/40 text-sm mb-6">{amount} APT sent to @{post.author.handle}</div>
              {txHash && (
                <div className="text-center" style={{ marginBottom: 4 }}>
                  <div className="text-white/25 text-[10px] mb-1 tracking-widest uppercase">Transaction Hash</div>
                  <div className="font-mono text-purple-400/60 text-[10px]">
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </div>
                </div>
              )}
              <button onClick={onClose} className="rounded-2xl text-sm font-bold text-white"
                style={{ padding: "11px 48px", background: "linear-gradient(135deg,#7C3AED,#EC4899)", marginTop: "28px" }}>
                Done
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: "32px 32px 28px" }}>

              {/* Author */}
              <div className="flex items-center gap-4" style={{ marginBottom: 28 }}>
                <div className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ width: 52, height: 52, fontSize: 18, background: `linear-gradient(135deg,${post.author.color1},${post.author.color2})` }}>
                  {post.author.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-white font-semibold" style={{ fontSize: 16 }}>@{post.author.handle}</div>
                  <div className="text-white/45 text-sm mt-0.5">Send a tip</div>
                </div>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-4 gap-2.5" style={{ marginBottom: 20 }}>
                {PRESETS.map((a) => {
                  const active = a.value === selected;
                  return (
                    <button key={a.label} onClick={() => setSelected(a.value)}
                      className="rounded-xl font-semibold transition-all"
                      style={{
                        padding: "12px 6px",
                        fontSize: 13,
                        background: active ? "rgba(139,92,246,0.22)" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${active ? "rgba(139,92,246,0.55)" : "rgba(255,255,255,0.09)"}`,
                        color: active ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                      }}>
                      {a.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom input */}
              {isCustom && (
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="number" step="0.001" min="0" placeholder="Enter amount in APT"
                    value={custom} onChange={e => setCustom(e.target.value)}
                    className="w-full text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 16px", fontSize: 14 }}
                    autoFocus
                  />
                </div>
              )}

              {/* USD + balance */}
              <div style={{ marginBottom: 20 }}>
                {amount > 0 && (
                  <div className="text-white/40 text-sm">≈ ${usd} USD</div>
                )}
                {!connected && (
                  <div className="text-amber-400/70 text-sm mt-1">Connect your wallet to send a tip.</div>
                )}
                {status === "error" && (
                  <div className="text-red-400/70 text-sm mt-1">{error}</div>
                )}
              </div>

              {/* Send button */}
              <button onClick={send} disabled={!canSend}
                className="w-full rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  padding: "17px",
                  fontSize: 16,
                  background: canSend ? "linear-gradient(135deg,#EC4899,#8B5CF6)" : "rgba(255,255,255,0.07)",
                  color: canSend ? "#fff" : "rgba(255,255,255,0.2)",
                  cursor: canSend ? "pointer" : "not-allowed",
                  boxShadow: canSend ? "0 8px 32px rgba(236,72,153,0.35)" : "none",
                }}>
                {status === "sending" ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Sending...
                  </>
                ) : "Send tip"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
