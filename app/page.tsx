"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GradientText, GlassCard, GradientBorderCard, Nav } from "@/components/ui";
import { FEED_POSTS, getUploads } from "@/lib/posts";
import type { Post } from "@/lib/posts";

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-pink-600/[0.08] blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/[0.08] blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: `linear-gradient(rgba(139,92,246,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.5) 1px,transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,211,165,0.8)] animate-pulse" />
          <span className="text-xs text-purple-300 font-medium">Live on Shelby Testnet</span>
        </div>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center tracking-tight max-w-5xl leading-[1.05]"
        style={{ fontSize: "clamp(3.2rem, 9vw, 6.5rem)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 700 }}>
        <span className="text-white">The knowledge layer</span>
        <br />
        <GradientText>for the AI era.</GradientText>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="mt-12 text-center text-lg text-white/50 max-w-xl leading-relaxed">
        Manage your AI with professional data. Share your data and earn from what you share.
        A decentralized AI data marketplace built on Shelby.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="flex flex-col sm:flex-row items-center gap-4" style={{ marginTop: "1.8rem" }}>
        <Link href="/feed">
          <motion.button whileHover={{ scale: 1.07, boxShadow: "0 0 40px rgba(139,92,246,0.55), 0 0 80px rgba(217,70,239,0.2)" }} whileTap={{ scale: 0.96 }} transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex items-center justify-center font-semibold text-white rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
            style={{ width: 140, height: 39, fontSize: 13 }}>
            Content Discovery
          </motion.button>
        </Link>
        <Link href="/upload">
          <motion.button whileHover={{ scale: 1.07, boxShadow: "0 0 40px rgba(139,92,246,0.55), 0 0 80px rgba(217,70,239,0.2)" }} whileTap={{ scale: 0.96 }} transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex items-center justify-center font-semibold text-white rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
            style={{ width: 140, height: 39, fontSize: 13 }}>
            Start Earning
          </motion.button>
        </Link>
      </motion.div>


      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/40" />
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Strip File Card ───────────────────────────────────────────── */
function StripCard({ post, uid }: { post: Post; uid: string }) {
  const p = `s-${uid}`;
  return (
    <div style={{ width: 380, flexShrink: 0, position: "relative", aspectRatio: "1000 / 560", isolation: "isolate" }}>
      {/* Glass SVG shell */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 560"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.55)) drop-shadow(0 8px 20px rgba(120,90,160,0.22))" }}>
        <defs>
          <linearGradient id={`bf-${p}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D6BBD3" stopOpacity="0.55" /><stop offset="0.35" stopColor="#A98DA8" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#7B6582" stopOpacity="0.60" /><stop offset="1" stopColor="#3C2E45" stopOpacity="0.72" />
          </linearGradient>
          <radialGradient id={`bg-${p}`} cx="0.5" cy="0.35" r="0.85">
            <stop offset="0" stopColor="#EAD6EB" stopOpacity="0.40" /><stop offset="0.7" stopColor="#7A6280" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`sh-${p}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" /><stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`ro-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" /><stop offset="0.4" stopColor="#E2CFE6" stopOpacity="0.50" />
            <stop offset="0.75" stopColor="#FFFFFF" stopOpacity="0.18" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`rm-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" /><stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.10" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.30" />
          </linearGradient>
          <linearGradient id={`ri-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.40" /><stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.06" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id={`cf-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F2D8EE" stopOpacity="0.95" /><stop offset="0.55" stopColor="#B596B4" stopOpacity="0.95" />
            <stop offset="1" stopColor="#5A4263" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={`ce-${p}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0.25" />
          </linearGradient>
          <radialGradient id={`cs-${p}`} cx="0.4" cy="0.2" r="0.9">
            <stop offset="0" stopColor="#000000" stopOpacity="0.40" /><stop offset="1" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id={`hl-${p}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="42" /></filter>
          <clipPath id={`bc-${p}`}><path d="M 60 30 H 884 L 964 110 V 490 Q 964 520 934 520 H 60 Q 30 520 30 490 V 60 Q 30 30 60 30 Z" /></clipPath>
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

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: "6% 14% 6% 6%" }}>
        {/* Top: author + tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>@{post.author.handle}</span>
          {post.tags.slice(0, 2).map(tag => (
            <span key={tag} style={{ fontSize: 8, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
              background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.35)", color: "#d8b4fe", letterSpacing: "0.04em" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Center: title + summary */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "8px 0" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", lineHeight: 1.35, marginBottom: 6,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const }}>
            {post.title}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
            {post.summary}
          </div>
        </div>

        {/* Bottom: blob ID + view button */}
        <div className="flex items-end justify-between">
          <div style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.2)" }}>
            {post.blobId.slice(0, 20)}…
          </div>
          <Link href={`/feed?post=${post.id}`}>
            <motion.button whileHover={{ scale: 1.06, boxShadow: "0 0 16px rgba(139,92,246,0.5)" }} whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{ fontSize: 10, fontWeight: 600, padding: "5px 11px", borderRadius: 8,
                background: "linear-gradient(135deg,#7C3AED,#EC4899)", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>
              View File →
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Scrolling Strip ───────────────────────────────────────────── */
function ScrollingStrip() {
  const [posts, setPosts] = useState<Post[]>(FEED_POSTS);

  useEffect(() => {
    const username = localStorage.getItem("ai_corpus_username") ?? "";
    const handle = localStorage.getItem("ai_corpus_handle") || username || "me";
    const avatarShape  = localStorage.getItem("ai_corpus_avatar_shape")  || "hex";
    const avatarColor1 = localStorage.getItem("ai_corpus_avatar_color1") || "#7C3AED";
    const avatarColor2 = localStorage.getItem("ai_corpus_avatar_color2") || "#EC4899";
    const uploads = getUploads();
    const uploadedPosts: Post[] = uploads.map(u => ({
      id: u.id, title: u.title, summary: u.summary, tags: u.tags,
      author: { name: username || "You", handle, color1: avatarColor1, color2: avatarColor2, shape: avatarShape, address: "0x0" },
      reads: "0", likes: 0, tips: 0,
      blobId: u.blobId, createdAt: u.createdAt, fileSize: u.fileSize, lines: 0,
    }));
    setPosts([...uploadedPosts, ...FEED_POSTS]);
  }, []);

  const items = [...posts, ...posts];

  return (
    <section style={{ paddingTop: "80px", paddingBottom: "80px", overflow: "hidden" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center" style={{ marginBottom: 36 }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 5px rgba(167,139,250,0.9)" }} className="animate-pulse" />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#a78bfa" }}>LIVE KNOWLEDGE FEED</span>
        </div>
      </motion.div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{ width: 140, background: "linear-gradient(to right, #06040f, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{ width: 140, background: "linear-gradient(to left, #06040f, transparent)" }} />
        <div className="flex animate-marquee" style={{ width: "max-content", gap: 20, alignItems: "center", padding: "20px 0" }}>
          {items.map((post, i) => (
            <StripCard key={`${post.id}-${i}`} post={post} uid={`${post.id}-${i}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: "◈", tag: "Storage",   title: "Decentralized Storage",  desc: "Every post lives on Shelby's blob network. Merkle-verified, tamper-proof, permanently yours." },
  { icon: "⟁", tag: "Developer", title: "AI-Native API",          desc: "Claude, GPT, and any agent can fetch posts as context. Your knowledge becomes a live API endpoint." },
  { icon: "▤", tag: "Format",    title: "Markdown First",         desc: "Write in Markdown. Rendered beautifully on-screen, raw for AI consumption. One format, both worlds." },
  { icon: "⌘", tag: "UX",        title: "Immersive Content Feed",  desc: "Scroll through curated AI knowledge. Full-screen, vertical, built for focus. Discovery made effortless." },
  { icon: "◎", tag: "Trust",     title: "Explorer Verified",      desc: "Every post has a Shelby Explorer link. On-chain proof your knowledge exists and when it was written." },
  { icon: "⬡", tag: "Identity",  title: "Cross-Chain Identity",   desc: "Aptos-powered identity. Your knowledge profile lives on-chain alongside your content." },
];

