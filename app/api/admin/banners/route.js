// API del panel para banners (HU-13): listar, crear, actualizar, reordenar y quitar.
// Exige la sesión de Supabase Auth (Authorization: Bearer); la RLS solo deja escribir al
// usuario autenticado.
import { tokenDe, usuarioDeToken, supabaseConfigurado } from "../../../../lib/supabase";
import { listarBanners, crearBanner, actualizarBanner, reordenarBanners, quitarBanner } from "../../../../lib/banners";

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
  const { op, id, campos = {} } = body || {};
  try {
    if (op === "listar") return Response.json({ banners: await listarBanners(token) });
    if (op === "crear") {
      const r = await crearBanner(token, campos);
      return Response.json(r.error ? { error: r.error } : { ok: true, banner: r.banner });
    }
    if (op === "actualizar") {
      if (!id) return Response.json({ error: "Falta el id del banner." }, { status: 400 });
      const r = await actualizarBanner(token, id, campos);
      return Response.json(r.error ? { error: r.error } : { ok: true, banner: r.banner });
    }
    if (op === "reordenar") {
      const r = await reordenarBanners(token, body.ids);
      return Response.json(r.error ? { error: r.error } : { ok: true });
    }
    if (op === "quitar") {
      if (!id) return Response.json({ error: "Falta el id del banner." }, { status: 400 });
      return Response.json(await quitarBanner(token, id));
    }
    return Response.json({ error: "Operación no reconocida." }, { status: 400 });
  } catch (err) {
    const m = String(err?.message || err);
    const msg = /row-level security|permission denied|JWT/i.test(m) ? "Tu sesión no tiene permiso para esto. Vuelve a entrar." : m;
    return Response.json({ error: msg });
  }
}
