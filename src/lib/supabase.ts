import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching DB schema
export type DbPortfolio = {
  id: string;
  user_id: string;
  username: string;
  data: object;
  created_at: string;
  updated_at: string;
};

export type DbUser = {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url: string;
  created_at: string;
};
