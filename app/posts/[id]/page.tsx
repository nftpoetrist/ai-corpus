"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Nav, Tag, Avatar, ShelbyBadge, fmt } from "@/components/ui";

const SAMPLE_MD = `
## What is Attention?

At its core, attention is a mechanism that allows a model to **dynamically weight** the importance of different parts of the input when generating each output token.

Think of it like reading a sentence. When you reach the word "it" in *"The cat sat on the mat because it was warm,"* you automatically know "it" refers to "cat." Attention lets the model do the same thing — mathematically.

## The Math (Simplified)

Given a sequence of tokens, attention computes three vectors for each:

- **Query (Q)** — what we're looking for
- **Key (K)** — what each token offers
- **Value (V)** — the actual information to extract

\`\`\`python
scores = softmax(Q @ K.T / sqrt(d_k))
output = scores @ V
\`\`\`

The \`sqrt(d_k)\` is crucial — it prevents the dot products from growing too large and saturating the softmax.

## Why It Changed Everything

Before attention, RNNs had to compress an entire sequence into a single fixed-size vector. Attention gave models a **direct path** to any position in the input. Sequence length went from a bottleneck to a feature.

> "Attention is all you need" — Vaswani et al., 2017

## Practical Implications for Engineers

1. **Context window** is your attention window. Every token attends to every other token — O(n²) cost.
2. **Chunking strategies** in RAG exist specifically because of this quadratic scaling.
3. Flash Attention, Ring Attention, etc. are all optimizations for this fundamental operation.

## What's Next

Multi-head attention, cross-attention, sparse attention patterns — all variations on this one elegant idea. Master the base mechanism and everything else is incremental.
`;

function TipModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-sm rounded-3xl bg-[#141428] border border-white/10 p-6 shadow-[0_0_80px_rgba(139,92,246,0.2)]">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">◈</div>
          <h3 className="text-white font-semibold text-lg">Tip Aria Chen</h3>
          <p className="text-white/40 text-sm mt-1">Support great knowledge. Paid on Aptos.</p>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[0.1, 0.5, 1, 5].map((a) => (
            <button key={a} onClick={() => setSelected(a)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all ${selected === a ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
              {a} APT
            </button>
          ))}
        </div>
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] transition-all">
          Send Tip
        </button>
      </motion.div>
    </div>
  );
}

