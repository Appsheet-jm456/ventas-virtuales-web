// Usuarios y roles del panel (HU-34, decisión 0012). Todo con la clave secreta, solo en el servidor;
// las reglas de quién puede qué se validan aquí porque esa clave se salta la RLS.
import { adminClient } from "./supabase-admin";
import { MODULOS_PERMISO } from "./modulos";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (v, max) => String(v ?? "").trim().slice(0, max);
const check = ({ data, error }) => { if (error) throw new Error(error.message); return data; };

async function todosLosAuth(sb) {
  const lista = [];
  for (let page = 1; page < 20; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    lista.push(...data.users);
    if (data.users.length < 200) break;
  }
  return lista;
}

export async function listarRoles(sb = adminClient()) {
  const [roles, perfiles] = await Promise.all([
    sb.from("roles").select("id,nombre,descripcion,es_super,rol_permisos(modulo,nivel)").order("es_super", { ascending: false }).order("creado_en").then(check),
    sb.from("perfiles").select("rol_id").then(check),
  ]);
  return roles.map((r) => ({
    id: r.id, nombre: r.nombre, descripcion: r.descripcion, es_super: r.es_super,
    permisos: Object.fromEntries((r.rol_permisos || []).map((p) => [p.modulo, p.nivel])),
    usuarios: perfiles.filter((p) => p.rol_id === r.id).length,
  }));
}

export async function listarUsuarios() {
  const sb = adminClient();
  const [perfiles, roles, auth] = await Promise.all([
    sb.from("perfiles").select("*").order("creado_en").then(check),
    listarRoles(sb),
    todosLosAuth(sb),
  ]);
  const porId = new Map(auth.map((u) => [u.id, u]));
  const rolPor = new Map(roles.map((r) => [r.id, r]));
  const usuarios = perfiles.map((p) => {
    const u = porId.get(p.user_id);
    const rol = rolPor.get(p.rol_id);
    return {
      id: p.user_id, nombre: p.nombre, correo: u?.email || "", rol_id: p.rol_id, rol: rol?.nombre || "",
      es_super: !!rol?.es_super, activo: p.activo, ultimo_acceso: u?.last_sign_in_at || null,
      creado_en: p.creado_en, historial: p.historial || [],
    };
  });
  return { usuarios, roles };
}

// Enlace de un solo uso para crear o cambiar la contraseña. Solo se devuelve el token: el navegador
// arma la dirección con su propio dominio. Lleva vigencia de Supabase (1 hora).
async function tokenDeAcceso(sb, correo) {
  const { data, error } = await sb.auth.admin.generateLink({ type: "recovery", email: correo });
  if (error) throw new Error(error.message);
  return data.properties.hashed_token;
}

async function perfilObjetivo(sb, id) {
  const p = check(await sb.from("perfiles").select("user_id,nombre,rol_id,activo,historial,roles(es_super)").eq("user_id", id).maybeSingle());
  return p ? { ...p, es_super: !!p.roles?.es_super } : null;
}

async function registrar(sb, perfil, acceso, accion, cambios = {}) {
  const historial = [...(perfil.historial || []), { fecha: new Date().toISOString(), por: acceso.correo, accion }].slice(-50);
  const { error } = await sb.from("perfiles").update({ ...cambios, historial, actualizado_en: new Date().toISOString() }).eq("user_id", perfil.user_id);
  if (error) {
    if (/ULTIMO_SUPERADMIN/.test(error.message)) throw new Error("Debe quedar al menos un Superadmin activo.");
    throw new Error(error.message);
  }
}

// Solo un Superadmin puede tocar a otro Superadmin.
const noPuedeTocar = (acceso, objetivo) => objetivo.es_super && !acceso.es_super;

async function rolAsignable(sb, acceso, rolId) {
  const rol = check(await sb.from("roles").select("id,nombre,es_super").eq("id", String(rolId || "")).maybeSingle());
  if (!rol) return { error: "Elige un rol válido." };
  if (rol.es_super && !acceso.es_super) return { error: "Solo un Superadmin puede asignar el rol Superadmin." };
  return { rol };
}

