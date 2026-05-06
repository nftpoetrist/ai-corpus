"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Nav } from "@/components/ui";
import { saveUpload } from "@/lib/posts";

type Step = "empty" | "ready" | "uploading" | "done";

const DURATIONS = ["7 days", "30 days", "90 days", "365 days"];
const VISIBILITIES = ["Public", "Unlisted", "Private"];

/* ─── Glass File SVG shell ──────────────────────────────────────── */
function GlassFileSVG() {
  const p = "up";
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 560"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 40px 70px rgba(0,0,0,0.6)) drop-shadow(0 16px 36px rgba(120,90,160,0.28))" }}
    >
      <defs>
        <linearGradient id={`bf-${p}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D6BBD3" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#A98DA8" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#7B6582" stopOpacity="0.60" />
          <stop offset="1" stopColor="#3C2E45" stopOpacity="0.72" />
        </linearGradient>
        <radialGradient id={`bg-${p}`} cx="0.5" cy="0.35" r="0.85">
          <stop offset="0" stopColor="#EAD6EB" stopOpacity="0.40" />
          <stop offset="0.7" stopColor="#7A6280" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`sh-${p}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`ro-${p}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#E2CFE6" stopOpacity="0.50" />
          <stop offset="0.75" stopColor="#FFFFFF" stopOpacity="0.18" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`rm-${p}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.10" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.30" />
        </linearGradient>
        <linearGradient id={`ri-${p}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.40" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={`cf-${p}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2D8EE" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#B596B4" stopOpacity="0.95" />
          <stop offset="1" stopColor="#5A4263" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`ce-${p}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id={`cs-${p}`} cx="0.4" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#000000" stopOpacity="0.40" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <filter id={`hl-${p}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="42" />
        </filter>
        <clipPath id={`bc-${p}`}>
          <path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" />
        </clipPath>
      </defs>

      <ellipse cx="500" cy="300" rx="460" ry="210" fill="#9D7FB0" opacity="0.12" filter={`url(#hl-${p})`} />
      <path d="M 50 22 H 880 L 974 116 V 498 Q 974 530 942 530 H 50 Q 18 530 18 498 V 54 Q 18 22 50 22 Z" fill="#2A2138" fillOpacity="0.45" />
      <path d="M 50 22 H 880 L 974 116 V 498 Q 974 530 942 530 H 50 Q 18 530 18 498 V 54 Q 18 22 50 22 Z" fill="none" stroke={`url(#ro-${p})`} strokeWidth="1.6" />
      <path d="M 56 26 H 882 L 970 114 V 494 Q 970 524 940 524 H 56 Q 24 524 24 494 V 58 Q 24 26 56 26 Z" fill="none" stroke={`url(#rm-${p})`} strokeWidth="1.2" />
      <path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" fill={`url(#bf-${p})`} />
      <path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" fill={`url(#bg-${p})`} />
      <g clipPath={`url(#bc-${p})`}>
        <path d="M 30 30 H 964 V 300 H 30 Z" fill={`url(#sh-${p})`} opacity="0.9" />
        <path d="M 884 110 L 884 30 L 964 110 Z" fill={`url(#cs-${p})`} transform="translate(-6 8)" />
      </g>
      <path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" fill="none" stroke={`url(#ri-${p})`} strokeWidth="1.2" />
      <path d="M 76 46 H 878 L 948 116 V 480 Q 948 504 924 504 H 76 Q 46 504 46 480 V 76 Q 46 46 76 46 Z" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
      <path d="M 884 30 L 964 110 L 884 110 Z" fill={`url(#cf-${p})`} />
      <path d="M 884 30 L 964 110" stroke={`url(#ce-${p})`} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 884 110 L 964 110" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" />
      <path d="M 884 30 L 884 110" stroke="rgba(255,255,255,0.40)" strokeWidth="1" strokeLinecap="round" />
      <path d="M 894 40 L 954 100 L 894 100 Z" fill="rgba(255,230,245,0.18)" />
      <path d="M 892 38 L 956 102" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      <path d="M 70 24 H 878" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M 70 528 H 932" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/* ─── Upload Progress ───────────────────────────────────────────── */
function UploadProgress({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState("Connecting to Shelby network...");

  useEffect(() => {
    const phases: [number, string][] = [
      [20,  "Encoding blob data..."],
      [45,  "Generating Merkle root..."],
      [68,  "Submitting to Shelbynet..."],
      [88,  "Waiting for confirmation..."],
      [100, "Blob stored successfully!"],
    ];
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (i >= phases.length) { setTimeout(() => { if (!cancelled) onDone(); }, 700); return; }
      setPct(phases[i][0]); setPhase(phases[i][1]); i++;
      setTimeout(tick, 900 + Math.random() * 300);
    };
    setTimeout(tick, 500);
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingRight: "12%" }}>
      <div className="relative w-14 h-14 mb-5">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 blur-md opacity-50 animate-pulse" />
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          <circle cx="28" cy="28" r="24" fill="none" stroke="url(#pg)" strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 24 * pct / 100} ${2 * Math.PI * 24}`} strokeLinecap="round" />
          <defs>
            <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-2 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white/70">{pct}%</span>
        </div>
      </div>
      <div className="text-sm font-medium text-white/80 mb-1">{phase}</div>
      <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden mt-3">
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#8b5cf6,#d946ef)" }} />
      </div>
    </div>
  );
}

/* ─── Success Screen ─────────────────────────────────────────────── */
function SuccessScreen({ blobId }: { blobId: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      style={{ padding: "8%", paddingRight: "13%" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", boxShadow: "0 0 30px rgba(139,92,246,0.5)" }}>
        <span className="text-white text-lg">✓</span>
      </motion.div>
      <div className="text-center">
        <div className="text-white font-bold text-lg mb-1">Stored on Shelby</div>
        <div className="text-white/45 text-xs leading-relaxed">Your knowledge is live on the network and available for AI consumption.</div>
      </div>
      <div className="w-full rounded-xl text-left" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", padding: "14px 20px" }}>
        <div className="text-[9px] text-white/30 mb-1">BLOB ID</div>
        <div className="font-mono text-xs text-purple-300 break-all">{blobId}</div>
      </div>
      <div className="flex gap-3 w-full">
        <Link href={`/feed?post=${blobId}`} className="flex-1">
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(139,92,246,0.55)" }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full rounded-xl font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", padding: "18px 20px", fontSize: "15px" }}>
            View in Feed
          </motion.button>
        </Link>
        <a href={`https://explorer.shelby.xyz/blob/${blobId}`} target="_blank" rel="noopener noreferrer" className="flex-1">
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(139,92,246,0.55)" }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full rounded-xl font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", padding: "18px 20px", fontSize: "15px" }}>
            Shelby Explorer ↗ <span style={{ opacity: 0.55, fontSize: "12px" }}>(Waiting for early access)</span>
          </motion.button>
        </a>
      </div>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function UploadPage() {
  const [step, setStep] = useState<Step>("empty");
  const [fileName, setFileName] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [duration, setDuration] = useState("365 days");
  const [visibility, setVisibility] = useState("Public");
  const [showDuration, setShowDuration] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [blobId] = useState(() => `blob-0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStep("ready");
  };

  const canUpload = title.trim().length > 0 && summary.trim().length > 0;

  const handleUploadDone = () => {
    saveUpload({
      id: blobId,
      title,
      summary,
      fileName,
      fileSize: "—",
      blobId: blobId,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      tags: [],
    });
    setStep("done");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Nav />
      <input ref={fileInputRef} type="file" accept=".md" className="hidden" onChange={handleFileChange} />

      <div className="relative" style={{ width: "min(88vw, 860px)", aspectRatio: "1000 / 560", marginTop: "80px" }}>
        <GlassFileSVG />

        <AnimatePresence mode="wait">

          {/* Empty state — click to upload */}
          {step === "empty" && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer select-none"
              onClick={() => fileInputRef.current?.click()}>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div className="text-white/50 font-medium" style={{ fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}>
                  Click to upload your .md file
                </div>
                <div className="text-white/25 text-xs tracking-wide">.md files only</div>
              </div>
            </motion.div>
          )}

          {/* Ready state — fill title, summary, options */}
          {step === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col justify-between"
              style={{ padding: "5% 14% 8% 6%" }}>

              {/* Top: file indicator + title */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-purple-200"
                    style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
                    📄 {fileName}
                  </span>
                  <button onClick={() => { setStep("empty"); setFileName(""); setTitle(""); setSummary(""); }}
                    className="text-[10px] text-white/25 hover:text-white/50 transition-colors">
                    change
                  </button>
                </div>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title..."
                  className="bg-transparent text-white font-bold outline-none placeholder:text-white/20 border-b border-white/10 focus:border-purple-400/40 transition-colors pb-1"
                  style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
                />
              </div>

              {/* Middle: summary */}
              <div className="flex-1 py-3">
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Write a brief summary of your file..."
                  className="w-full h-full bg-transparent text-white/60 outline-none resize-none placeholder:text-white/20"
                  style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.82rem)", lineHeight: 1.7 }}
                />
              </div>

              {/* Bottom: options (left) + upload button (right) */}
              <div className="flex items-end justify-between gap-4">

                {/* Left: Storage Duration + Visibility side by side */}
                <div className="flex items-end gap-2">

                  {/* Storage Duration */}
                  <div className="relative">
                    <motion.button whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.12)" }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15, ease: "easeOut" }}
                      onClick={() => { setShowDuration(v => !v); setShowVisibility(false); }}
                      className="flex items-center justify-center gap-1.5 rounded-xl font-medium border transition-colors"
                      style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", padding: "8px 14px", fontSize: "12px" }}>
                      <span>⏱</span>
                      <span>{duration}</span>
                      <span style={{ opacity: 0.4 }}>{showDuration ? "▲" : "▼"}</span>
                    </motion.button>
                    <AnimatePresence>
                      {showDuration && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                          className="absolute bottom-full mb-1.5 left-0 rounded-xl overflow-hidden"
                          style={{ background: "rgba(30,20,45,0.95)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
                          {DURATIONS.map(d => (
                            <button key={d} onClick={() => { setDuration(d); setShowDuration(false); }}
                              className="flex items-center w-full text-left transition-colors hover:bg-white/5"
                              style={{ color: d === duration ? "#d8b4fe" : "rgba(255,255,255,0.5)", padding: "8px 14px", fontSize: "12px", minWidth: 0 }}>
                              {d === duration && <span className="mr-2 text-purple-400">✓</span>}
                              {d !== duration && <span className="mr-2 opacity-0">✓</span>}
                              {d}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Visibility */}
                  <div className="relative">
                    <motion.button whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.12)" }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15, ease: "easeOut" }}
                      onClick={() => { setShowVisibility(v => !v); setShowDuration(false); }}
                      className="flex items-center justify-center gap-1.5 rounded-xl font-medium border transition-colors"
                      style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", padding: "8px 14px", fontSize: "12px" }}>
                      <span>{visibility === "Public" ? "🌐" : visibility === "Unlisted" ? "🔗" : "🔒"}</span>
                      <span>{visibility}</span>
                      <span style={{ opacity: 0.4 }}>{showVisibility ? "▲" : "▼"}</span>
                    </motion.button>
                    <AnimatePresence>
                      {showVisibility && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                          className="absolute bottom-full mb-1.5 left-0 rounded-xl overflow-hidden"
                          style={{ background: "rgba(30,20,45,0.95)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
                          {VISIBILITIES.map(v => (
                            <button key={v} onClick={() => { setVisibility(v); setShowVisibility(false); }}
                              className="flex items-center w-full text-left transition-colors hover:bg-white/5"
                              style={{ color: v === visibility ? "#d8b4fe" : "rgba(255,255,255,0.5)", padding: "8px 14px", fontSize: "12px", minWidth: 0 }}>
                              {v === visibility && <span className="mr-2 text-purple-400">✓</span>}
                              {v !== visibility && <span className="mr-2 opacity-0">✓</span>}
                              {v}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

                {/* Right: Upload button */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={canUpload ? { scale: 1.05, boxShadow: "0 0 24px rgba(139,92,246,0.5)" } : {}}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  onClick={() => canUpload && setStep("uploading")}
                  className="flex items-center justify-center rounded-xl font-semibold text-white transition-all"
                  style={{
                    background: canUpload ? "linear-gradient(135deg,#7C3AED,#EC4899)" : "rgba(255,255,255,0.08)",
                    color: canUpload ? "#fff" : "rgba(255,255,255,0.25)",
                    cursor: canUpload ? "pointer" : "not-allowed",
                    padding: "9px 28px",
                    fontSize: "13px",
                  }}>
                  Upload ↗
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Uploading */}
          {step === "uploading" && (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UploadProgress onDone={handleUploadDone} />
            </motion.div>
          )}

          {/* Done */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SuccessScreen blobId={blobId} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
