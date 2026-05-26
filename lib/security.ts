import { Ed25519PublicKey, Ed25519Signature } from "@aptos-labs/ts-sdk";

// ── Rate Limiter (in-process) ─────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(
  ip: string,
  action: "upload" | "read" | "apikey",
  maxPerWindow: number,
  windowMs: number
): { allowed: boolean; retryAfterMs?: number } {
  const key = `${action}:${ip}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (entry.count >= maxPerWindow) {
    return { allowed: false, retryAfterMs: windowMs - (now - entry.windowStart) };
  }
  entry.count++;
  return { allowed: true };
}

// ── Nonce Tracker (replay attack prevention) ──────────────────────────────────
const usedNonces = new Map<string, number>();

function pruneNonces() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [nonce, ts] of usedNonces) {
    if (ts < cutoff) usedNonces.delete(nonce);
  }
}

export function consumeNonce(nonce: string): boolean {
  pruneNonces();
  if (usedNonces.has(nonce)) return false;
  usedNonces.set(nonce, Date.now());
  return true;
}

// ── Aptos Signature Verification ──────────────────────────────────────────────
export function verifyAptosSignature(
  fullMessage: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const pubKey = new Ed25519PublicKey(publicKey);
    const sig = new Ed25519Signature(signature);
    const msgBytes = new TextEncoder().encode(fullMessage);
    return pubKey.verifySignature({ message: msgBytes, signature: sig });
  } catch {
    return false;
  }
}

export function deriveAddressFromPublicKey(publicKey: string): string {
  try {
    const pubKey = new Ed25519PublicKey(publicKey);
    return pubKey.authKey().derivedAddress().toString();
  } catch {
    return "";
  }
}

// ── Aptos Transaction Verification (for upload auth) ─────────────────────────
const APTOS_TESTNET = "https://fullnode.testnet.aptoslabs.com/v1";
const MAX_TX_AGE_MS = 15 * 60 * 1000; // 15 minutes

export async function verifyAptosTransaction(
  txHash: string,
  expectedSender: string,
  recipientAddress: string
): Promise<{ valid: boolean; error?: string }> {
  if (!txHash || !txHash.startsWith("0x")) {
    return { valid: false, error: "Invalid tx hash format" };
  }
  try {
    const res = await fetch(`${APTOS_TESTNET}/transactions/by_hash/${txHash}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return { valid: false, error: "Transaction not found on chain" };

    const tx = await res.json();

    if (tx.type !== "user_transaction") {
      return { valid: false, error: "Not a user transaction" };
    }
    if (!tx.success) {
      return { valid: false, error: "Transaction failed on chain" };
    }
    if (tx.sender?.toLowerCase() !== expectedSender.toLowerCase()) {
      return { valid: false, error: "Transaction sender mismatch" };
    }

    // Check tx is recent
    const txTimestampMs = parseInt(tx.timestamp ?? "0") / 1000;
    if (Date.now() - txTimestampMs > MAX_TX_AGE_MS) {
      return { valid: false, error: "Transaction is too old" };
    }

    // Verify it was a transfer to the protocol address
    const fn = tx.payload?.function ?? "";
    const args: string[] = tx.payload?.arguments ?? [];
    const isTransfer =
      fn === "0x1::aptos_account::transfer" &&
      args[0]?.toLowerCase() === recipientAddress.toLowerCase();

    if (!isTransfer) {
      return { valid: false, error: "Unexpected transaction type or recipient" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Failed to verify transaction" };
  }
}

// ── Input Sanitization ────────────────────────────────────────────────────────
export function sanitizeText(input: string, maxLength: number): string {
  return input
    .replace(/[<>]/g, "")
    .slice(0, maxLength)
    .trim();
}

export function sanitizeTags(tagsRaw: string): string[] {
  return tagsRaw
    .split(",")
    .map((t) => sanitizeText(t, 30))
    .filter(Boolean)
    .slice(0, 10);
}

// ── File Validation ───────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 500 * 1024; // 500 KB

export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  if (!file.name.toLowerCase().endsWith(".md")) {
    return { valid: false, error: "Only .md files are accepted" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large (max 500 KB, got ${(file.size / 1024).toFixed(0)} KB)`,
    };
  }
  return { valid: true };
}
