// API del panel para categorías (HU-14): listar, crear, actualizar, ordenar y quitar.
// Exige la sesión de Supabase Auth (Authorization: Bearer); la RLS repite la
// verificación de permisos (HU-34).
import { exigir, sinPermiso } from "../../../../lib/permisos";
import { tienePermiso } from "../../../../lib/modulos";
import {
  listarCategorias, crearCategoria, actualizarCategoria, intercambiarOrden, quitarCategoria,
} from "../../../../lib/categorias";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const a = await exigir(request, "categorias");
  if (a.respuesta) return a.respuesta;
  const { token, acceso } = a;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición inválida." }, { status: 400 });
  }
  const { op, id, campos = {} } = body || {};

  if (body?.op !== "listar" && !tienePermiso(acceso.permisos, "categorias", "editar")) return sinPermiso();

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
