// API del panel de administración: crear / actualizar / eliminar productos.
// Exige la sesión de Supabase Auth (Authorization: Bearer); además la RLS solo deja escribir
// a usuarios autenticados.
import { createRow, updateRow, deleteRow } from "../../../lib/inventory";
import { tokenDe, usuarioDeToken, supabaseConfigurado } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

function friendlyError(msg) {
  const m = String(msg || "");
  if (/row-level security|permission denied|JWT/i.test(m)) return "Tu sesión no tiene permiso para esto. Vuelve a entrar.";
  return m;
}

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

  const op = body?.op;
  const id = body?.id;
  const fields = body?.fields || {};

  try {
    if (op === "create") {
      if (!fields["Código"]) return Response.json({ error: "El Código es obligatorio." }, { status: 400 });
      const created = await createRow(token, fields);
      return Response.json({ ok: true, mensaje: `Producto ${fields["Código"]} creado.`, row: created });
    }
    if (op === "update") {
      if (!id) return Response.json({ error: "Falta el id de la fila." }, { status: 400 });
      const updated = await updateRow(token, id, fields);
      return Response.json({ ok: true, mensaje: "Producto actualizado.", row: updated });
    }
    if (op === "delete") {
      if (!id) return Response.json({ error: "Falta el id de la fila." }, { status: 400 });
      await deleteRow(token, id);
      return Response.json({ ok: true, mensaje: "Producto eliminado." });
    }
    return Response.json({ error: "Operación no reconocida." }, { status: 400 });
  } catch (err) {
    return Response.json({ error: "⚠️ " + friendlyError(err?.message || err) }, { status: 200 });
  }
}
