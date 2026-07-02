// Catálogo en JSON. Lee Baserow en el servidor (el token nunca llega al
// navegador). Para el público excluye los productos ocultos; el panel de
// administración (que envía la clave en el header x-admin-password) recibe
// TODOS los productos, incluidos los ocultos, para poder republicarlos.
import { getInventory, getPublicInventory } from "../../../lib/inventory";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const provided = request.headers.get("x-admin-password") || "";
    const isAdmin = adminPassword && provided === adminPassword;

    const { rows, demo } = isAdmin ? await getInventory() : await getPublicInventory();
    return Response.json({ rows, demo, total: rows.length });
  } catch (err) {
    return Response.json(
      { error: "No pude leer el catálogo: " + String(err?.message || err), rows: [] },
      { status: 200 }
    );
  }
}
