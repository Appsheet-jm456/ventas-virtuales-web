// Catálogo en JSON. El público recibe solo lo activo y las columnas de venta (RN-04). El panel
// envía el token de su sesión (Authorization: Bearer) y recibe TODO, incluidos los ocultos.
import { getInventory, getPublicInventory } from "../../../lib/inventory";
import { tokenDe, usuarioDeToken } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const token = tokenDe(request);
    const admin = token ? await usuarioDeToken(token) : null;
    if (token && !admin) return Response.json({ error: "Sesión no válida.", rows: [] }, { status: 401 });

    const { rows, demo } = admin ? await getInventory(token) : await getPublicInventory();
    return Response.json({ rows, demo, total: rows.length });
  } catch (err) {
    return Response.json({ error: "No pude leer el catálogo: " + String(err?.message || err), rows: [] }, { status: 200 });
  }
}
