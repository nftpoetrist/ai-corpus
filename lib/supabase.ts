import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export type DbPost = {
  id: string;
  blob_name: string;
  account_address: string;
  author_address: string;
  title: string;
  summary: string;
  tags: string[];
  visibility: "Public" | "Unlisted" | "Private";
  file_name: string | null;
  file_size: string | null;
  lines: number;
  created_at: string;
  likes: number;
  tips: number;
  reads: number;
};
