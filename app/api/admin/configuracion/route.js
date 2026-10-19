// API del panel para la configuración de la tienda (HU-15): leer y guardar.
// Exige la sesión de Supabase Auth (Authorization: Bearer); la RLS solo deja escribir al
// usuario autenticado.
import { tokenDe, usuarioDeToken, supabaseConfigurado } from "../../../../lib/supabase";
import { leerConfiguracion, guardarConfiguracion, EMPRESA_BASE, CATALOGO_BASE } from "../../../../lib/configuracion";

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
    if (body?.op === "leer") {
      return Response.json({ ...(await leerConfiguracion(token)), base: { empresa: EMPRESA_BASE, catalogo: CATALOGO_BASE } });
    }
    if (body?.op === "guardar") {
      const r = await guardarConfiguracion(token, { empresa: body.empresa, catalogo: body.catalogo });
      return Response.json(r.error ? { error: r.error } : { ok: true, mensaje: "Configuración guardada.", empresa: r.empresa, catalogo: r.catalogo });
    }
    return Response.json({ error: "Operación no reconocida." }, { status: 400 });
  } catch (err) {
    const m = String(err?.message || err);
    const msg = /row-level security|permission denied|JWT/i.test(m) ? "Tu sesión no tiene permiso para esto. Vuelve a entrar." : m;
    return Response.json({ error: msg });
  }
}
