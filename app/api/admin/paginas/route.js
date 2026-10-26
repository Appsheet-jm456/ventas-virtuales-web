// API del panel para las páginas de políticas (HU-26): listar, crear, guardar, mover y borrar.
// Exige la sesión de Supabase Auth (Authorization: Bearer); la RLS solo deja escribir al
// usuario autenticado.
import { tokenDe, usuarioDeToken, supabaseConfigurado } from "../../../../lib/supabase";
import { listarPaginas, crearPagina, actualizarPagina, borrarPagina, moverPagina } from "../../../../lib/paginas";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!supabaseConfigurado()) {
    return Response.json({ error: "El panel no está configurado: faltan las claves de Supabase." }, { status: 500 });
  }
  const token = tokenDe(request);
  if (!(await usuarioDeToken(token))) {
    return Response.json({ error: "Sesión no válida." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición inválida." }, { status: 400 });
  }

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
