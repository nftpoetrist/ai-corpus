import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSessionAddress } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const author = searchParams.get("author");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const ids = searchParams.get("ids");

  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (ids) {
    // Saved posts: only return Public posts regardless of who's asking
    query = query.in("id", ids.split(",").filter(Boolean)).eq("visibility", "Public");
  } else if (author) {
    // Author filter: return all visibilities only if session matches, otherwise Public only
    const sessionAddress = await getSessionAddress(req);
    const isOwner = sessionAddress?.toLowerCase() === author.toLowerCase();
    if (!isOwner) {
      query = query.eq("author_address", author).eq("visibility", "Public");
    } else {
      query = query.eq("author_address", author);
    }
  } else {
    query = query.eq("visibility", "Public");
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ posts: data ?? [] });
}
