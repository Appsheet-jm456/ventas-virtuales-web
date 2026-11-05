// API del panel para banners (HU-13): listar, crear, actualizar, reordenar y quitar.
// Exige la sesión de Supabase Auth (Authorization: Bearer); la RLS repite la
// verificación de permisos (HU-34).
import { exigir, sinPermiso } from "../../../../lib/permisos";
import { tienePermiso } from "../../../../lib/modulos";
import { listarBanners, crearBanner, actualizarBanner, reordenarBanners, quitarBanner } from "../../../../lib/banners";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const a = await exigir(request, "banners");
  if (a.respuesta) return a.respuesta;
  const { token, acceso } = a;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición inválida." }, { status: 400 });
  }
  const { op, id, campos = {} } = body || {};
  if (body?.op !== "listar" && !tienePermiso(acceso.permisos, "banners", "editar")) return sinPermiso();

  try {
    if (op === "listar") return Response.json({ banners: await listarBanners(token) });
    if (op === "crear") {
      const r = await crearBanner(token, campos);
      return Response.json(r.error ? { error: r.error } : { ok: true, banner: r.banner });
    }
    if (op === "actualizar") {
      if (!id) return Response.json({ error: "Falta el id del banner." }, { status: 400 });
      const r = await actualizarBanner(token, id, campos);
      return Response.json(r.error ? { error: r.error } : { ok: true, banner: r.banner });
    }
    if (op === "reordenar") {
      const r = await reordenarBanners(token, body.ids);
      return Response.json(r.error ? { error: r.error } : { ok: true });
    }
    if (op === "quitar") {
      if (!id) return Response.json({ error: "Falta el id del banner." }, { status: 400 });
      return Response.json(await quitarBanner(token, id));
    }
    return Response.json({ error: "Operación no reconocida." }, { status: 400 });
  } catch (err) {
    const m = String(err?.message || err);
    const msg = /row-level security|permission denied|JWT/i.test(m) ? "Tu sesión no tiene permiso para esto. Vuelve a entrar." : m;
    return Response.json({ error: msg });
  }
}
