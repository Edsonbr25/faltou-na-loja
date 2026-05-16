import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing.");
}

export type ProdutoFaltante = {
  id: string;
  setor: string;
  produto: string;
  cor: string | null;
  quantidade: number | null;
  observacao: string | null;
  created_at: string;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
