// API del panel para la página «Nosotros» (HU-33): leer y guardar. Exige la sesión de Supabase
// Auth (Authorization: Bearer); la RLS repite la verificación de permisos (HU-34).
import { exigir, sinPermiso } from "../../../../lib/permisos";
import { tienePermiso } from "../../../../lib/modulos";
import { leerNosotros, guardarNosotros } from "../../../../lib/nosotros";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const a = await exigir(request, "politicas");
  if (a.respuesta) return a.respuesta;
  const { token, acceso } = a;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición inválida." }, { status: 400 });
  }
  if (body?.op !== "leer" && !tienePermiso(acceso.permisos, "politicas", "editar")) return sinPermiso();

  try {
    if (body?.op === "leer") return Response.json(await leerNosotros(token));
    if (body?.op === "guardar") return Response.json(await guardarNosotros(token, body.nosotros));
    return Response.json({ error: "Operación no reconocida." }, { status: 400 });
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 200 });
  }
}
