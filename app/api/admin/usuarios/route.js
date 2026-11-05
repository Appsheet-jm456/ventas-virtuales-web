// API del panel para usuarios (HU-34): listar, crear, cambiar, desactivar, enlace de acceso y eliminar.
// Exige el permiso Usuarios; las reglas sobre Superadmin y sobre uno mismo están en lib/usuarios.js.
import { exigir, sinPermiso } from "../../../../lib/permisos";
import { tienePermiso } from "../../../../lib/modulos";
import { adminConfigurado } from "../../../../lib/supabase-admin";
import {
  listarUsuarios, crearUsuario, actualizarUsuario, cambiarActivo, nuevoEnlace, eliminarUsuario,
} from "../../../../lib/usuarios";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const a = await exigir(request, "usuarios");
  if (a.respuesta) return a.respuesta;
  const { acceso } = a;
  if (!adminConfigurado()) return Response.json({ error: "Falta configurar SUPABASE_SECRET_KEY en el servidor." }, { status: 500 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición inválida." }, { status: 400 });
  }
  const { op, id, datos } = body || {};
  if (op !== "listar" && !tienePermiso(acceso.permisos, "usuarios", "editar")) return sinPermiso();
  if (op !== "listar" && op !== "crear" && !id) return Response.json({ error: "Falta el usuario." }, { status: 400 });

  try {
    switch (op) {
      case "listar": return Response.json({ ...(await listarUsuarios()), yo: acceso.id, es_super: acceso.es_super });
      case "crear": return Response.json(await crearUsuario(acceso, datos));
      case "actualizar": return Response.json(await actualizarUsuario(acceso, id, datos));
      case "desactivar": return Response.json(await cambiarActivo(acceso, id, false));
      case "reactivar": return Response.json(await cambiarActivo(acceso, id, true));
      case "enlace": return Response.json(await nuevoEnlace(acceso, id));
      case "eliminar": return Response.json(await eliminarUsuario(acceso, id));
      default: return Response.json({ error: "Operación no reconocida." }, { status: 400 });
    }
  } catch (err) {
    return Response.json({ error: String(err?.message || err) });
  }
}
