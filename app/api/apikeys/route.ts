import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/security";

const APTOS_ADDRESS_RE = /^0x[0-9a-f]{1,64}$/i;

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address")?.toLowerCase().trim();
  if (!address) return NextResponse.json({ key: null });

  const { data } = await supabase
    .from("api_keys")
    .select("key, label, created_at, last_used_at")
    .eq("owner_address", address)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ key: data ?? null });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, "apikey", 20, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  let body: { key?: string; ownerAddress?: string; label?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { key, label } = body;
  const ownerAddress = (body.ownerAddress ?? "").toLowerCase().trim();

  if (!key || !ownerAddress) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!APTOS_ADDRESS_RE.test(ownerAddress)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  if (!/^aicc_[0-9a-f]{40}$/.test(key)) {
    return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
  }

  // Replace existing key for this wallet
  await supabase.from("api_keys").delete().eq("owner_address", ownerAddress);

  const { data, error } = await supabase
    .from("api_keys")
    .insert({ key, owner_address: ownerAddress, label: label ?? "Default" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ key: data });
}

export async function DELETE(req: NextRequest) {
  let body: { ownerAddress?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const ownerAddress = (body.ownerAddress ?? "").toLowerCase().trim();
  if (!ownerAddress || !APTOS_ADDRESS_RE.test(ownerAddress)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  await supabase.from("api_keys").delete().eq("owner_address", ownerAddress);
  return NextResponse.json({ success: true });
}
