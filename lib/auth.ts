import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { Ed25519PublicKey, Ed25519Signature } from "@aptos-labs/ts-sdk";

const SESSION_COOKIE = "ai_corpus_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours
const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── JWT ───────────────────────────────────────────────────────────────────────

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET env var not set");
  return new TextEncoder().encode(s);
}

export async function signSession(address: string): Promise<string> {
  return new SignJWT({ address })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<{ address: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.address !== "string") return null;
    return { address: payload.address };
  } catch {
    return null;
  }
}

export async function getSessionAddress(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  return payload?.address ?? null;
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

// ── Nonce Store (single-use, 5-min TTL) ──────────────────────────────────────

const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

function pruneNonces() {
  const now = Date.now();
  for (const [addr, data] of nonceStore) {
    if (now > data.expiresAt) nonceStore.delete(addr);
  }
}

export function generateChallenge(address: string): string {
  pruneNonces();
  // Use crypto.randomUUID for a secure, unpredictable nonce
  const nonce = crypto.randomUUID();
  nonceStore.set(address.toLowerCase(), { nonce, expiresAt: Date.now() + NONCE_TTL_MS });
  return nonce;
}

export function consumeChallenge(address: string, nonce: string): boolean {
  pruneNonces();
  const stored = nonceStore.get(address.toLowerCase());
  if (!stored) return false;
  if (stored.nonce !== nonce) return false;
  if (Date.now() > stored.expiresAt) return false;
  nonceStore.delete(address.toLowerCase()); // single-use
  return true;
}

// ── API Key Hashing ───────────────────────────────────────────────────────────

export async function hashApiKey(key: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Signature Verification ────────────────────────────────────────────────────
// Aptos signMessage signs the bytes of:
//   "APTOS\nmessage: {message}\nnonce: {nonce}"
// We reconstruct fullMessage server-side to prevent tampering.

export function verifyAptosSignMessage(opts: {
  expectedMessage: string; // the original message we asked to sign
  expectedNonce: string;   // the nonce from our challenge
  signature: unknown;      // raw from wallet (string | string[] | object)
  publicKey: string;       // account.publicKey.toString()
}): boolean {
  try {
    const { expectedMessage, expectedNonce, signature, publicKey } = opts;

    // Reconstruct fullMessage server-side — never trust client's fullMessage
    const fullMessage = `APTOS\nmessage: ${expectedMessage}\nnonce: ${expectedNonce}`;
    const msgBytes = new TextEncoder().encode(fullMessage);

    // Normalize public key — strip 0x prefix, handle 33-byte AnyPublicKey wrapper
    let pubKeyHex = publicKey.replace(/^0x/i, "");
    if (pubKeyHex.length === 66) {
      // 33 bytes: first byte is scheme (0x00 = Ed25519), strip it
      pubKeyHex = pubKeyHex.slice(2);
    }
    if (pubKeyHex.length !== 64) {
      console.error("[auth] unexpected pubkey length:", pubKeyHex.length);
      return false;
    }

    // Normalize signature — handle string, array, or object with .toString()
    let sigHex: string;
    if (Array.isArray(signature)) {
      const first = signature[0];
      sigHex = typeof first === "string" ? first : String(first);
    } else {
      sigHex = String(signature);
    }
    sigHex = sigHex.replace(/^0x/i, "");
    if (sigHex.length !== 128) {
      console.error("[auth] unexpected sig length:", sigHex.length);
      return false;
    }

    const pubKey = new Ed25519PublicKey(pubKeyHex);
    const sig = new Ed25519Signature(sigHex);
    return pubKey.verifySignature({ message: msgBytes, signature: sig });
  } catch (e) {
    console.error("[auth] verifyAptosSignMessage threw:", e);
    return false;
  }
}
