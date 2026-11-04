// Catálogo en JSON. El público recibe solo lo activo y las columnas de venta (RN-04). El panel
// envía el token de su sesión y recibe lo que su rol puede ver, incluidos los ocultos (HU-34).
import { getInventory, getPublicInventory } from "../../../lib/inventory";
import { tokenDe } from "../../../lib/supabase";
import { accesoDeToken } from "../../../lib/permisos";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const token = tokenDe(request);
    const admin = token ? await accesoDeToken(token) : null;
    if (token && !admin) return Response.json({ error: "Sesión no válida.", rows: [] }, { status: 401 });
    if (admin && !admin.activo) return Response.json({ error: "Tu usuario está desactivado o no tiene acceso al panel.", rows: [] }, { status: 403 });

    const { rows, demo } = admin ? await getInventory(token) : await getPublicInventory();
    // ?codigos=a,b,c devuelve solo esos productos públicos (HU-30: «Vistos recientemente»).
    // Solo para el público: el panel sigue recibiendo todo.
    const pedidos = admin ? null : new URL(request.url).searchParams.get("codigos");
    if (pedidos !== null) {
      const quiero = new Set(pedidos.split(",").map((c) => c.trim()).filter(Boolean).slice(0, 20));
      const algunos = rows.filter((r) => quiero.has(String(r["Código"] ?? "").trim()));
      return Response.json({ rows: algunos, demo, total: algunos.length });
    }
    return Response.json({ rows, demo, total: rows.length });
  } catch (err) {
    return Response.json({ error: "No pude leer el catálogo: " + String(err?.message || err), rows: [] }, { status: 200 });
  }
}
