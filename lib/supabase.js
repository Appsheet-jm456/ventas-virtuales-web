// Clientes de Supabase (decisión 0009). Solo usan la clave pública: lo que se puede leer o
// escribir lo decide la RLS. La clave secreta (SUPABASE_SECRET_KEY) no se usa en la web.
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const OPCIONES = { auth: { persistSession: false, autoRefreshToken: false } };

export const supabaseConfigurado = () => Boolean(URL && KEY);

// Lectura pública (rol anon).
export const publicClient = () => createClient(URL, KEY, { ...OPCIONES, global: { fetch: (u, o) => fetch(u, { ...o, cache: "no-store" }) } });

// Cliente que actúa con el token de la sesión del administrador.
export const userClient = (token) =>
  createClient(URL, KEY, {
    ...OPCIONES,
    global: { headers: { Authorization: `Bearer ${token}` }, fetch: (u, o) => fetch(u, { ...o, cache: "no-store" }) },
  });

// Devuelve el usuario del token o null.
export async function usuarioDeToken(token) {
  if (!token || !supabaseConfigurado()) return null;
  const { data, error } = await userClient(token).auth.getUser(token);
  return error ? null : data.user;
}

// Extrae el token "Bearer" de una petición.
export const tokenDe = (request) => (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
