import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type IdeaRow = {
  id: string;
  session_id: string;
  title: string;
  description: string;
  similar_links: string[];
  upvotes: number;
  ai_analysis: unknown | null;
  ai_uniqueness: "original" | "similar_exists" | "common" | null;
  edit_count: number;
  created_at: string;
  updated_at: string;
};

export type UpvoteRow = {
  id: string;
  idea_id: string;
  session_id: string;
  created_at: string;
};

let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    cached = null;
    return null;
  }
  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