export default function PostView() {
  const [liked, setLiked] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [following, setFollowing] = useState(false);

  return (
    <div className="min-h-screen">
      <Nav />
      {tipOpen && <TipModal onClose={() => setTipOpen(false)} />}

      {/* Top action bar */}
      <div className="sticky top-20 z-40 border-b border-white/5 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/feed" className="flex items-center gap-2 text-white/45 hover:text-white text-sm transition-colors">
            <span>←</span><span>Feed</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setTipOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-500/25 transition-all">
              ◈ Tip
            </button>
            <button onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-all ${liked ? "bg-pink-500/20 border border-pink-500/40 text-pink-400" : "bg-white/5 border border-white/10 text-white/60 hover:text-white"}`}>
              {liked ? "♥" : "♡"} {fmt(liked ? 2848 : 2847)}
            </button>
            <button className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:text-white transition-colors">↗</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

          {/* Article */}
          <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">
            <div className="flex gap-2 mb-5 flex-wrap">
              {["AI", "Transformers", "ML"].map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-4">
              The Attention Mechanism Explained Simply
            </h1>
            <p className="text-lg text-white/45 leading-relaxed mb-8">
              Why transformers changed everything — a clear breakdown for engineers and curious minds.
            </p>

            <div className="flex items-center gap-4 mb-10 pb-8 border-b border-white/5">
              <Avatar initials="AC" />
              <div>
                <div className="text-sm font-medium text-white">Aria Chen</div>
                <div className="text-xs text-white/35">@achen · 4 min read · 2 hours ago</div>
              </div>
              <div className="ml-auto">
                <ShelbyBadge blobId="blob-0x1a2b3c4d" />
              </div>
            </div>

            {/* Markdown */}
            <div className="prose prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-p:text-white/65 prose-p:leading-[1.85] prose-p:text-[1.0625rem]
              prose-strong:text-white prose-strong:font-semibold
              prose-em:text-white/70
              prose-code:text-purple-300 prose-code:bg-purple-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-[#0d0d1f] prose-pre:border prose-pre:border-purple-500/20 prose-pre:rounded-xl
              prose-blockquote:border-l-purple-500 prose-blockquote:text-white/50 prose-blockquote:not-italic
              prose-li:text-white/65 prose-li:marker:text-purple-400
              prose-ol:text-white/65">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{SAMPLE_MD}</ReactMarkdown>
            </div>

            {/* Bottom row */}
            <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${liked ? "bg-pink-500/20 border border-pink-500/40 text-pink-400 shadow-[0_0_16px_rgba(217,70,239,0.3)]" : "bg-white/5 border border-white/10 text-white/60 hover:text-white"}`}>
                  {liked ? "♥" : "♡"} {fmt(liked ? 2848 : 2847)} Likes
                </button>
                <button onClick={() => setTipOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-purple-500/10 border border-purple-500/25 text-purple-300 hover:bg-purple-500/20 transition-all">
                  ◈ Tip Author
                </button>
              </div>
              <div className="text-sm text-white/30">{fmt(18900)} reads · 847 AI reads</div>
            </div>

            {/* Author card */}
            <div className="mt-8 flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
              <Avatar initials="AC" size="md" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">Aria Chen</div>
                    <div className="text-xs text-white/40 mt-0.5">@achen · 143 posts</div>
                  </div>
                  <button onClick={() => setFollowing(!following)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${following ? "bg-white/10 text-white/60 border border-white/15" : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"}`}>
                    {following ? "Following" : "Follow"}
                  </button>
                </div>
                <p className="text-xs text-white/40 mt-2 leading-relaxed">AI researcher. Writing about transformers, reasoning, and the future of machine intelligence.</p>
              </div>
            </div>
          </motion.article>

          {/* Sidebar */}
          <motion.aside initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
            {/* On-chain info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">On-Chain</h4>
              {[
                { label: "Blob ID", value: "blob-0x1a2b3c4d", mono: true },
                { label: "Network", value: "Shelbynet", mono: false },
                { label: "Expires",  value: "365 days",  mono: false },
                { label: "Merkle",  value: "0xd4e5f6…",  mono: true },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-xs text-white/30">{r.label}</span>
                  <span className={`text-xs ${r.mono ? "font-mono text-purple-400" : "text-white/60"}`}>{r.value}</span>
                </div>
              ))}
              <a href="https://explorer.shelby.xyz" target="_blank" rel="noopener noreferrer"
                className="block w-full mt-1 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center text-xs text-purple-400 hover:bg-purple-500/20 transition-colors">
                View on Explorer ↗
              </a>
            </div>

            {/* Stats */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Stats</h4>
              {[{ label: "Reads", value: "18.9K" }, { label: "Likes", value: "2,847" }, { label: "Tips", value: "142 APT" }, { label: "AI Reads", value: "847" }].map((s) => (
                <div key={s.label} className="flex justify-between">
                  <span className="text-xs text-white/30">{s.label}</span>
                  <span className="text-xs text-white/70 font-medium">{s.value}</span>
                </div>
              ))}
            </div>

            {/* API snip */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">AI API</h4>
              <code className="block text-[11px] font-mono text-purple-300/70 bg-purple-500/5 rounded-lg p-3 leading-relaxed break-all">
                GET /api/posts/blob-0x1a2b3c4d
              </code>
              <p className="text-[10px] text-white/25 mt-2">Raw MD for AI agent consumption</p>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