export async function crearUsuario(acceso, datos) {
  const sb = adminClient();
  const nombre = texto(datos?.nombre, 80);
  const correo = texto(datos?.correo, 200).toLowerCase();
  if (!nombre) return { error: "Escribe el nombre." };
  if (!CORREO.test(correo)) return { error: "Escribe un correo válido." };
  const { rol, error: errRol } = await rolAsignable(sb, acceso, datos?.rol_id);
  if (errRol) return { error: errRol };

  // Sin contraseña: no puede entrar hasta activar con su enlace.
  const { data, error } = await sb.auth.admin.createUser({ email: correo, email_confirm: true });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) return { error: "Ya existe un usuario con ese correo." };
    throw new Error(error.message);
  }
  const historial = [{ fecha: new Date().toISOString(), por: acceso.correo, accion: `Creado con el rol ${rol.nombre}` }];
  const { error: e2 } = await sb.from("perfiles").insert({ user_id: data.user.id, nombre, rol_id: rol.id, historial });
  if (e2) {
    await sb.auth.admin.deleteUser(data.user.id);
    throw new Error(e2.message);
  }
  return { ok: true, id: data.user.id, enlace: await tokenDeAcceso(sb, correo), mensaje: `Usuario ${nombre} creado.` };
}

export async function actualizarUsuario(acceso, id, datos) {
  const sb = adminClient();
  const p = await perfilObjetivo(sb, id);
  if (!p) return { error: "No encontré ese usuario." };
  if (noPuedeTocar(acceso, p)) return { error: "Solo un Superadmin puede cambiar a otro Superadmin." };
  const nombre = texto(datos?.nombre, 80);
  if (!nombre) return { error: "Escribe el nombre." };
  const cambios = { nombre };
  const notas = [];
  if (nombre !== p.nombre) notas.push(`Nombre: ${nombre}`);
  if (datos?.rol_id && datos.rol_id !== p.rol_id) {
    if (id === acceso.id) return { error: "No puedes cambiar tu propio rol." };
    const { rol, error } = await rolAsignable(sb, acceso, datos.rol_id);
    if (error) return { error };
    cambios.rol_id = rol.id;
    notas.push(`Rol: ${rol.nombre}`);
  }
  if (!notas.length) return { ok: true, mensaje: "Sin cambios." };
  await registrar(sb, p, acceso, notas.join(" · "), cambios);
  return { ok: true, mensaje: "Usuario actualizado." };
}

export async function cambiarActivo(acceso, id, activo) {
  const sb = adminClient();
  const p = await perfilObjetivo(sb, id);
  if (!p) return { error: "No encontré ese usuario." };
  if (noPuedeTocar(acceso, p)) return { error: "Solo un Superadmin puede cambiar a otro Superadmin." };
  if (id === acceso.id) return { error: "No puedes desactivarte a ti mismo." };
  await registrar(sb, p, acceso, activo ? "Reactivado" : "Desactivado", { activo });
  // El perfil corta el acceso al instante; el bloqueo de Auth impide renovar la sesión o entrar.
  const { error } = await sb.auth.admin.updateUserById(id, { ban_duration: activo ? "none" : "876000h" });
  if (error) throw new Error(error.message);
  return { ok: true, mensaje: activo ? `${p.nombre} reactivado.` : `${p.nombre} desactivado.` };
}

export async function nuevoEnlace(acceso, id) {
  const sb = adminClient();
  const p = await perfilObjetivo(sb, id);
  if (!p) return { error: "No encontré ese usuario." };
  if (noPuedeTocar(acceso, p)) return { error: "Solo un Superadmin puede cambiar a otro Superadmin." };
  if (!p.activo) return { error: "Reactiva el usuario antes de generar el enlace." };
  const { data, error } = await sb.auth.admin.getUserById(id);
  if (error) throw new Error(error.message);
  const enlace = await tokenDeAcceso(sb, data.user.email);
  await registrar(sb, p, acceso, "Generó un enlace de acceso");
  return { ok: true, enlace };
}

