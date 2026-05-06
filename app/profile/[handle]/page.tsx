"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Nav } from "@/components/ui";
import { useWallet, truncateAddress } from "@aptos-labs/wallet-adapter-react";

const SHAPES = ["hex", "diamond", "ring", "pentagon", "star", "octagon", "triangle", "roundsq"];
const PALETTES: [string, string][] = [
  ["#7C3AED", "#4F46E5"], ["#DB2777", "#9333EA"], ["#0EA5E9", "#6366F1"],
  ["#10B981", "#3B82F6"], ["#F59E0B", "#EF4444"], ["#8B5CF6", "#EC4899"],
  ["#06B6D4", "#7C3AED"], ["#F97316", "#A855F7"],
];

function deriveAvatar(address: string) {
  const n = parseInt(address.slice(2, 10) || "0", 16) || 0;
  return { shape: SHAPES[n % SHAPES.length], colors: PALETTES[n % PALETTES.length] };
}

function ProfileAvatar({ address, size = 80 }: { address: string; size?: number }) {
  const derived = deriveAvatar(address);
  const shape  = localStorage.getItem("ai_corpus_avatar_shape")  || derived.shape;
  const color1 = localStorage.getItem("ai_corpus_avatar_color1") || derived.colors[0];
  const color2 = localStorage.getItem("ai_corpus_avatar_color2") || derived.colors[1];
  const colors: [string, string] = [color1, color2];
  const gid = `pa-${address.slice(2, 10)}`;
  const c = size / 2, r = size / 2 - 2;

  const shapeEl = (() => {
    switch (shape) {
      case "hex": {
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (i * 60 - 90) * Math.PI / 180;
          return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`;
        }).join(" ");
        return <polygon points={pts} fill={`url(#${gid})`} />;
      }
      case "diamond": return <polygon points={`${c},2 ${size-2},${c} ${c},${size-2} 2,${c}`} fill={`url(#${gid})`} />;
      case "ring": return (<><circle cx={c} cy={c} r={r} fill={`url(#${gid})`} /><circle cx={c} cy={c} r={r*0.52} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={size*0.04} /><circle cx={c} cy={c} r={r*0.18} fill="rgba(255,255,255,0.5)" /></>);
      case "pentagon": {
        const pts = Array.from({ length: 5 }, (_, i) => { const a = (i * 72 - 90) * Math.PI / 180; return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`; }).join(" ");
        return <polygon points={pts} fill={`url(#${gid})`} />;
      }
      case "star": {
        const inner = r * 0.42;
        const pts = Array.from({ length: 8 }, (_, i) => { const a = (i * 45 - 90) * Math.PI / 180; const rad = i % 2 === 0 ? r : inner; return `${c + rad * Math.cos(a)},${c + rad * Math.sin(a)}`; }).join(" ");
        return <polygon points={pts} fill={`url(#${gid})`} />;
      }
      case "octagon": {
        const pts = Array.from({ length: 8 }, (_, i) => { const a = (i * 45 + 22.5) * Math.PI / 180; return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`; }).join(" ");
        return <polygon points={pts} fill={`url(#${gid})`} />;
      }
      case "triangle": return <polygon points={`${c},3 ${size-3},${size-3} 3,${size-3}`} fill={`url(#${gid})`} />;
      case "roundsq": return <rect x="2" y="2" width={size-4} height={size-4} rx={size*0.22} fill={`url(#${gid})`} />;
      default: return <circle cx={c} cy={c} r={r} fill={`url(#${gid})`} />;
    }
  })();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ border: "4px solid #0a0612", borderRadius: 16, boxShadow: "0 0 28px rgba(139,92,246,0.4)", display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      {shapeEl}
    </svg>
  );
}
import { FEED_POSTS, getSavedIds, toggleSaved, getUploads, deleteUpload } from "@/lib/posts";
import type { Post, UploadedPost } from "@/lib/posts";

/* ─── Mini Feed Card (saved posts) ─────────────────────────────── */
function SavedCard({ post, onUnsave }: { post: Post; onUnsave: (id: string) => void }) {
  const [saved, setSaved] = useState(true);

  const handleSave = () => {
    toggleSaved(post.id);
    setSaved(false);
    onUnsave(post.id);
  };

  if (!saved) return null;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      className="relative rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-0 h-0"
          style={{ borderStyle: "solid", borderWidth: "0 24px 24px 0", borderColor: "transparent rgba(139,92,246,0.2) transparent transparent" }} />
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "#c4b5fd" }}>
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-white font-semibold text-sm leading-snug mb-2">{post.title}</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/30 text-[10px]">@{post.author.handle} · {post.createdAt}</div>
            <div className="font-mono text-[9px] text-purple-400/40 mt-0.5">{post.blobId}</div>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.06 }} transition={{ duration: 0.15, ease: "easeOut" }} onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl text-xs font-medium border transition-all"
            style={{ padding: "5px 10px", background: "rgba(139,92,246,0.2)", borderColor: "rgba(139,92,246,0.4)", color: "#c4b5fd" }}>
            <span>⊞</span><span>Saved</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Mini Upload Card (my uploads) ────────────────────────────── */
function UploadCard({ post, onDelete }: { post: UploadedPost; onDelete: () => void }) {
  const handleDelete = () => { deleteUpload(post.id); onDelete(); };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      className="relative rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-0 h-0"
          style={{ borderStyle: "solid", borderWidth: "0 24px 24px 0", borderColor: "transparent rgba(139,92,246,0.2) transparent transparent" }} />
      </div>
      <div style={{ padding: "14px 18px" }}>
        <h3 className="text-white font-semibold text-sm leading-snug mb-1.5">{post.title}</h3>
        <p className="text-white/40 text-xs leading-relaxed mb-2">{post.summary}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-white/25 text-[10px]">{post.fileName} · {post.createdAt}</div>
            <div className="font-mono text-[9px] text-purple-400/40 mt-0.5 truncate">{post.blobId}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center text-xs font-medium rounded-xl"
              style={{ padding: "5px 10px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)", color: "rgba(74,222,128,0.8)" }}>
              Published
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.08 }} transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={handleDelete}
              className="flex items-center gap-1 rounded-xl text-xs font-medium border"
              style={{ padding: "5px 10px", background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)", color: "rgba(239,68,68,0.6)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              <span>Delete</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { connected, account, wallet } = useWallet();
  const [tab, setTab] = useState<"saved" | "uploads" | "apikey">("saved");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [uploads, setUploads] = useState<UploadedPost[]>([]);
  const [username, setUsername] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [handle, setHandle] = useState("");
  const [editingHandle, setEditingHandle] = useState(false);
  const [handleInput, setHandleInput] = useState("");

  useEffect(() => {
    setSavedIds(getSavedIds());
    setUploads(getUploads());
    const savedName = localStorage.getItem("ai_corpus_username") ?? "";
    const savedHandle = localStorage.getItem("ai_corpus_handle") ?? "";
    setUsername(savedName);
    setUsernameInput(savedName);
    setHandle(savedHandle);
    setHandleInput(savedHandle);
    localStorage.setItem("ai_corpus_avatar_shape", "star");
    localStorage.setItem("ai_corpus_avatar_color1", "#F59E0B");
    localStorage.setItem("ai_corpus_avatar_color2", "#EF4444");
  }, []);

  const saveUsername = () => {
    const trimmed = usernameInput.trim();
    setUsername(trimmed);
    localStorage.setItem("ai_corpus_username", trimmed);
    setEditingUsername(false);
  };

  const saveHandle = () => {
    const trimmed = handleInput.trim().replace(/^@/, "");
    setHandle(trimmed);
    localStorage.setItem("ai_corpus_handle", trimmed);
    setEditingHandle(false);
  };

  const savedPosts = FEED_POSTS.filter(p => savedIds.includes(p.id));
  const handleUnsave = (id: string) => setSavedIds(prev => prev.filter(x => x !== id));

  const address = account?.address?.toString() ?? "";
  const shortAddress = address ? truncateAddress(address) : "";
  const initials = shortAddress ? shortAddress.slice(2, 4).toUpperCase() : "?";

  return (
    <div className="min-h-screen">
      <Nav />

      {/* Cover */}
      <div className="pt-20 relative overflow-hidden" style={{ height: 180, zIndex: 0 }}>
        {/* Base */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0720 0%, #1a0a2e 40%, #0d1020 100%)" }} />
        {/* Orb left */}
        <div className="absolute" style={{ width: 340, height: 340, borderRadius: "50%", top: -120, left: -60, background: "radial-gradient(circle, rgba(109,40,217,0.55) 0%, rgba(109,40,217,0) 70%)", filter: "blur(8px)" }} />
        {/* Orb center */}
        <div className="absolute" style={{ width: 280, height: 280, borderRadius: "50%", top: -80, left: "42%", background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0) 70%)", filter: "blur(12px)" }} />
        {/* Orb right */}
        <div className="absolute" style={{ width: 320, height: 320, borderRadius: "50%", top: -100, right: -80, background: "radial-gradient(circle, rgba(217,70,239,0.45) 0%, rgba(217,70,239,0) 70%)", filter: "blur(10px)" }} />
        {/* Subtle grid */}
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.8 }} />
        {/* Bottom fade */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(10,6,18,0.85) 100%)" }} />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* Avatar */}
        <div style={{ marginTop: -40, marginBottom: 20 }}>
          {address ? (
            <ProfileAvatar address={address} size={80} />
          ) : (
            <div className="flex items-center justify-center text-2xl font-black text-white"
              style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "4px solid #0a0612" }}>
              ?
            </div>
          )}
        </div>

        {/* Identity */}
        <div style={{ marginBottom: 28 }}>
          {connected ? (
            <>
              {/* Display name */}
              {editingUsername ? (
                <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                  <input autoFocus value={usernameInput} onChange={e => setUsernameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveUsername(); if (e.key === "Escape") setEditingUsername(false); }}
                    placeholder="Display name..."
                    className="text-white font-bold text-xl bg-transparent outline-none border-b"
                    style={{ borderColor: "rgba(139,92,246,0.5)", minWidth: 140 }} />
                  <button onClick={saveUsername} className="text-xs font-medium px-3 py-1 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)" }}>Save</button>
                  <button onClick={() => setEditingUsername(false)} className="text-xs text-white/30 hover:text-white/60 transition-colors">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                  <h1 className={`font-bold text-xl ${username ? "text-white" : "text-white/30"}`}>
                    {username || "Enter display name"}
                  </h1>
                  <button onClick={() => setEditingUsername(true)} className="text-white/25 hover:text-white/60 transition-colors" title="Edit name">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* Handle */}
              {editingHandle ? (
                <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                  <span className="text-white/40 text-sm font-mono">@</span>
                  <input autoFocus value={handleInput} onChange={e => setHandleInput(e.target.value.replace(/^@/, ""))}
                    onKeyDown={e => { if (e.key === "Enter") saveHandle(); if (e.key === "Escape") setEditingHandle(false); }}
                    placeholder="handle"
                    className="text-white/70 text-sm font-mono bg-transparent outline-none border-b"
                    style={{ borderColor: "rgba(139,92,246,0.4)", minWidth: 100 }} />
                  <button onClick={saveHandle} className="text-xs font-medium px-3 py-1 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)" }}>Save</button>
                  <button onClick={() => setEditingHandle(false)} className="text-xs text-white/30 hover:text-white/60 transition-colors">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <span className={`font-mono text-sm ${handle ? "text-white/50" : "text-white/20"}`}>
                    {handle ? `@${handle}` : "Set a handle"}
                  </span>
                  <button onClick={() => setEditingHandle(true)} className="text-white/20 hover:text-white/50 transition-colors" title="Edit handle">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              )}

              <div className="font-mono text-white/25 text-xs">{shortAddress}</div>
            </>
          ) : (
            <div className="text-white/30 text-sm">Connect your wallet to view your profile.</div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 24 }}>
          {([
            { key: "saved",   label: `Saved Files${savedPosts.length > 0 ? ` (${savedPosts.length})` : ""}` },
            { key: "uploads", label: `My Uploads${uploads.length > 0 ? ` (${uploads.length})` : ""}` },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="relative text-sm font-medium transition-colors"
              style={{ padding: "10px 20px", color: tab === t.key ? "#fff" : "rgba(255,255,255,0.35)" }}>
              {t.label}
              {tab === t.key && (
                <motion.div layoutId="profile-tab"
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: 2, background: "linear-gradient(90deg,#8B5CF6,#EC4899)" }} />
              )}
            </button>
          ))}

          {/* API Key tab */}
          <button onClick={() => setTab("apikey")}
            className="relative flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ padding: "10px 20px", color: tab === "apikey" ? "#fff" : "rgba(255,255,255,0.35)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            API Key
            {tab === "apikey" && (
              <motion.div layoutId="profile-tab"
                className="absolute bottom-0 left-0 right-0"
                style={{ height: 2, background: "linear-gradient(90deg,#8B5CF6,#EC4899)" }} />
            )}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {tab === "saved" && (
            <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {savedPosts.length === 0 ? (
                <div className="text-center py-20 text-white/25 text-sm">
                  No saved files yet. Save posts from Content Discovery.
                </div>
              ) : (
                <div className="grid gap-3">
                  <AnimatePresence>
                    {savedPosts.map(post => (
                      <SavedCard key={post.id} post={post} onUnsave={handleUnsave} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {tab === "uploads" && (
            <motion.div key="uploads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {uploads.length === 0 ? (
                <div className="text-center py-20 text-white/25 text-sm">
                  No uploads yet. Upload your first .md file.
                </div>
              ) : (
                <div className="grid gap-3">
                  <AnimatePresence>
                  {uploads.map(post => (
                    <UploadCard
                      key={post.id}
                      post={post}
                      onDelete={() => setUploads(getUploads())}
                    />
                  ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {tab === "apikey" && (
            <motion.div key="apikey" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col items-center justify-center" style={{ paddingTop: 64, paddingBottom: 64 }}>
                {/* Icon */}
                <div className="flex items-center justify-center rounded-2xl mb-6"
                  style={{ width: 64, height: 64, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                  </svg>
                </div>

                {/* Badge */}
                <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full"
                  style={{ marginTop: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 6px rgba(167,139,250,0.8)", animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#a78bfa" }}>COMING SOON</span>
                </div>

                <h3 className="text-white font-bold text-xl" style={{ marginTop: 8 }}>API Key Management</h3>

                <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.35)", maxWidth: 340, lineHeight: 1.8, marginTop: 12 }}>
                  Generate and manage personal API keys so AI systems can access your uploaded files as knowledge sources.
                </p>

                {/* Mock key input */}
                <div className="flex items-center gap-3 w-full" style={{ maxWidth: 400, marginTop: 32 }}>
                  <div className="flex-1 flex items-center rounded-xl px-4"
                    style={{ height: 44, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em" }}>
                      sk_live_••••••••••••••••••••
                    </span>
                  </div>
                  <div className="flex items-center justify-center rounded-xl text-xs font-semibold"
                    style={{ height: 44, padding: "0 20px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "rgba(139,92,246,0.5)", whiteSpace: "nowrap" }}>
                    Generate
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ height: 60 }} />
      </div>
    </div>
  );
}
