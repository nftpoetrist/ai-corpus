import { NextRequest, NextResponse } from "next/server";
import { consumeChallenge, verifyAptosSignMessage, signSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/security";

const APTOS_ADDRESS_RE = /^0x[0-9a-f]{1,64}$/i;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, "apikey", 20, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: { address?: string; nonce?: string; signature?: unknown; publicKey?: string } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { nonce, signature, publicKey } = body;
  const address = (body.address ?? "").toLowerCase().trim();

  if (!address || !nonce || !signature || !publicKey) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!APTOS_ADDRESS_RE.test(address)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  // Consume nonce — single-use, 5-min TTL
  const nonceValid = consumeChallenge(address, nonce);
  if (!nonceValid) {
    return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 401 });
  }

  // Verify signature — fullMessage reconstructed server-side
  const valid = verifyAptosSignMessage({
    expectedMessage: nonce,
    expectedNonce: "1",
    signature,
    publicKey: String(publicKey),
  });

  if (!valid) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  // Issue JWT session cookie
  const token = await signSession(address);
  const res = NextResponse.json({ ok: true, address });
  setSessionCookie(res, token);
  return res;
}