// Solo quien nunca entró; a los demás se les desactiva para conservar el historial.
export async function eliminarUsuario(acceso, id) {
  const sb = adminClient();
  const p = await perfilObjetivo(sb, id);
  if (!p) return { error: "No encontré ese usuario." };
  if (noPuedeTocar(acceso, p)) return { error: "Solo un Superadmin puede cambiar a otro Superadmin." };
  if (id === acceso.id) return { error: "No puedes eliminarte a ti mismo." };
  const { data, error } = await sb.auth.admin.getUserById(id);
  if (error) throw new Error(error.message);
  if (data.user.last_sign_in_at) return { error: "Este usuario ya entró al panel: desactívalo para conservar su historial." };
  const { error: e2 } = await sb.auth.admin.deleteUser(id);
  if (e2) throw new Error(/ULTIMO_SUPERADMIN/.test(e2.message) ? "Debe quedar al menos un Superadmin activo." : e2.message);
  return { ok: true, mensaje: `${p.nombre} eliminado.` };
}

// ── Roles: solo Superadmin (lo exige la ruta) ─────────────────────────────────

function validarRol(datos) {
  const nombre = texto(datos?.nombre, 40);
  if (!nombre) return { error: "Escribe el nombre del rol." };
  const descripcion = texto(datos?.descripcion, 200);
  const permisos = [];
  for (const m of MODULOS_PERMISO) {
    const nivel = datos?.permisos?.[m.id];
    if (!nivel) continue;
    if (nivel !== "ver" && nivel !== "editar") return { error: "Nivel de permiso no válido." };
    permisos.push({ modulo: m.id, nivel: m.soloVer ? "ver" : nivel });
  }
  return { nombre, descripcion, permisos };
}

const errorRol = (e) => (/duplicate|unique/i.test(e.message) ? "Ya existe un rol con ese nombre." : e.message);

export async function crearRol(datos) {
  const v = validarRol(datos);
  if (v.error) return v;
  const sb = adminClient();
  const { data, error } = await sb.from("roles").insert({ nombre: v.nombre, descripcion: v.descripcion }).select("id").single();
  if (error) return { error: errorRol(error) };
  if (v.permisos.length) check(await sb.from("rol_permisos").insert(v.permisos.map((p) => ({ ...p, rol_id: data.id }))));
  return { ok: true, id: data.id, mensaje: `Rol ${v.nombre} creado.` };
}

export async function guardarRol(id, datos) {
  const v = validarRol(datos);
  if (v.error) return v;
  const sb = adminClient();
  const rol = check(await sb.from("roles").select("id,es_super").eq("id", String(id || "")).maybeSingle());
  if (!rol) return { error: "No encontré ese rol." };
  if (rol.es_super) return { error: "El rol Superadmin no se puede cambiar." };
  const { error } = await sb.from("roles").update({ nombre: v.nombre, descripcion: v.descripcion, actualizado_en: new Date().toISOString() }).eq("id", id);
  if (error) return { error: errorRol(error) };
  // Primero se escribe lo nuevo y luego se quita lo que sobra: nunca queda un rol sin permisos a medias.
  if (v.permisos.length) check(await sb.from("rol_permisos").upsert(v.permisos.map((p) => ({ ...p, rol_id: id })), { onConflict: "rol_id,modulo" }));
  const quedan = v.permisos.map((p) => p.modulo);
  const sobran = MODULOS_PERMISO.map((m) => m.id).filter((m) => !quedan.includes(m));
  if (sobran.length) check(await sb.from("rol_permisos").delete().eq("rol_id", id).in("modulo", sobran));
  return { ok: true, mensaje: `Rol ${v.nombre} guardado.` };
}

export async function eliminarRol(id) {
  const sb = adminClient();
  const rol = check(await sb.from("roles").select("id,nombre,es_super").eq("id", String(id || "")).maybeSingle());
  if (!rol) return { error: "No encontré ese rol." };
  if (rol.es_super) return { error: "El rol Superadmin no se puede eliminar." };
  const { count } = await sb.from("perfiles").select("user_id", { count: "exact", head: true }).eq("rol_id", id);
  if (count) return { error: `Hay ${count} usuario(s) con este rol: cámbialos de rol primero.` };
  check(await sb.from("roles").delete().eq("id", id));
  return { ok: true, mensaje: `Rol ${rol.nombre} eliminado.` };
}
