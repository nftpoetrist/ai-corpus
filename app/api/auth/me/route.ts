import { NextRequest, NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const address = await getSessionAddress(req);
  if (!address) return NextResponse.json({ address: null }, { status: 401 });
  return NextResponse.json({ address });
}
