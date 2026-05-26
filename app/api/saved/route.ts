import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSessionAddress } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sessionAddress = await getSessionAddress(req);
  if (!sessionAddress) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { data } = await supabase
    .from("saved_posts")
    .select("post_id, saved_at")
    .eq("wallet_address", sessionAddress)
    .order("saved_at", { ascending: false });

  return NextResponse.json({ saved: data ?? [] });
}

export async function POST(req: NextRequest) {
  const sessionAddress = await getSessionAddress(req);
  if (!sessionAddress) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  let body: { postId?: string } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { postId } = body;
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  const { data: post } = await supabase.from("posts").select("id").eq("id", postId).maybeSingle();
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const { error } = await supabase
    .from("saved_posts")
    .upsert({ wallet_address: sessionAddress, post_id: postId }, { onConflict: "wallet_address,post_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const sessionAddress = await getSessionAddress(req);
  if (!sessionAddress) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const postId = req.nextUrl.searchParams.get("id");
  if (!postId) return NextResponse.json({ error: "id required" }, { status: 400 });

  await supabase
    .from("saved_posts")
    .delete()
    .eq("wallet_address", sessionAddress)
    .eq("post_id", postId);

  return NextResponse.json({ ok: true });
}
