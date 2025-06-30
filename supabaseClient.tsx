// supabaseClient.tsx

import { createBrowserClient } from '@supabase/ssr'

// Busca as variáveis de ambiente de forma segura.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica se as variáveis foram carregadas corretamente.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As variáveis de ambiente do Supabase não foram definidas. Verifique o seu ficheiro .env.local");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)