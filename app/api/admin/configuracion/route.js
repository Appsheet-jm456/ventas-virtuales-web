// API del panel para la configuración de la tienda (HU-15): leer y guardar.
// Exige la sesión de Supabase Auth (Authorization: Bearer); la RLS repite la
// verificación de permisos (HU-34).
import { exigir, sinPermiso } from "../../../../lib/permisos";
import { tienePermiso } from "../../../../lib/modulos";
import { leerConfiguracion, guardarConfiguracion, EMPRESA_BASE, CATALOGO_BASE } from "../../../../lib/configuracion";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const a = await exigir(request, "configuracion");
  if (a.respuesta) return a.respuesta;
  const { token, acceso } = a;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición inválida." }, { status: 400 });
  }

  if (body?.op !== "leer" && !tienePermiso(acceso.permisos, "configuracion", "editar")) return sinPermiso();

  try {
    if (body?.op === "leer") {
      return Response.json({ ...(await leerConfiguracion(token)), base: { empresa: EMPRESA_BASE, catalogo: CATALOGO_BASE } });
    }
    if (body?.op === "guardar") {
      const r = await guardarConfiguracion(token, { empresa: body.empresa, catalogo: body.catalogo });
      return Response.json(r.error ? { error: r.error } : { ok: true, mensaje: "Configuración guardada.", empresa: r.empresa, catalogo: r.catalogo });
    }
    return Response.json({ error: "Operación no reconocida." }, { status: 400 });
  } catch (err) {
    const m = String(err?.message || err);
    const msg = /row-level security|permission denied|JWT/i.test(m) ? "Tu sesión no tiene permiso para esto. Vuelve a entrar." : m;
    return Response.json({ error: msg });
  }
}
