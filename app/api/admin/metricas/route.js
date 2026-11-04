// API del panel para la Bandeja de entrada (HU-11): resumen de visitas, clics y catálogo.
// Exige la sesión de Supabase Auth (Authorization: Bearer).
import { exigir } from "../../../../lib/permisos";
import { resumen } from "../../../../lib/metricas";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const a = await exigir(request, "bandeja");
  if (a.respuesta) return a.respuesta;
  const { token } = a;
  let body = {};
  try {
    body = await request.json();
  } catch {
    // Sin cuerpo: periodo por defecto.
  }
  try {
    return Response.json(await resumen(token, String(body?.periodo || "14")));
  } catch (err) {
    return Response.json({ error: String(err?.message || err) });
  }
}
