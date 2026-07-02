// API del panel de administración: crear / actualizar / eliminar productos.
// Protegida con ADMIN_PASSWORD (header x-admin-password).
import { createRow, updateRow, deleteRow } from "../../../lib/inventory";

export const dynamic = "force-dynamic";

// Columnas permitidas (nombres EXACTOS de Baserow, con tildes).
const COLUMNS = [
  "Código", "Categoría", "Descripción", "Marca", "Modelo", "Procesador",
  "Generación", "RAM", "Almacenamiento", "Estado", "Precio", "Stock",
  "Foto", "Video", "Oculto",
];

function toNumberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return isNaN(n) ? null : n;
}

// Filtra el payload a columnas conocidas y normaliza Precio/Stock a número.
function sanitizeFields(fields) {
  const out = {};
  for (const col of COLUMNS) {
    if (!(col in fields)) continue;
    const v = fields[col];
    if (col === "Precio" || col === "Stock") {
      const n = toNumberOrNull(v);
      if (n !== null) out[col] = n;
      else if (v === "" || v === null) out[col] = null;
    } else {
      out[col] = v === null || v === undefined ? "" : String(v).trim();
    }
  }
  return out;
}

function friendlyError(msg) {
  const m = String(msg || "");
  if (m.includes("401") || m.includes("403")) {
    return "El token de Baserow no tiene permisos suficientes (Create/Update/Delete). Revisa los permisos del token.";
  }
  // La columna "Oculto" (para 'Quitar de la tienda') aún no existe en Baserow.
  if (/oculto/i.test(m) || /ERROR_FIELD/i.test(m) || /field.*(does not exist|not found|unknown)/i.test(m)) {
    return "Para usar 'Quitar de la tienda' primero crea en tu tabla de Baserow una columna llamada exactamente \"Oculto\" (tipo Texto de una línea). No borres las demás columnas.";
  }
  return m;
}

export async function POST(request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return Response.json({ error: "El panel no está configurado: falta ADMIN_PASSWORD en el servidor." }, { status: 500 });
  }
  const provided = request.headers.get("x-admin-password") || "";
  if (provided !== adminPassword) {
    return Response.json({ error: "Clave de administración incorrecta." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición inválida." }, { status: 400 });
  }

  const op = body?.op;
  const id = body?.id;
  const fields = sanitizeFields(body?.fields || {});

  try {
    if (op === "create") {
      if (!fields["Código"]) return Response.json({ error: "El Código es obligatorio." }, { status: 400 });
      const created = await createRow(fields);
      return Response.json({ ok: true, mensaje: `Producto ${fields["Código"]} creado.`, row: created });
    }
    if (op === "update") {
      if (!id) return Response.json({ error: "Falta el id de la fila." }, { status: 400 });
      const updated = await updateRow(id, fields);
      return Response.json({ ok: true, mensaje: "Producto actualizado.", row: updated });
    }
    if (op === "delete") {
      if (!id) return Response.json({ error: "Falta el id de la fila." }, { status: 400 });
      await deleteRow(id);
      return Response.json({ ok: true, mensaje: "Producto eliminado." });
    }
    return Response.json({ error: "Operación no reconocida." }, { status: 400 });
  } catch (err) {
    return Response.json({ error: "⚠️ " + friendlyError(err?.message || err) }, { status: 200 });
  }
}
