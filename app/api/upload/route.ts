import { NextRequest, NextResponse } from "next/server";
import { uploadToShelby } from "@/lib/shelby";
import { supabase } from "@/lib/supabase";
import {
  checkRateLimit,
  sanitizeText,
  sanitizeTags,
  validateUploadFile,
} from "@/lib/security";

const ALLOWED_VISIBILITIES = ["Public", "Unlisted", "Private"];
const ALLOWED_DURATIONS = ["7 days", "30 days", "90 days", "365 days"];

// Aptos address: 0x followed by 1-64 hex chars
const APTOS_ADDRESS_RE = /^0x[0-9a-f]{1,64}$/i;

export async function POST(req: NextRequest) {
  // Rate limiting: 10 uploads per hour per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, "upload", 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.retryAfterMs ?? 60000) / 1000)) },
      }
    );
  }

  try {
    const form = await req.formData();

    const file = form.get("file") as File | null;
    const title = sanitizeText((form.get("title") as string) ?? "", 200);
    const summary = sanitizeText((form.get("summary") as string) ?? "", 1000);
    const authorAddress = ((form.get("authorAddress") as string) ?? "").toLowerCase().trim();
    const durationRaw = (form.get("duration") as string) ?? "365 days";
    const visibilityRaw = (form.get("visibility") as string) ?? "Public";
    const tagsRaw = (form.get("tags") as string) ?? "";

    // Required field validation
    if (!file || !title || !authorAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate address format
    if (!APTOS_ADDRESS_RE.test(authorAddress)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    // File validation (server-side — cannot be bypassed by client)
    const fileCheck = validateUploadFile(file);
    if (!fileCheck.valid) {
      return NextResponse.json({ error: fileCheck.error }, { status: 400 });
    }

    // Sanitize enum fields
    const duration = ALLOWED_DURATIONS.includes(durationRaw) ? durationRaw : "365 days";
    const visibility = ALLOWED_VISIBILITIES.includes(visibilityRaw) ? visibilityRaw : "Public";
    const tags = sanitizeTags(tagsRaw);

    const bytes = new Uint8Array(await file.arrayBuffer());

    // Validate bytes are valid UTF-8 text
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      return NextResponse.json({ error: "File contains invalid characters" }, { status: 400 });
    }

    // Server-side injection check
    if (/<script[\s>]/i.test(text) || /<iframe[\s>]/i.test(text) || /javascript:/i.test(text)) {
      return NextResponse.json({ error: "File contains disallowed content" }, { status: 400 });
    }

    const lineCount = text.split("\n").length;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
    const blobName = `uploads/${authorAddress.slice(0, 10)}/${Date.now()}-${safeName}`;

    const { blobName: storedBlobName, accountAddress } = await uploadToShelby(bytes, blobName, duration);

    const { data, error } = await supabase
      .from("posts")
      .insert({
        blob_name: storedBlobName,
        account_address: accountAddress,
        author_address: authorAddress,
        title,
        summary,
        tags,
        visibility,
        file_name: safeName,
        file_size: `${(file.size / 1024).toFixed(0)} KB`,
        lines: lineCount,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ post: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
