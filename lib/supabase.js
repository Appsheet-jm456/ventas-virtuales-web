// Clientes de Supabase (decisión 0009). Solo usan la clave pública: lo que se puede leer o
// escribir lo decide la RLS. La clave secreta solo se usa en lib/supabase-admin.js (decisión 0012).
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const OPCIONES = { auth: { persistSession: false, autoRefreshToken: false } };

export const supabaseConfigurado = () => Boolean(URL && KEY);

// Lectura pública (rol anon).
export const publicClient = () => createClient(URL, KEY, { ...OPCIONES, global: { fetch: (u, o) => fetch(u, { ...o, cache: "no-store" }) } });

// Lectura para armar las páginas públicas (BUG-3): guarda la respuesta 60 s en la caché de Next, así
// la página no consulta Supabase en cada visita. El panel refresca la etiqueta «web» al guardar
// (lib/refrescar.js). Para escribir o leer siempre fresco se usa publicClient().
export const ETIQUETA_WEB = "web";
export const webClient = () =>
  createClient(URL, KEY, { ...OPCIONES, global: { fetch: (u, o) => fetch(u, { ...o, next: { revalidate: 60, tags: [ETIQUETA_WEB] } }) } });

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
