// API del panel para la Bandeja de entrada (HU-11): resumen de visitas, clics y catálogo.
// Exige la sesión de Supabase Auth (Authorization: Bearer).
import { tokenDe, usuarioDeToken, supabaseConfigurado } from "../../../../lib/supabase";
import { resumen } from "../../../../lib/metricas";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!supabaseConfigurado()) {
    return Response.json({ error: "El panel no está configurado: faltan las claves de Supabase." }, { status: 500 });
  }
  const token = tokenDe(request);
  if (!(await usuarioDeToken(token))) {
    return Response.json({ error: "Sesión no válida." }, { status: 401 });
  }
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
