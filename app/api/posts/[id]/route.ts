import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { downloadFromShelby } from "@/lib/shelby";
import { verifyAptosSignature, deriveAddressFromPublicKey } from "@/lib/security";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { signature?: string; publicKey?: string; fullMessage?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { signature, publicKey, fullMessage } = body;
  if (!signature || !publicKey || !fullMessage) {
    return NextResponse.json({ error: "Wallet signature required" }, { status: 401 });
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

  // Verify signature
  if (!verifyAptosSignature(fullMessage, signature, publicKey)) {
    return NextResponse.json({ error: "Invalid wallet signature" }, { status: 401 });
  }

  // Verify signer is the author
  const derivedAddress = deriveAddressFromPublicKey(publicKey);
  if (!derivedAddress || derivedAddress.toLowerCase() !== post.author_address.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized: you are not the author" }, { status: 403 });
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();

  if (error || !data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Increment reads
  supabase.from("posts").update({ reads: (data.reads ?? 0) + 1 }).eq("id", id).then(() => {});

  try {
    const content = await downloadFromShelby(data.account_address, data.blob_name);
    return NextResponse.json({ ...data, content });
  } catch {
    return NextResponse.json({ ...data, content: null });
  }
}
