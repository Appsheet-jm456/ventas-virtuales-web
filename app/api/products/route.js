// Catálogo público en JSON. Lee Baserow en el servidor (el token nunca llega
// al navegador). El frontend lo consume para filtrar/buscar en el cliente.
import { getInventory } from "../../../lib/inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows, demo } = await getInventory();
    return Response.json({ rows, demo, total: rows.length });
  } catch (err) {
    return Response.json(
      { error: "No pude leer el catálogo: " + String(err?.message || err), rows: [] },
      { status: 200 }
    );
  }
}
