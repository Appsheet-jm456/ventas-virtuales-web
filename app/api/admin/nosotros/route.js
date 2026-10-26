// API del panel para la página «Nosotros» (HU-33): leer y guardar. Exige la sesión de Supabase
// Auth (Authorization: Bearer); la RLS solo deja escribir al usuario autenticado.
import { tokenDe, usuarioDeToken, supabaseConfigurado } from "../../../../lib/supabase";
import { leerNosotros, guardarNosotros } from "../../../../lib/nosotros";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!supabaseConfigurado()) {
    return Response.json({ error: "El panel no está configurado: faltan las claves de Supabase." }, { status: 500 });
  }
  const token = tokenDe(request);
  if (!(await usuarioDeToken(token))) {
    return Response.json({ error: "Sesión no válida." }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición inválida." }, { status: 400 });
  }
  try {
    if (body?.op === "leer") return Response.json(await leerNosotros(token));
    if (body?.op === "guardar") return Response.json(await guardarNosotros(token, body.nosotros));
    return Response.json({ error: "Operación no reconocida." }, { status: 400 });
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 200 });
  }
}
