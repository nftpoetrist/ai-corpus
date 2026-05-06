export type Post = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  author: { name: string; handle: string; color1: string; color2: string; shape: string; address: string };
  reads: string;
  likes: number;
  tips: number;
  blobId: string;
  createdAt: string;
  fileSize: string;
  lines: number;
};

export const FEED_POSTS: Post[] = [
  {
    id: "1",
    title: "Premium .apt Name Service",
    summary: "Covers namespace registration via Move modules, resolver architecture for human-readable addresses, subdomain delegation with expiry mechanics, and on-chain metadata stored as Shelby blobs.",
    tags: ["Move", "DNS", "Identity"],
    author: { name: "Kenji Sato", handle: "kenji_s", color1: "#7C3AED", color2: "#4F46E5", shape: "hex", address: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2" },
    reads: "18.4K", likes: 2847, tips: 142,
    blobId: "blob-0xa1b2c3d4", createdAt: "2h ago", fileSize: "24 KB", lines: 847,
  },
  {
    id: "2",
    title: "DeFi Yield Optimizer Architecture",
    summary: "Auto-compounding vaults on Aptos, multi-protocol yield aggregation strategies, risk-adjusted position sizing algorithms, and keeper bot design patterns leveraging Move's linear resource model.",
    tags: ["DeFi", "Yield", "Aptos"],
    author: { name: "Aria Chen", handle: "aria_cx", color1: "#DB2777", color2: "#9333EA", shape: "diamond", address: "0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3" },
    reads: "31.2K", likes: 4201, tips: 287,
    blobId: "blob-0xb2c3d4e5", createdAt: "5h ago", fileSize: "38 KB", lines: 1204,
  },
  {
    id: "3",
    title: "ZK Identity Verification System",
    summary: "Zero-knowledge identity proofs on-chain: Groth16 circuit design, on-chain verifier contracts in Move, nullifier tracking, and privacy-preserving credential issuance for KYC-gated DeFi protocols.",
    tags: ["ZK Proofs", "Privacy", "Identity"],
    author: { name: "Marcus Wei", handle: "m_wei", color1: "#0EA5E9", color2: "#6366F1", shape: "ring", address: "0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4" },
    reads: "12.7K", likes: 1923, tips: 87,
    blobId: "blob-0xc3d4e5f6", createdAt: "1d ago", fileSize: "52 KB", lines: 1891,
  },
  {
    id: "4",
    title: "DAO Governance Framework v2",
    summary: "Modular on-chain governance built in Move: full proposal lifecycle, quadratic voting weight mechanics, time-locked execution with guardian veto, and treasury management via multi-sig.",
    tags: ["DAO", "Governance", "Move"],
    author: { name: "Priya Sharma", handle: "priya_sh", color1: "#10B981", color2: "#3B82F6", shape: "pentagon", address: "0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5" },
    reads: "9.3K", likes: 1401, tips: 63,
    blobId: "blob-0xd4e5f6a7", createdAt: "2d ago", fileSize: "41 KB", lines: 1567,
  },
  {
    id: "5",
    title: "NFT Metadata Standard v3",
    summary: "Extensible on-chain NFT metadata schema for Aptos: dynamic trait mutation events, composable metadata layers, Shelby blob attachment spec, and backward compatibility guidelines.",
    tags: ["NFT", "Standard", "Metadata"],
    author: { name: "Lena Müller", handle: "lena_m", color1: "#F59E0B", color2: "#EF4444", shape: "star", address: "0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6" },
    reads: "22.1K", likes: 3156, tips: 198,
    blobId: "blob-0xe5f6a7b8", createdAt: "3d ago", fileSize: "29 KB", lines: 934,
  },
  {
    id: "6",
    title: "Cross-Chain Bridge Protocol",
    summary: "Trustless bridge architecture using light client proofs, optimistic challenge windows, liquidity pool design for instant exits, and a detailed security threat model for Aptos–EVM interoperability.",
    tags: ["Bridge", "Cross-chain", "Security"],
    author: { name: "Alex Park", handle: "alex_p", color1: "#8B5CF6", color2: "#EC4899", shape: "octagon", address: "0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7" },
    reads: "15.8K", likes: 2034, tips: 119,
    blobId: "blob-0xf6a7b8c9", createdAt: "4d ago", fileSize: "61 KB", lines: 2103,
  },
  {
    id: "7",
    title: "Token Distribution & Tokenomics",
    summary: "Designing sustainable token emission schedules, vesting cliff mechanics, liquidity bootstrapping pool strategies, on-chain inflation control modules, and community incentive alignment models.",
    tags: ["Tokenomics", "DeFi", "Design"],
    author: { name: "Ravi Patel", handle: "ravi_p", color1: "#06B6D4", color2: "#7C3AED", shape: "triangle", address: "0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8" },
    reads: "28.9K", likes: 3872, tips: 241,
    blobId: "blob-0xa7b8c9d0", createdAt: "5d ago", fileSize: "33 KB", lines: 1128,
  },
  {
    id: "8",
    title: "Shelby Storage Integration Guide",
    summary: "End-to-end Shelby blob integration: upload/download API, Aptos account-based access control, blob expiry management strategies, and building a public feed indexer using an off-chain metadata registry.",
    tags: ["Shelby", "Storage", "SDK"],
    author: { name: "Yuki Tanaka", handle: "yuki_t", color1: "#F97316", color2: "#A855F7", shape: "roundsq", address: "0xb8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9" },
    reads: "41.5K", likes: 5210, tips: 389,
    blobId: "blob-0xb8c9d0e1", createdAt: "1w ago", fileSize: "47 KB", lines: 1734,
  },
];

export const MY_UPLOADS: Post[] = [
  {
    id: "u1",
    title: "Aptos Move Smart Contract Patterns",
    summary: "Common design patterns for Move smart contracts on Aptos: resource accounts, capability-based access control, upgradeable modules, and gas optimization techniques.",
    tags: ["Move", "Aptos", "Patterns"],
    author: { name: "You", handle: "achen", color1: "#7C3AED", color2: "#EC4899", shape: "hex", address: "0x0000000000000000000000000000000000000000000000000000000000000001" },
    reads: "4.2K", likes: 312, tips: 28,
    blobId: "blob-0xf1a2b3c4", createdAt: "3d ago", fileSize: "18 KB", lines: 612,
  },
  {
    id: "u2",
    title: "Building AI Agents with Shelby Data",
    summary: "How to build AI agents that consume Shelby blob data as knowledge sources. Covers API integration, chunking strategies, and embedding pipelines for RAG systems.",
    tags: ["AI", "Shelby", "SDK"],
    author: { name: "You", handle: "achen", color1: "#7C3AED", color2: "#EC4899", shape: "hex", address: "0x0000000000000000000000000000000000000000000000000000000000000001" },
    reads: "7.8K", likes: 891, tips: 64,
    blobId: "blob-0xe5f6c7d8", createdAt: "1w ago", fileSize: "31 KB", lines: 1043,
  },
];

export const SAVED_KEY = "ai_corpus_saved_posts";
export const UPLOADS_KEY = "ai_corpus_uploads";
export const LIKED_KEY = "ai_corpus_liked_posts";

export type UploadedPost = {
  id: string;
  title: string;
  summary: string;
  fileName: string;
  fileSize: string;
  blobId: string;
  createdAt: string;
  tags: string[];
};

export function getUploads(): UploadedPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: UploadedPost[] = JSON.parse(localStorage.getItem(UPLOADS_KEY) ?? "[]");
    const seen = new Set<string>();
    let repaired = false;
    const fixed = raw.map(u => {
      if (!u.id || seen.has(u.id)) {
        repaired = true;
        return { ...u, id: `blob-0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}` };
      }
      seen.add(u.id);
      return u;
    });
    if (repaired) localStorage.setItem(UPLOADS_KEY, JSON.stringify(fixed));
    return fixed;
  } catch { return []; }
}

export function saveUpload(post: UploadedPost): void {
  const current = getUploads();
  if (current.some(u => u.id === post.id)) return;
  localStorage.setItem(UPLOADS_KEY, JSON.stringify([post, ...current]));
}

export function getSavedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
  } catch { return []; }
}

export function toggleSaved(id: string): string[] {
  const current = getSavedIds();
  const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next;
}

export function getLikedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) ?? "[]");
  } catch { return []; }
}

export function toggleLiked(id: string): string[] {
  const current = getLikedIds();
  const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
  localStorage.setItem(LIKED_KEY, JSON.stringify(next));
  return next;
}

export function deleteUpload(id: string): UploadedPost[] {
  if (!id) return getUploads();
  const all = getUploads();
  const next = all.filter(u => u.id === id ? false : true);
  if (next.length === all.length) return all; // nothing matched, abort
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(next));
  return next;
}
