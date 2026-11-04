// Verificación de permisos en el servidor (HU-34, decisión 0012). Cada ruta del panel la llama antes
// de actuar; la RLS vuelve a comprobar lo mismo en la base de datos.
import { tokenDe, usuarioDeToken, userClient, supabaseConfigurado } from "./supabase";
import { MODULOS_PERMISO, tienePermiso } from "./modulos";

// Acceso del usuario del token: null si la sesión no vale. activo=false si no tiene perfil activo.
export async function accesoDeToken(token) {
  const user = await usuarioDeToken(token);
  if (!user) return null;
  const sb = userClient(token);
  const base = { id: user.id, correo: user.email, activo: false, es_super: false, nombre: "", rol: "", permisos: {} };
  const { data: perfil, error } = await sb.from("perfiles").select("nombre,activo,rol_id").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error("Supabase: " + error.message);
  if (!perfil || !perfil.activo) return { ...base, nombre: perfil?.nombre || "" };
  const { data: rol, error: e2 } = await sb.from("roles").select("id,nombre,es_super,rol_permisos(modulo,nivel)").eq("id", perfil.rol_id).single();
  if (e2) throw new Error("Supabase: " + e2.message);
  const permisos = rol.es_super
    ? Object.fromEntries(MODULOS_PERMISO.map((m) => [m.id, "editar"]))
    : Object.fromEntries((rol.rol_permisos || []).map((p) => [p.modulo, p.nivel]));
  return { ...base, activo: true, nombre: perfil.nombre, rol: rol.nombre, rol_id: rol.id, es_super: rol.es_super, permisos };
}

export const sinPermiso = () => Response.json({ error: "Tu usuario no tiene permiso para esto." }, { status: 403 });

// Devuelve { token, acceso } o { respuesta } con el error que la ruta debe devolver tal cual.
// `modulo` puede ser null: basta con estar activo.
export async function exigir(request, modulo, nivel = "ver") {
  if (!supabaseConfigurado()) {
    return { respuesta: Response.json({ error: "El panel no está configurado: faltan las claves de Supabase." }, { status: 500 }) };
  }
  const token = tokenDe(request);
  let acceso;
  try {
    acceso = await accesoDeToken(token);
  } catch (e) {
    return { respuesta: Response.json({ error: String(e?.message || e) }, { status: 500 }) };
  }
  if (!acceso) return { respuesta: Response.json({ error: "Sesión no válida." }, { status: 401 }) };
  if (!acceso.activo) return { respuesta: Response.json({ error: "Tu usuario está desactivado o no tiene acceso al panel." }, { status: 403 }) };
  if (modulo && !tienePermiso(acceso.permisos, modulo, nivel)) return { respuesta: sinPermiso() };
  return { token, acceso };
}
