import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/security";
import { getSessionAddress, hashApiKey } from "@/lib/auth";

const APTOS_ADDRESS_RE = /^0x[0-9a-f]{1,64}$/i;

export async function GET(req: NextRequest) {
  const sessionAddress = await getSessionAddress(req);
  if (!sessionAddress) return NextResponse.json({ key: null });

  const { data } = await supabase
    .from("api_keys")
    .select("label, created_at, last_used_at")
    .eq("owner_address", sessionAddress)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ key: data ?? null });
}

export async function POST(req: NextRequest) {
  // Require valid session
  const sessionAddress = await getSessionAddress(req);
  if (!sessionAddress) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, "apikey", 20, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: { key?: string; label?: string } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { key, label } = body;

  if (!key) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!APTOS_ADDRESS_RE.test(sessionAddress)) {
    return NextResponse.json({ error: "Invalid session address" }, { status: 400 });
  }

  if (!/^aicc_[0-9a-f]{40}$/.test(key)) {
    return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
  }

  // Replace existing key for this wallet
  await supabase.from("api_keys").delete().eq("owner_address", sessionAddress);

  const { data, error } = await supabase
    .from("api_keys")
    .insert({ key: await hashApiKey(key), owner_address: sessionAddress, label: label ?? "Default" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ key: data });
}

export async function DELETE(req: NextRequest) {
  // Require valid session
  const sessionAddress = await getSessionAddress(req);
  if (!sessionAddress) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  await supabase.from("api_keys").delete().eq("owner_address", sessionAddress);
  return NextResponse.json({ success: true });
}
