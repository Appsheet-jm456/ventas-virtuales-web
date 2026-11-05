// API del panel para roles y permisos (HU-34): solo el Superadmin.
import { exigir, sinPermiso } from "../../../../lib/permisos";
import { adminConfigurado } from "../../../../lib/supabase-admin";
import { crearRol, guardarRol, eliminarRol } from "../../../../lib/usuarios";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const a = await exigir(request, null);
  if (a.respuesta) return a.respuesta;
  if (!a.acceso.es_super) return sinPermiso();
  if (!adminConfigurado()) return Response.json({ error: "Falta configurar SUPABASE_SECRET_KEY en el servidor." }, { status: 500 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición inválida." }, { status: 400 });
  }
  try {
    switch (body?.op) {
      case "crear": return Response.json(await crearRol(body.datos));
      case "guardar": return Response.json(await guardarRol(body.id, body.datos));
      case "eliminar": return Response.json(await eliminarRol(body.id));
      default: return Response.json({ error: "Operación no reconocida." }, { status: 400 });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) });
  }
}
