import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { Account, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";

let _client: ShelbyNodeClient | null = null;

function getClient(): ShelbyNodeClient {
  if (!_client) {
    _client = new ShelbyNodeClient({ network: Network.SHELBYNET });
  }
  return _client;
}

function getSigner(): Account {
  const key = process.env.SHELBY_ACCOUNT_PRIVATE_KEY;
  if (!key) throw new Error("SHELBY_ACCOUNT_PRIVATE_KEY env var not set");
  return Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(key) });
}

const DURATION_DAYS: Record<string, number> = {
  "7 days": 7,
  "30 days": 30,
  "90 days": 90,
  "365 days": 365,
};

export async function uploadToShelby(
  data: Uint8Array,
  blobName: string,
  durationLabel: string = "365 days"
): Promise<{ blobName: string; accountAddress: string }> {
  const client = getClient();
  const signer = getSigner();
  const days = DURATION_DAYS[durationLabel] ?? 365;
  const expirationMicros = Date.now() * 1000 + days * 86_400_000_000;

  await client.upload({ blobData: data, signer, blobName, expirationMicros });

  return { blobName, accountAddress: signer.accountAddress.toString() };
}

export async function downloadFromShelby(
  accountAddress: string,
  blobName: string
): Promise<string> {
  const client = getClient();
  const blob = await client.download({ account: accountAddress, blobName });
  const reader = blob.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(merged);
}
