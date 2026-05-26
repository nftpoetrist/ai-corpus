import { NextRequest, NextResponse } from "next/server";
import { generateChallenge } from "@/lib/auth";
import { checkRateLimit } from "@/lib/security";

const APTOS_ADDRESS_RE = /^0x[0-9a-f]{1,64}$/i;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, "apikey", 20, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: { address?: string } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const address = (body.address ?? "").toLowerCase().trim();
  if (!address || !APTOS_ADDRESS_RE.test(address)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const nonce = generateChallenge(address);
  return NextResponse.json({ nonce });
}
