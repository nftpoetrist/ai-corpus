import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { downloadFromShelby } from "@/lib/shelby";
import { getSessionAddress } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Require valid session
  const sessionAddress = await getSessionAddress(req);
  if (!sessionAddress) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Fetch post to verify ownership
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("author_address")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Session address must match author
  if (sessionAddress.toLowerCase() !== post.author_address.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized: you are not the author" }, { status: 403 });
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();

  if (error || !data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Non-public posts are only readable by their owner (session required)
  if (data.visibility !== "Public") {
    const sessionAddress = await getSessionAddress(req);
    if (!sessionAddress || sessionAddress.toLowerCase() !== data.author_address.toLowerCase()) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
  }

  supabase.from("posts").update({ reads: (data.reads ?? 0) + 1 }).eq("id", id).then(() => {});

  try {
    const content = await downloadFromShelby(data.account_address, data.blob_name);
    return NextResponse.json({ ...data, content });
  } catch {
    return NextResponse.json({ ...data, content: null });
  }
}
