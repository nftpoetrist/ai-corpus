"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
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
  const ls = typeof window !== "undefined" ? window.localStorage : null;
  const shape  = ls?.getItem("ai_corpus_avatar_shape")  || derived.shape;
  const color1 = ls?.getItem("ai_corpus_avatar_color1") || derived.colors[0];
  const color2 = ls?.getItem("ai_corpus_avatar_color2") || derived.colors[1];
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
import { getSavedIds, toggleSaved, SAVED_KEY, getSavedPostsData, removeSavedPostData } from "@/lib/posts";
import type { Post } from "@/lib/posts";
import type { DbPost } from "@/lib/supabase";

/* ─── Glass Saved Card ──────────────────────────────────────────── */
function SavedCard({ post, onUnsave }: { post: Post; onUnsave: (id: string) => void }) {
  const p = `sc-${post.id}`;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      style={{ position: "relative", aspectRatio: "1000 / 560", isolation: "isolate" }}>

      {/* Glass SVG shell */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 560"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.5)) drop-shadow(0 6px 14px rgba(100,70,140,0.18))" }}>
        <defs>
          <linearGradient id={`bf-${p}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D6BBD3" stopOpacity="0.52" /><stop offset="0.35" stopColor="#A98DA8" stopOpacity="0.52" />
            <stop offset="0.55" stopColor="#7B6582" stopOpacity="0.58" /><stop offset="1" stopColor="#3C2E45" stopOpacity="0.70" />
          </linearGradient>
          <radialGradient id={`bg-${p}`} cx="0.5" cy="0.35" r="0.85">
            <stop offset="0" stopColor="#EAD6EB" stopOpacity="0.38" /><stop offset="0.7" stopColor="#7A6280" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`sh-${p}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.50" /><stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`ro-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.90" /><stop offset="0.4" stopColor="#E2CFE6" stopOpacity="0.45" />
            <stop offset="0.75" stopColor="#FFFFFF" stopOpacity="0.15" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0.50" />
          </linearGradient>
          <linearGradient id={`rm-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.50" /><stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id={`ri-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" /><stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id={`cf-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F2D8EE" stopOpacity="0.95" /><stop offset="0.55" stopColor="#B596B4" stopOpacity="0.95" />
            <stop offset="1" stopColor="#5A4263" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={`ce-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0.22" />
          </linearGradient>
          <radialGradient id={`cs-${p}`} cx="0.4" cy="0.2" r="0.9">
            <stop offset="0" stopColor="#000000" stopOpacity="0.38" /><stop offset="1" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id={`hl-${p}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="42" /></filter>
          <clipPath id={`bc-${p}`}><path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" /></clipPath>
        </defs>
        <ellipse cx="500" cy="300" rx="460" ry="210" fill="#9D7FB0" opacity="0.10" filter={`url(#hl-${p})`} />
        <path d="M 50 22 H 880 L 974 116 V 498 Q 974 530 942 530 H 50 Q 18 530 18 498 V 54 Q 18 22 50 22 Z" fill="#2A2138" fillOpacity="0.42" />
        <path d="M 50 22 H 880 L 974 116 V 498 Q 974 530 942 530 H 50 Q 18 530 18 498 V 54 Q 18 22 50 22 Z" fill="none" stroke={`url(#ro-${p})`} strokeWidth="1.6" />
        <path d="M 56 26 H 882 L 970 114 V 494 Q 970 524 940 524 H 56 Q 24 524 24 494 V 58 Q 24 26 56 26 Z" fill="none" stroke={`url(#rm-${p})`} strokeWidth="1.2" />
        <path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" fill={`url(#bf-${p})`} />
        <path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" fill={`url(#bg-${p})`} />
        <g clipPath={`url(#bc-${p})`}>
          <path d="M 30 30 H 964 V 300 H 30 Z" fill={`url(#sh-${p})`} opacity="0.9" />
          <path d="M 884 110 L 884 30 L 964 110 Z" fill={`url(#cs-${p})`} transform="translate(-6 8)" />
        </g>
        <path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" fill="none" stroke={`url(#ri-${p})`} strokeWidth="1.2" />
        <path d="M 76 46 H 878 L 948 116 V 480 Q 948 504 924 504 H 76 Q 46 504 46 480 V 76 Q 46 46 76 46 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        <path d="M 884 30 L 964 110 L 884 110 Z" fill={`url(#cf-${p})`} />
        <path d="M 884 30 L 964 110" stroke={`url(#ce-${p})`} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 884 110 L 964 110" stroke="rgba(255,255,255,0.42)" strokeWidth="1" strokeLinecap="round" />
        <path d="M 884 30 L 884 110" stroke="rgba(255,255,255,0.38)" strokeWidth="1" strokeLinecap="round" />
        <path d="M 894 40 L 954 100 L 894 100 Z" fill="rgba(255,230,245,0.16)" />
        <path d="M 892 38 L 956 102" stroke="rgba(255,255,255,0.82)" strokeWidth="1.2" strokeLinecap="round" opacity="0.82" />
        <path d="M 70 24 H 878" stroke="rgba(255,255,255,0.55)" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
        <path d="M 70 528 H 932" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />
      </svg>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: "6% 14% 6% 6%" }}>

        {/* Top: author + tags */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>@{post.author.handle}</span>
          {post.tags.slice(0, 2).map(tag => (
            <span key={tag} style={{ fontSize: 8, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
              background: "rgba(139,92,246,0.22)", border: "1px solid rgba(139,92,246,0.32)", color: "#d8b4fe", letterSpacing: "0.04em" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Center: title + summary */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "6px 0" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", lineHeight: 1.3, marginBottom: 5,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const }}>
            {post.title}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.65,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
            {post.summary}
          </div>
        </div>

        {/* Bottom: blob ID + unsave button */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.18)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "55%" }}>
            {post.blobId.slice(0, 22)}…
          </div>
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }} transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => {
              toggleSaved(post.id);
              fetch(`/api/saved?id=${post.id}`, { method: "DELETE" }).catch(() => {});
              onUnsave(post.id);
            }}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8,
              fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.38)", color: "#c4b5fd" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            Saved
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Glass Upload Card (my uploads) ───────────────────────────── */
function UploadCard({ post, onDelete }: { post: DbPost; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const p = `uc-${post.id}`;
  const vis = post.visibility ?? "Public";
  const visColor = vis === "Public" ? { bg: "rgba(34,197,94,0.18)", border: "rgba(34,197,94,0.35)", text: "#4ade80", icon: "🌐" }
    : vis === "Unlisted" ? { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", text: "#fbbf24", icon: "🔗" }
    : { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)", text: "#f87171", icon: "🔒" };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) onDelete();
      else setConfirmDelete(false);
    } catch {
      setConfirmDelete(false);
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      style={{ position: "relative", aspectRatio: "1000 / 560", isolation: "isolate" }}>

      {/* Glass SVG shell */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 560"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.5)) drop-shadow(0 6px 14px rgba(100,70,140,0.18))" }}>
        <defs>
          <linearGradient id={`bf-${p}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D6BBD3" stopOpacity="0.52" />
            <stop offset="0.35" stopColor="#A98DA8" stopOpacity="0.52" />
            <stop offset="0.55" stopColor="#7B6582" stopOpacity="0.58" />
            <stop offset="1" stopColor="#3C2E45" stopOpacity="0.70" />
          </linearGradient>
          <radialGradient id={`bg-${p}`} cx="0.5" cy="0.35" r="0.85">
            <stop offset="0" stopColor="#EAD6EB" stopOpacity="0.38" />
            <stop offset="0.7" stopColor="#7A6280" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`sh-${p}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.50" />
            <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`ro-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.90" />
            <stop offset="0.4" stopColor="#E2CFE6" stopOpacity="0.45" />
            <stop offset="0.75" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.50" />
          </linearGradient>
          <linearGradient id={`rm-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.50" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id={`ri-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id={`cf-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F2D8EE" stopOpacity="0.95" />
            <stop offset="0.55" stopColor="#B596B4" stopOpacity="0.95" />
            <stop offset="1" stopColor="#5A4263" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={`ce-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.22" />
          </linearGradient>
          <radialGradient id={`cs-${p}`} cx="0.4" cy="0.2" r="0.9">
            <stop offset="0" stopColor="#000000" stopOpacity="0.38" />
            <stop offset="1" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id={`hl-${p}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="42" /></filter>
          <clipPath id={`bc-${p}`}><path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" /></clipPath>
        </defs>
        <ellipse cx="500" cy="300" rx="460" ry="210" fill="#9D7FB0" opacity="0.10" filter={`url(#hl-${p})`} />
        <path d="M 50 22 H 880 L 974 116 V 498 Q 974 530 942 530 H 50 Q 18 530 18 498 V 54 Q 18 22 50 22 Z" fill="#2A2138" fillOpacity="0.42" />
        <path d="M 50 22 H 880 L 974 116 V 498 Q 974 530 942 530 H 50 Q 18 530 18 498 V 54 Q 18 22 50 22 Z" fill="none" stroke={`url(#ro-${p})`} strokeWidth="1.6" />
        <path d="M 56 26 H 882 L 970 114 V 494 Q 970 524 940 524 H 56 Q 24 524 24 494 V 58 Q 24 26 56 26 Z" fill="none" stroke={`url(#rm-${p})`} strokeWidth="1.2" />
        <path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" fill={`url(#bf-${p})`} />
        <path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" fill={`url(#bg-${p})`} />
        <g clipPath={`url(#bc-${p})`}>
          <path d="M 30 30 H 964 V 300 H 30 Z" fill={`url(#sh-${p})`} opacity="0.9" />
          <path d="M 884 110 L 884 30 L 964 110 Z" fill={`url(#cs-${p})`} transform="translate(-6 8)" />
        </g>
        <path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" fill="none" stroke={`url(#ri-${p})`} strokeWidth="1.2" />
        <path d="M 76 46 H 878 L 948 116 V 480 Q 948 504 924 504 H 76 Q 46 504 46 480 V 76 Q 46 46 76 46 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        <path d="M 884 30 L 964 110 L 884 110 Z" fill={`url(#cf-${p})`} />
        <path d="M 884 30 L 964 110" stroke={`url(#ce-${p})`} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 884 110 L 964 110" stroke="rgba(255,255,255,0.42)" strokeWidth="1" strokeLinecap="round" />
        <path d="M 884 30 L 884 110" stroke="rgba(255,255,255,0.38)" strokeWidth="1" strokeLinecap="round" />
        <path d="M 894 40 L 954 100 L 894 100 Z" fill="rgba(255,230,245,0.16)" />
        <path d="M 892 38 L 956 102" stroke="rgba(255,255,255,0.82)" strokeWidth="1.2" strokeLinecap="round" opacity="0.82" />
        <path d="M 70 24 H 878" stroke="rgba(255,255,255,0.55)" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
        <path d="M 70 528 H 932" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />
      </svg>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: "6% 14% 6% 6%" }}>

        {/* Top: visibility badge + date */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999,
            background: visColor.bg, border: `1px solid ${visColor.border}` }}>
            <span style={{ fontSize: 8 }}>{visColor.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: visColor.text, letterSpacing: "0.04em" }}>{vis.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        </div>

        {/* Center: title + summary */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "6px 0" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", lineHeight: 1.3, marginBottom: 5,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const }}>
            {post.title}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.65,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
            {post.summary}
          </div>
        </div>

        {/* Bottom: blob ID + delete */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.18)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "55%" }}>
            {post.blob_name.slice(0, 22)}…
          </div>
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }} transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={handleDelete}
            onBlur={() => setConfirmDelete(false)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              background: confirmDelete ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${confirmDelete ? "rgba(239,68,68,0.55)" : "rgba(239,68,68,0.25)"}`,
              color: confirmDelete ? "#f87171" : "rgba(239,68,68,0.55)",
            }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
            {confirmDelete ? "Confirm?" : "Delete"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

const PROFILE_SHAPES = ["hex","diamond","ring","pentagon","star","octagon","triangle","roundsq"];
const PROFILE_PALETTES: [string,string][] = [
  ["#7C3AED","#4F46E5"],["#DB2777","#9333EA"],["#0EA5E9","#6366F1"],
  ["#10B981","#3B82F6"],["#F59E0B","#EF4444"],["#8B5CF6","#EC4899"],
  ["#06B6D4","#7C3AED"],["#F97316","#A855F7"],
];

/* ─── Page ──────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { connected, account, wallet, signMessage } = useWallet();
  const [tab, setTab] = useState<"saved" | "uploads" | "apikey">("saved");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [uploads, setUploads] = useState<DbPost[]>([]);
  const [apiKey, setApiKey] = useState<{ key?: string; label: string; created_at: string; last_used_at: string | null } | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyGenerating, setApiKeyGenerating] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [username, setUsername] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [handle, setHandle] = useState("");
  const [editingHandle, setEditingHandle] = useState(false);
  const [handleInput, setHandleInput] = useState("");
  function dbToPost(p: DbPost): Post {
    const n = parseInt(p.author_address.slice(2, 10) || "0", 16) || 0;
    return {
      id: p.id, title: p.title, summary: p.summary, tags: p.tags,
      author: {
        name: `${p.author_address.slice(0, 6)}...${p.author_address.slice(-4)}`,
        handle: p.author_address.slice(2, 8),
        color1: PROFILE_PALETTES[n % 8][0], color2: PROFILE_PALETTES[n % 8][1],
        shape: PROFILE_SHAPES[n % 8], address: p.author_address,
      },
      reads: String(p.reads), likes: p.likes, tips: p.tips,
      blobId: p.blob_name,
      createdAt: new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fileSize: p.file_size ?? "—", lines: p.lines,
    };
  }

  const fetchUploads = async (address: string) => {
    const res = await fetch(`/api/posts?author=${address}`);
    if (!res.ok) return;
    const { posts } = await res.json() as { posts: DbPost[] };
    setUploads(posts ?? []);
  };

  const loadSavedPosts = () => {
    const posts = getSavedPostsData();
    setSavedPosts(posts);
    setSavedIds(posts.map(p => p.id));
  };

  useEffect(() => {
    loadSavedPosts();
    const savedName = localStorage.getItem("ai_corpus_username") ?? "";
    const savedHandle = localStorage.getItem("ai_corpus_handle") ?? "";
    setUsername(savedName);
    setUsernameInput(savedName);
    setHandle(savedHandle);
    setHandleInput(savedHandle);
  }, []);

  useEffect(() => {
    if (account?.address) {
      fetchUploads(account.address.toString());
      checkSession();
    } else {
      setIsAuthenticated(false);
      setAuthChecking(false);
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
  }, [account]);

  const fetchApiKey = async () => {
    setApiKeyLoading(true);
    try {
      const res = await fetch("/api/apikeys");
      const { key } = await res.json();
      setApiKey(key);
    } finally {
      setApiKeyLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      setIsAuthenticated(res.ok);
    } finally {
      setAuthChecking(false);
    }
  };

  const authenticate = async () => {
    if (!account?.address || !signMessage || authLoading) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const address = account.address.toString().toLowerCase();

      // Step 1: Get challenge nonce from server
      const challengeRes = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const { nonce, error: challengeErr } = await challengeRes.json();
      if (challengeErr || !nonce) throw new Error(challengeErr ?? "Failed to get challenge");

      // Step 2: Sign the nonce with wallet
      const signResult = await signMessage({ message: nonce, nonce: "1" });
      if (!signResult) throw new Error("Signing cancelled");

      // Step 3: Send signature to server for verification
      const rawSig = signResult.signature;
      const sigHex = Array.isArray(rawSig)
        ? (typeof rawSig[0] === "string" ? rawSig[0] : String(rawSig[0]))
        : String(rawSig);

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          nonce,
          signature: sigHex,
          publicKey: account.publicKey?.toString() ?? "",
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error ?? "Authentication failed");

      setIsAuthenticated(true);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!account?.address || apiKeyGenerating) return;
    setApiKeyGenerating(true);
    try {
      const newKey = "aicc_" + Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map((b) => b.toString(16).padStart(2, "0")).join("");
      const res = await fetch("/api/apikeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey, label: "Default" }),
      });
      const { key, error } = await res.json();
      if (error) throw new Error(error);
      // DB stores hash — preserve plaintext in state so user can copy it
      setApiKey({ ...key, key: newKey });
      setApiKeyRevealed(true);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Failed to generate API key");
    } finally {
      setApiKeyGenerating(false);
    }
  };

  const revokeApiKey = async () => {
    if (!account?.address || apiKeyGenerating) return;
    setApiKeyGenerating(true);
    try {
      await fetch("/api/apikeys", { method: "DELETE" });
      setApiKey(null);
      setApiKeyRevealed(false);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Failed to revoke API key");
    } finally {
      setApiKeyGenerating(false);
    }
  };

  const copyApiKey = () => {
    if (!apiKey?.key) return;
    navigator.clipboard.writeText(apiKey.key);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

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

  const handleUnsave = (id: string) => {
    toggleSaved(id);
    removeSavedPostData(id);
    setSavedIds(prev => prev.filter(x => x !== id));
    setSavedPosts(prev => prev.filter(p => p.id !== id));
  };

  const address = account?.address?.toString() ?? "";
  const shortAddress = address ? truncateAddress(address) : "";
  const initials = shortAddress ? shortAddress.slice(2, 4).toUpperCase() : "?";

  useEffect(() => {
    if (tab === "saved") loadSavedPosts();
  }, [tab]);

  // Fetch API key metadata when tab is active and user is authenticated
  useEffect(() => {
    if (tab === "apikey" && isAuthenticated && !apiKey && !apiKeyLoading) {
      fetchApiKey();
    }
  }, [tab, isAuthenticated]);

  return (
    <div className="min-h-screen">
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
            { key: "uploads" as const, label: `My Uploads${uploads.length > 0 ? ` (${uploads.length})` : ""}` },
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <AnimatePresence>
                  {uploads.map(post => (
                    <UploadCard
                      key={post.id}
                      post={post}
                      onDelete={() => account?.address && fetchUploads(account.address.toString())}
                    />
                  ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {tab === "apikey" && (
            <motion.div key="apikey" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 560 }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 6 }}>API Key</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
                    Use this key to let Claude (or any AI) read your uploaded files via the corpus endpoint.
                  </p>
                </div>

                {/* Auth wall */}
                {!authChecking && !isAuthenticated && (
                  <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, padding: "24px", marginBottom: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Wallet Authentication Required</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20, lineHeight: 1.6 }}>
                      Sign a one-time message with your wallet to prove ownership.<br />You won{"'"}t be asked again for 24 hours.
                    </div>
                    {authError && (
                      <div style={{ fontSize: 12, color: "#f87171", marginBottom: 12, padding: "8px 14px", background: "rgba(239,68,68,0.08)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
                        {authError}
                      </div>
                    )}
                    <motion.button onClick={authenticate} disabled={authLoading || !connected}
                      whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(139,92,246,0.45)" }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.14 }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 32px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                        cursor: connected && !authLoading ? "pointer" : "not-allowed",
                        background: connected ? "linear-gradient(135deg,#7C3AED,#EC4899)" : "rgba(255,255,255,0.06)",
                        color: connected ? "#fff" : "rgba(255,255,255,0.25)", border: "none" }}>
                      {authLoading
                        ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#fff", borderRightColor: "#fff" }} />
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      }
                      {!connected ? "Connect wallet first" : authLoading ? "Waiting for signature..." : "Authenticate Wallet"}
                    </motion.button>
                  </div>
                )}

                {/* Key card */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, opacity: isAuthenticated || authChecking ? 1 : 0.35, pointerEvents: isAuthenticated ? "auto" : "none" }}>
                  {apiKeyLoading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#a78bfa", borderRightColor: "#a78bfa" }} />
                      Loading...
                    </div>
                  ) : apiKey ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>YOUR API KEY</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                            Created {new Date(apiKey.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          {apiKey.last_used_at && (
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                              · Last used {new Date(apiKey.last_used_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Key display */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                        <span style={{ flex: 1, fontFamily: "monospace", fontSize: 12, color: apiKey.key ? "#d8b4fe" : "rgba(255,255,255,0.25)", letterSpacing: "0.05em", wordBreak: "break-all" }}>
                          {apiKey.key
                            ? (apiKeyRevealed ? apiKey.key : `aicc_${"•".repeat(40)}`)
                            : `aicc_${"•".repeat(40)} — regenerate to copy`}
                        </span>
                        {apiKey.key && (
                          <button onClick={() => setApiKeyRevealed(v => !v)}
                            style={{ flexShrink: 0, color: "rgba(255,255,255,0.3)", cursor: "pointer", background: "none", border: "none", padding: 4 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              {apiKeyRevealed
                                ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                              }
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <motion.button onClick={copyApiKey} disabled={!apiKey?.key}
                          whileHover={{ scale: apiKey?.key ? 1.03 : 1 }} whileTap={{ scale: apiKey?.key ? 0.97 : 1 }} transition={{ duration: 0.12 }}
                          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 38, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: apiKey?.key ? "pointer" : "not-allowed",
                            background: apiKeyCopied ? "rgba(34,197,94,0.15)" : apiKey?.key ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${apiKeyCopied ? "rgba(34,197,94,0.35)" : apiKey?.key ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)"}`,
                            color: apiKeyCopied ? "#4ade80" : apiKey?.key ? "#d8b4fe" : "rgba(255,255,255,0.2)" }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            {apiKeyCopied
                              ? <path d="M20 6L9 17l-5-5"/>
                              : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>
                            }
                          </svg>
                          {apiKeyCopied ? "Copied!" : "Copy Key"}
                        </motion.button>
                        <motion.button onClick={generateApiKey} disabled={apiKeyGenerating}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }}
                          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 38, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: apiKeyGenerating ? "not-allowed" : "pointer",
                            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
                          {apiKeyGenerating
                            ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#a78bfa", borderRightColor: "#a78bfa" }} />
                            : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                          }
                          Regenerate
                        </motion.button>
                        <motion.button onClick={revokeApiKey} disabled={apiKeyGenerating}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }}
                          style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.5)" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                          </svg>
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
                        No API key yet. Generate one to enable corpus access.
                      </div>
                      <motion.button onClick={generateApiKey} disabled={apiKeyGenerating || !connected}
                        whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(139,92,246,0.4)" }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.14 }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 28px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: connected ? "pointer" : "not-allowed",
                          background: connected ? "linear-gradient(135deg,#7C3AED,#EC4899)" : "rgba(255,255,255,0.06)",
                          color: connected ? "#fff" : "rgba(255,255,255,0.25)", border: "none" }}>
                        {apiKeyGenerating
                          ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#fff", borderRightColor: "#fff" }} />
                          : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                        }
                        {!connected ? "Connect wallet first" : apiKeyGenerating ? "Signing..." : "Generate API Key"}
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Usage examples */}
                <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>USAGE EXAMPLES</div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>List your files:</div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#a78bfa", background: "rgba(139,92,246,0.08)", borderRadius: 8, padding: "8px 12px", wordBreak: "break-all", lineHeight: 1.8 }}>
                      GET /api/corpus<br />
                      Authorization: Bearer {apiKey?.key ?? "<your-key>"}
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Read specific file content:</div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#a78bfa", background: "rgba(139,92,246,0.08)", borderRadius: 8, padding: "8px 12px", wordBreak: "break-all", lineHeight: 1.8 }}>
                      GET /api/corpus?id={"<postId>"}<br />
                      Authorization: Bearer {apiKey?.key ?? "<your-key>"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Use with Claude API (tool definition):</div>
                    <div style={{ fontFamily: "monospace", fontSize: 10, color: "#94a3b8", background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "10px 12px", lineHeight: 1.7, whiteSpace: "pre" }}>{`{
  "name": "read_corpus",
  "description": "Read files from AI Corpus",
  "input_schema": {
    "type": "object",
    "properties": {
      "id": { "type": "string" }
    }
  }
}`}</div>
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
