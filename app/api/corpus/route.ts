import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { downloadFromShelby } from "@/lib/shelby";
import { checkRateLimit } from "@/lib/security";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const postId = searchParams.get("id");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;

  if (!key) {
    return NextResponse.json({ error: "API key required. Use ?key=<your-key>" }, { status: 401 });
  }

  // Rate limiting: 120 requests/minute per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, "read", 120, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // Verify API key
  const { data: keyData } = await supabase
    .from("api_keys")
    .select("owner_address, label")
    .eq("key", key)
    .maybeSingle();

  if (!keyData) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }

  const ownerAddress = keyData.owner_address;

  // Update last_used_at (fire-and-forget)
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key", key)
    .then(() => {});

  // ── GET /api/corpus?key=...&id=<postId>  →  full post with content ──
  if (postId) {
    const { data: post } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .eq("author_address", ownerAddress)
      .maybeSingle();

    if (!post) {
      return NextResponse.json({ error: "Post not found or access denied" }, { status: 404 });
    }

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
        content,
      });
    } catch {
      return NextResponse.json({ error: "Failed to fetch file content from Shelby" }, { status: 502 });
    }
  }

  // ── GET /api/corpus?key=...  →  list posts (metadata only) ──
  const from = (page - 1) * limit;
  const { data: posts, count } = await supabase
    .from("posts")
    .select("id, title, summary, tags, visibility, file_name, file_size, lines, created_at, reads, likes", {
      count: "exact",
    })
    .eq("author_address", ownerAddress)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  return NextResponse.json({
    owner: ownerAddress,
    total: count ?? 0,
    page,
    posts: posts ?? [],
    _hint: "Add ?id=<postId> to fetch full content of a specific file",
  });
}
