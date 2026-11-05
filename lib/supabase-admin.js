// Cliente con la clave secreta (decisión 0012). SOLO en el servidor y solo para administrar usuarios
// y roles: se salta la RLS. La variable no lleva NEXT_PUBLIC_, así que nunca llega al navegador.
import { createClient } from "@supabase/supabase-js";

export const adminConfigurado = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);

export function adminClient() {
  if (!adminConfigurado()) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (u, o) => fetch(u, { ...o, cache: "no-store" }) },
  });
}