function Features() {
  return (
    <section className="py-32" style={{ paddingLeft: "clamp(1.5rem, 5vw, 6rem)", paddingRight: "clamp(1.5rem, 5vw, 6rem)" }}>
      <div style={{ maxWidth: "1024px", marginLeft: "auto", marginRight: "auto", width: "100%" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 className="text-4xl md:text-5xl text-white tracking-tight" style={{ marginTop: "5rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 700 }}>Built different. <GradientText>For the AI era.</GradientText></h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <GradientBorderCard className="h-full hover:scale-[1.02] transition-transform duration-300 cursor-default">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl text-purple-400">{f.icon}</span>
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{f.tag}</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </GradientBorderCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", title: "Upload your .md file",  desc: "Select your Markdown file from your device. Add a title and a short description to help others discover your content." },
  { n: "02", title: "Upload to Shelby",   desc: "One click. Your MD file becomes a blob on Shelby's decentralized network. You get a unique blob ID." },
  { n: "03", title: "Get Explorer Link",  desc: "Instantly verifiable on Shelby Explorer. Share proof-of-knowledge with the world." },
  { n: "04", title: "AI Agents Read You", desc: "Any AI system can call /api/posts/{id} and receive your knowledge as context. You become a data source." },
];

function HowItWorks() {
  return (
    <section className="relative px-6 overflow-hidden" style={{ paddingTop: "4rem", paddingBottom: "6rem", marginTop: "3rem" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent pointer-events-none" />
      <div className="max-w-3xl mx-auto relative" style={{ marginLeft: "auto", marginRight: "auto" }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center" style={{ marginBottom: "4rem" }}>
          <h2 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 700 }}>How it <GradientText>works</GradientText></h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-purple-500/60 via-pink-500/40 to-transparent" />
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {STEPS.map((step, i) => (
              <motion.div key={step.n} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="flex items-center gap-8">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_24px_rgba(139,92,246,0.4)]">
                  <span className="text-white font-bold text-sm">{step.n}</span>
                </div>
                <GlassCard className="flex-1 hover:border-purple-500/20 transition-colors duration-300">
                  <div className="flex flex-col justify-center" style={{ minHeight: 90, padding: "20px 40px" }}>
                    <h3 className="text-white font-semibold text-lg mb-1.5">{step.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


function Footer() {
  return (
    <footer className="border-t border-white/5 px-6" style={{ paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left: Faucet + Docs */}
        <div className="flex items-center gap-6">
          <a href="https://faucet.shelby.xyz" target="_blank" rel="noopener noreferrer"
            className="text-xs text-white/35 hover:text-white/70 transition-colors">Faucet</a>
          <a href="https://docs.shelby.xyz" target="_blank" rel="noopener noreferrer"
            className="text-xs text-white/35 hover:text-white/70 transition-colors">Docs</a>
        </div>

        {/* Center */}
        <p className="text-xs text-white/20 tracking-widest uppercase">Built on Shelby Protocol</p>

        {/* Right: X + Discord */}
        <div className="flex items-center gap-5">
          <a href="https://x.com/shelbyprotocol" target="_blank" rel="noopener noreferrer"
            className="text-white/35 hover:text-white/70 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://discord.gg/shelby" target="_blank" rel="noopener noreferrer"
            className="text-white/35 hover:text-white/70 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <Hero />
      <ScrollingStrip />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
}
