// API del panel para las páginas de políticas (HU-26): listar, crear, guardar, mover y borrar.
// Exige la sesión de Supabase Auth (Authorization: Bearer); la RLS repite la
// verificación de permisos (HU-34).
import { exigir, sinPermiso } from "../../../../lib/permisos";
import { tienePermiso } from "../../../../lib/modulos";
import { listarPaginas, crearPagina, actualizarPagina, borrarPagina, moverPagina } from "../../../../lib/paginas";

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

  if (body?.op !== "listar" && !tienePermiso(acceso.permisos, "politicas", "editar")) return sinPermiso();

  try {
    switch (body?.op) {
      case "listar": return Response.json({ paginas: await listarPaginas(token) });
      case "crear": return Response.json(await crearPagina(token, body.datos));
      case "guardar":
        if (!body.id) return Response.json({ error: "Falta el id de la página." }, { status: 400 });
        return Response.json(await actualizarPagina(token, body.id, body.datos));
      case "mover": return Response.json(await moverPagina(token, body.id, body.dir));
      case "borrar":
        if (!body.id) return Response.json({ error: "Falta el id de la página." }, { status: 400 });
        return Response.json(await borrarPagina(token, body.id));
      default: return Response.json({ error: "Operación no reconocida." }, { status: 400 });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 200 });
  }
}
