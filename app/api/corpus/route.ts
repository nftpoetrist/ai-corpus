import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { downloadFromShelby } from "@/lib/shelby";
import { checkRateLimit } from "@/lib/security";
import { hashApiKey } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("id");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;

  const authHeader = req.headers.get("authorization");
  const key = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!key) {
    return NextResponse.json(
      { error: "Authorization header required. Use: Authorization: Bearer <your-key>" },
      { status: 401 }
    );
  }

  if (!/^aicc_[0-9a-f]{40}$/.test(key)) {
    return NextResponse.json({ error: "Invalid API key format" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, "read", 120, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const hashedKey = await hashApiKey(key);

  const { data: keyData } = await supabase
    .from("api_keys")
    .select("owner_address, label")
    .eq("key", hashedKey)
    .maybeSingle();

  if (!keyData) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }

  const ownerAddress = keyData.owner_address;

  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key", hashedKey)
    .then(() => {});

  // ── Single post fetch: authored OR saved by owner ──
  if (postId) {
    const [ownedResult, savedRef] = await Promise.all([
      supabase.from("posts").select("*").eq("id", postId).eq("author_address", ownerAddress).maybeSingle(),
      supabase.from("saved_posts").select("post_id").eq("wallet_address", ownerAddress).eq("post_id", postId).maybeSingle(),
    ]);

    const isOwned = !!ownedResult.data;
    const isSaved = !!savedRef.data;

    if (!isOwned && !isSaved) {
      return NextResponse.json({ error: "Post not found or access denied" }, { status: 404 });
    }

    const post = isOwned
      ? ownedResult.data
      : (await supabase.from("posts").select("*").eq("id", postId).eq("visibility", "Public").maybeSingle()).data;

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    try {
      const content = await downloadFromShelby(post.account_address, post.blob_name);
      return NextResponse.json({
        id: post.id,
        title: post.title,
        summary: post.summary,
        tags: post.tags,
        visibility: post.visibility,
        file_name: post.file_name,
        file_size: post.file_size,
        lines: post.lines,
        created_at: post.created_at,
        blob_name: post.blob_name,
        reads: post.reads,
        source: isOwned ? "upload" : "saved",
        content,
      });
    } catch {
      return NextResponse.json({ error: "Failed to fetch file content from Shelby" }, { status: 502 });
    }
  }

  // ── List: uploads + saved, merged with source field ──
  const [uploadsResult, savedRefsResult] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, summary, tags, visibility, file_name, file_size, lines, created_at, reads, likes, author_address")
      .eq("author_address", ownerAddress)
      .order("created_at", { ascending: false }),
    supabase
      .from("saved_posts")
      .select("post_id, saved_at")
      .eq("wallet_address", ownerAddress)
      .order("saved_at", { ascending: false }),
  ]);

  const uploads = uploadsResult.data ?? [];
  const savedRefs = savedRefsResult.data ?? [];

  // Fetch saved posts, skip ones the user already owns (avoid duplicates)
  const ownedIds = new Set(uploads.map((p) => p.id));
  const savedIdsToFetch = savedRefs.map((s) => s.post_id).filter((id) => !ownedIds.has(id));

  let savedPosts: typeof uploads = [];
  if (savedIdsToFetch.length > 0) {
    const { data } = await supabase
      .from("posts")
      .select("id, title, summary, tags, visibility, file_name, file_size, lines, created_at, reads, likes, author_address")
      .in("id", savedIdsToFetch)
      .eq("visibility", "Public");
    savedPosts = data ?? [];
  }

  const allPosts = [
    ...uploads.map((p) => ({ ...p, source: "upload" as const })),
    ...savedPosts.map((p) => ({ ...p, source: "saved" as const })),
  ];

  const from = (page - 1) * limit;
  const paginated = allPosts.slice(from, from + limit);

  return NextResponse.json({
    owner: ownerAddress,
    total: allPosts.length,
    page,
    posts: paginated,
    _hint: "source: 'upload' = your files, 'saved' = bookmarked files. Use ?id=<postId> for full content.",
  });
}
