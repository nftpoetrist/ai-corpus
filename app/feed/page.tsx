"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { Nav } from "@/components/ui";
import { FEED_POSTS, toggleSaved, getSavedIds, toggleLiked, getLikedIds, getUploads, deleteUpload } from "@/lib/posts";
import type { Post } from "@/lib/posts";
import { TipModal } from "@/components/TipModal";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const SHAPES = ["hex","diamond","ring","pentagon","star","octagon","triangle","roundsq"];
const PALETTES: [string,string][] = [
  ["#7C3AED","#4F46E5"],["#DB2777","#9333EA"],["#0EA5E9","#6366F1"],
  ["#10B981","#3B82F6"],["#F59E0B","#EF4444"],["#8B5CF6","#EC4899"],
  ["#06B6D4","#7C3AED"],["#F97316","#A855F7"],
];
function deriveAvatar(address: string) {
  const n = parseInt(address.slice(2, 10) || "0", 16) || 0;
  return { shape: SHAPES[n % SHAPES.length], colors: PALETTES[n % PALETTES.length] };
}


/* ─── Geometric Avatar ──────────────────────────────────────────── */
function GeoAvatar({ uid, color1, color2, shape, size = 42 }: {
  uid: string; color1: string; color2: string; shape: string; size?: number;
}) {
  const gid = `av-${uid}`;
  const c = size / 2;
  const r = size / 2 - 2;

  const shapeEl = (() => {
    switch (shape) {
      case "hex": {
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (i * 60 - 90) * Math.PI / 180;
          return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`;
        }).join(" ");
        return <polygon points={pts} fill={`url(#${gid})`} />;
      }
      case "diamond":
        return <polygon points={`${c},2 ${size - 2},${c} ${c},${size - 2} 2,${c}`} fill={`url(#${gid})`} />;
      case "ring":
        return (
          <>
            <circle cx={c} cy={c} r={r} fill={`url(#${gid})`} />
            <circle cx={c} cy={c} r={r * 0.52} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <circle cx={c} cy={c} r={r * 0.18} fill="rgba(255,255,255,0.55)" />
          </>
        );
      case "pentagon": {
        const pts = Array.from({ length: 5 }, (_, i) => {
          const a = (i * 72 - 90) * Math.PI / 180;
          return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`;
        }).join(" ");
        return <polygon points={pts} fill={`url(#${gid})`} />;
      }
      case "star": {
        const inner = r * 0.42;
        const pts = Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 - 90) * Math.PI / 180;
          const rad = i % 2 === 0 ? r : inner;
          return `${c + rad * Math.cos(a)},${c + rad * Math.sin(a)}`;
        }).join(" ");
        return <polygon points={pts} fill={`url(#${gid})`} />;
      }
      case "octagon": {
        const pts = Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 + 22.5) * Math.PI / 180;
          return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`;
        }).join(" ");
        return <polygon points={pts} fill={`url(#${gid})`} />;
      }
      case "triangle":
        return <polygon points={`${c},3 ${size - 3},${size - 3} 3,${size - 3}`} fill={`url(#${gid})`} />;
      case "roundsq":
        return <rect x="2" y="2" width={size - 4} height={size - 4} rx={size * 0.22} fill={`url(#${gid})`} />;
      default:
        return <circle cx={c} cy={c} r={r} fill={`url(#${gid})`} />;
    }
  })();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color1} />
          <stop offset="1" stopColor={color2} />
        </linearGradient>
      </defs>
      {shapeEl}
    </svg>
  );
}

