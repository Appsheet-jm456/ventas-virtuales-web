// API del panel para categorías (HU-14): listar, crear, actualizar, ordenar y quitar.
// Exige la sesión de Supabase Auth (Authorization: Bearer); la RLS solo deja escribir al
// usuario autenticado.
import { tokenDe, usuarioDeToken, supabaseConfigurado } from "../../../../lib/supabase";
import {
  listarCategorias, crearCategoria, actualizarCategoria, intercambiarOrden, quitarCategoria,
} from "../../../../lib/categorias";

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
    if (op === "listar") return Response.json({ categorias: await listarCategorias(token) });
    if (op === "crear") {
      const r = await crearCategoria(token, campos);
      return Response.json(r.error ? { error: r.error } : { ok: true, mensaje: `Categoría «${r.categoria.nombre}» agregada.`, categoria: r.categoria });
    }
    if (op === "actualizar") {
      if (!id) return Response.json({ error: "Falta el id de la categoría." }, { status: 400 });
      const r = await actualizarCategoria(token, id, campos);
      return Response.json(r.error ? { error: r.error } : { ok: true, categoria: r.categoria });
    }
    if (op === "ordenar") {
      if (!id || !body.con) return Response.json({ error: "Faltan las categorías a ordenar." }, { status: 400 });
      const r = await intercambiarOrden(token, id, body.con);
      return Response.json(r.error ? { error: r.error } : { ok: true });
    }
    if (op === "quitar") {
      if (!id) return Response.json({ error: "Falta el id de la categoría." }, { status: 400 });
      await quitarCategoria(token, id);
      return Response.json({ ok: true });
    }
    return Response.json({ error: "Operación no reconocida." }, { status: 400 });
  } catch (err) {
    const m = String(err?.message || err);
    const msg = /row-level security|permission denied|JWT/i.test(m) ? "Tu sesión no tiene permiso para esto. Vuelve a entrar." : m;
    return Response.json({ error: msg });
  }
}