/* ─── Action Buttons ─────────────────────────────────────────────── */
function ActionButtons({ post, isOwned, onDelete }: { post: Post; isOwned: boolean; onDelete?: () => void }) {
  const [liked, setLiked] = useState(() => getLikedIds().includes(post.id));
  const [saved, setSaved] = useState(() => getSavedIds().includes(post.id));
  const [tipOpen, setTipOpen] = useState(false);
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  const handleSave = () => { toggleSaved(post.id); setSaved(s => !s); };
  const handleLike = () => { toggleLiked(post.id); setLiked(l => !l); };
  const handleDelete = () => { deleteUpload(post.id); onDelete?.(); };

  return (
    <>
      <div className="flex items-center gap-2">
        <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }} transition={{ duration: 0.15, ease: "easeOut" }} onClick={handleLike}
          className={`inline-flex flex-col items-center justify-center gap-1 rounded-2xl text-sm font-medium border transition-colors duration-150 ${
            liked ? "bg-pink-500/25 border-pink-400/50 text-pink-200" : "bg-white/8 border-white/20 text-white/60 hover:text-white/90 hover:bg-white/12"
          }`} style={{ width: 54, height: 54 }}>
          <span className="text-base leading-none">{liked ? "♥" : "♡"}</span>
          <span className="text-[11px]">{fmt(post.likes + (liked ? 1 : 0))}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1, boxShadow: "0 0 22px rgba(139,92,246,0.55)" }} transition={{ duration: 0.15, ease: "easeOut" }} onClick={() => setTipOpen(true)}
          className="inline-flex items-center justify-center rounded-2xl text-sm font-semibold border-0"
          style={{ width: 54, height: 54, background: "linear-gradient(135deg,#7C3AED,#EC4899)", color: "#fff" }}>
          Tip
        </motion.button>

        <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }} transition={{ duration: 0.15, ease: "easeOut" }} onClick={handleSave}
          className={`inline-flex flex-col items-center justify-center gap-1 rounded-2xl text-sm font-medium border transition-colors duration-150 ${
            saved ? "bg-purple-500/25 border-purple-400/50 text-purple-200" : "bg-white/8 border-white/20 text-white/60 hover:text-white/90 hover:bg-white/12"
          }`} style={{ width: 54, height: 54 }}>
          <span className="text-base leading-none">{saved ? "⊞" : "⊟"}</span>
          <span className="text-[11px]">{saved ? "Saved" : "Save"}</span>
        </motion.button>

        {isOwned && (
          <motion.button
            whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }} transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={handleDelete}
            className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl text-sm font-medium border"
            style={{ width: 54, height: 54, background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.35)", color: "rgba(239,68,68,0.7)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            <span style={{ fontSize: 9 }}>Delete</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {tipOpen && <TipModal post={post} onClose={() => setTipOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

/* ─── Glass File Card ────────────────────────────────────────────── */
function GlassFileCard({ post, isOwned, onDelete }: { post: Post; isOwned: boolean; onDelete?: () => void }) {
  const p = post.id;

  return (
    <div className="relative" style={{ width: "min(88vw, 800px)", aspectRatio: "1000 / 560" }}>
      {/* Glass SVG shell — exact design from Claude Design file */}
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

        {/* Folded corner */}
        <path d="M 884 30 L 964 110 L 884 110 Z" fill={`url(#cf-${p})`} />
        <path d="M 884 30 L 964 110" stroke={`url(#ce-${p})`} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 884 110 L 964 110" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" />
        <path d="M 884 30 L 884 110" stroke="rgba(255,255,255,0.40)" strokeWidth="1" strokeLinecap="round" />
        <path d="M 894 40 L 954 100 L 894 100 Z" fill="rgba(255,230,245,0.18)" />
        <path d="M 892 38 L 956 102" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />

        <path d="M 70 24 H 878" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <path d="M 70 528 H 932" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      </svg>

      {/* Content overlay — inside the card, padded away from folded corner */}
      <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: "6% 14% 6% 6%" }}>

        {/* Top-left: user profile */}
        <div className="flex items-center gap-3">
          <GeoAvatar uid={post.id} color1={post.author.color1} color2={post.author.color2} shape={post.author.shape} size={42} />
          <div>
            <div className="text-white font-semibold text-sm leading-tight">{post.author.name}</div>
            <div className="text-white/50 text-xs mt-0.5">@{post.author.handle}</div>
          </div>
          <div className="ml-3 flex gap-1.5 flex-wrap">
            {post.tags.map(tag => (
              <span key={tag} className="text-[9px] font-semibold px-2 py-0.5 rounded-full tracking-wide"
                style={{ background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.35)", color: "#d8b4fe" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Center: title + summary */}
        <div className="flex-1 flex flex-col justify-center py-4">
          <h2 className="font-bold text-white leading-tight mb-3" style={{ fontSize: "clamp(1rem, 2.2vw, 1.35rem)" }}>
            {post.title}
          </h2>
          <p className="text-white/60 leading-relaxed" style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.82rem)" }}>
            {post.summary}
          </p>
        </div>

        {/* Bottom: file metadata (left) + action buttons (right) */}
        <div className="flex items-end justify-between">
          <div className="text-white/35" style={{ fontSize: "clamp(0.6rem, 1vw, 0.72rem)" }}>
            <div className="font-mono">{post.blobId}</div>
            <div className="mt-0.5">{post.fileSize} · {post.lines.toLocaleString()} lines · {post.reads} reads · {post.createdAt}</div>
          </div>
          <ActionButtons post={post} isOwned={isOwned} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function DiscoveryPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { account } = useWallet();
  const [allPosts, setAllPosts] = useState<Post[]>(() => {
    const uploads = getUploads();
    const initUsername = localStorage.getItem("ai_corpus_username") ?? "";
    const initHandle   = localStorage.getItem("ai_corpus_handle")  ?? "me";
    const initShape    = localStorage.getItem("ai_corpus_avatar_shape")  || "hex";
    const initColor1   = localStorage.getItem("ai_corpus_avatar_color1") || "#7C3AED";
    const initColor2   = localStorage.getItem("ai_corpus_avatar_color2") || "#EC4899";
    const uploadedPosts: Post[] = uploads.map(u => ({
      id: u.id, title: u.title, summary: u.summary, tags: u.tags,
      author: { name: initUsername || "You", handle: initHandle, color1: initColor1, color2: initColor2, shape: initShape, address: "0x0" },
      reads: "0", likes: 0, tips: 0,
      blobId: u.blobId, createdAt: u.createdAt, fileSize: u.fileSize, lines: 0,
    }));
    return [...uploadedPosts, ...FEED_POSTS];
  });
  const [targetPostId, setTargetPostId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("post");
    if (postId) setTargetPostId(postId);
  }, []);

  const [ownedIds, setOwnedIds] = useState<Set<string>>(() => new Set(getUploads().map(u => u.id)));

  const buildPosts = (address: string) => {
    const username = (typeof window !== "undefined" ? localStorage.getItem("ai_corpus_username") : null) ?? "";
    const savedHandle = (typeof window !== "undefined" ? localStorage.getItem("ai_corpus_handle") : null) ?? "";
    const derived = deriveAvatar(address || "0x000000");
    const shape  = localStorage.getItem("ai_corpus_avatar_shape")  || derived.shape;
    const color1 = localStorage.getItem("ai_corpus_avatar_color1") || derived.colors[0];
    const color2 = localStorage.getItem("ai_corpus_avatar_color2") || derived.colors[1];
    const colors: [string, string] = [color1, color2];
    const uploads = getUploads();
    setOwnedIds(new Set(uploads.map(u => u.id)));
    const uploadedPosts: Post[] = uploads.map(u => ({
      id: u.id,
      title: u.title,
      summary: u.summary,
      tags: u.tags,
      author: {
        name: username || "You",
        handle: savedHandle || (address ? address.slice(2, 8) : "me"),
        color1: colors[0],
        color2: colors[1],
        shape,
        address: address || "0x0",
      },
      reads: "0",
      likes: 0,
      tips: 0,
      blobId: u.blobId,
      createdAt: u.createdAt,
      fileSize: u.fileSize,
      lines: 0,
    }));
    setAllPosts([...uploadedPosts, ...FEED_POSTS]);
  };

  useEffect(() => {
    buildPosts(account?.address?.toString() ?? "");
  }, [account]);

  useEffect(() => {
    if (!targetPostId || !containerRef.current || allPosts.length === 0) return;
    const idx = allPosts.findIndex(p => p.id === targetPostId);
    if (idx < 0) return;
    setTimeout(() => {
      if (!containerRef.current) return;
      containerRef.current.scrollTop = idx * containerRef.current.clientHeight;
      setCurrentIndex(idx);
    }, 150);
  }, [allPosts, targetPostId]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    setCurrentIndex(Math.round(scrollTop / clientHeight));
  };

  return (
    <>
      <Nav />
      <div className="fixed top-28 left-1/2 -translate-x-1/2 z-40 text-white/60 font-semibold tracking-widest" style={{ fontSize: "1.1rem" }}>
        {currentIndex + 1} / {allPosts.length}
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-screen overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {allPosts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="h-screen flex items-center justify-center px-4"
            style={{ scrollSnapAlign: "start", paddingTop: "80px" }}
          >
            <GlassFileCard
              post={post}
              isOwned={ownedIds.has(post.id)}
              onDelete={() => buildPosts(account?.address?.toString() ?? "")}
            />
          </motion.div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-40 pointer-events-none">
        {allPosts.map((_: Post, i: number) => (
          <div key={i} className="w-0.5 h-4 rounded-full bg-white/15" />
        ))}
      </div>
    </>
  );
}
