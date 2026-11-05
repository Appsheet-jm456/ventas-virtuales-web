"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { supabaseNavegador } from "../../lib/supabase-browser";
import { permisoDeRuta, tienePermiso } from "../../lib/modulos";

// Marco de /admin (HU-07 y HU-10): acceso con correo y contraseña, panel lateral plegable y
// encabezado. Los módulos viven en app/admin/<módulo>/page.js y leen la sesión con useAdmin().

const AdminCtx = createContext(null);
export const useAdmin = () => useContext(AdminCtx);

const ICONOS = {
  inbox: <><path d="M3 13l2.5-7.5A2 2 0 0 1 7.4 4h9.2a2 2 0 0 1 1.9 1.5L21 13" /><path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-5.5a2.5 2.5 0 0 1-5 0H3z" /></>,
  box: <><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3.3 7.5L12 12.5l8.7-5M12 22V12.5" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-8 8" /></>,
  tag: <><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.3" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  ext: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  out: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
};

function Ico({ n }) {
  return (
    <svg className="adm-i" viewBox="0 0 24 24" aria-hidden="true">{ICONOS[n]}</svg>
  );
}

// Los módulos del panel. `ruta` es la dirección; Bandeja es la portada del panel.
export const MODULOS = [
  { ruta: "/admin", nombre: "Bandeja de entrada", icono: "inbox", permiso: "bandeja" },
  { ruta: "/admin/productos", nombre: "Productos", icono: "box", permiso: "productos" },
  { ruta: "/admin/banners", nombre: "Banners e imágenes", icono: "image", permiso: "banners" },
  { ruta: "/admin/categorias", nombre: "Categorías", icono: "tag", permiso: "categorias" },
  { ruta: "/admin/politicas", nombre: "Políticas", icono: "doc", permiso: "politicas" },
  { ruta: "/admin/configuracion/usuarios", nombre: "Usuarios", icono: "users", permiso: "usuarios" },
  { ruta: "/admin/configuracion", nombre: "Configuración", icono: "gear", permiso: "configuracion" },
];
const MI_CUENTA = { ruta: "/admin/cuenta", nombre: "Mi cuenta", icono: "user", permiso: null };

const CLAVE_PLEGADO = "vv-admin-plegado";

function moduloActivo(pathname) {
  const exacto = MODULOS.find((m) => m.ruta === pathname);
  if (exacto) return exacto;
  if (pathname === MI_CUENTA.ruta) return MI_CUENTA;
  return MODULOS.filter((m) => m.ruta !== "/admin").find((m) => pathname.startsWith(m.ruta + "/")) || MODULOS[0];
}

// Título del encabezado: el del módulo, salvo en las páginas de crear o editar producto (HU-18).
function tituloDe(pathname, modulo) {
  if (pathname === "/admin/productos/nuevo") return "Nuevo producto";
  if (/^\/admin\/productos\/[^/]+$/.test(pathname)) return "Editar producto";
  if (pathname === "/admin/politicas/nueva") return "Nueva página";
  if (pathname === "/admin/configuracion/nosotros") return "Página Nosotros";
  if (pathname === "/admin/configuracion/usuarios") return "Usuarios";
  if (/^\/admin\/politicas\/[^/]+$/.test(pathname)) return "Editar página";
  return modulo.nombre;
}

export default function AdminShell({ children }) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  // Quién entró y qué puede hacer (HU-34). Se vuelve a pedir al cambiar de módulo: un cambio de rol
  // rige en la siguiente acción. La protección real está en la API y en la RLS.
  const [acceso, setAcceso] = useState(null);
  const [errAcceso, setErrAcceso] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [gateError, setGateError] = useState("");
  // Plegado = solo iconos. Se lee del navegador después de montar para no desajustar el HTML.
  const [plegado, setPlegado] = useState(true);

  useEffect(() => {
    const sb = supabaseNavegador();
    if (!sb) { setChecking(false); return; }
    sb.auth.getSession().then(({ data }) => { setAuthed(!!data.session); setChecking(false); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setAuthed(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let guardado = null;
    try { guardado = localStorage.getItem(CLAVE_PLEGADO); } catch {}
    if (guardado === null) setPlegado(window.matchMedia("(max-width: 720px)").matches);
    else setPlegado(guardado === "1");
  }, []);

  function cambiarPlegado(v) {
    setPlegado(v);
    try { localStorage.setItem(CLAVE_PLEGADO, v ? "1" : "0"); } catch {}
  }

  // En celular el panel abierto se superpone: se cierra al elegir un módulo.
  useEffect(() => {
    if (window.matchMedia("(max-width: 720px)").matches) setPlegado(true);
  }, [pathname]);

  async function token() {
    const sb = supabaseNavegador();
    const { data } = sb ? await sb.auth.getSession() : { data: {} };
    return data?.session?.access_token || "";
  }

  async function logout() {
    await supabaseNavegador()?.auth.signOut();
    setAuthed(false); setPw(""); setAcceso(null);
  }

  useEffect(() => {
    if (!authed) return;
    let vivo = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/sesion", {
          method: "POST",
          headers: { Authorization: `Bearer ${await token()}` },
        });
        const d = await res.json();
        if (!vivo) return;
        if (res.status === 401) { logout(); return; }
        if (d.acceso) { setAcceso(d.acceso); setErrAcceso(""); } else setErrAcceso(d.error || "No pude leer tu acceso.");
      } catch (e) {
        if (vivo) setErrAcceso("No pude leer tu acceso. Revisa la conexión y recarga.");
      }
    })();
    return () => { vivo = false; };
  }, [authed, pathname]);

  const permisos = acceso?.permisos || {};
  const puede = (modulo, nivel = "ver") => tienePermiso(permisos, modulo, nivel);
  const visibles = MODULOS.filter((m) => puede(m.permiso));
  const permisoRuta = permisoDeRuta(pathname);
  const permitido = permisoRuta === null || puede(permisoRuta);

  // Quien no tiene Bandeja entra a su primer módulo; si no tiene ninguno, a Mi cuenta.
  useEffect(() => {
    if (acceso?.activo && pathname === "/admin" && !permitido) router.replace(visibles[0]?.ruta || MI_CUENTA.ruta);
  }, [acceso, pathname]);

  async function enter(e) {
    e?.preventDefault();
    setGateError("");
    const sb = supabaseNavegador();
    if (!sb) { setGateError("El panel no está configurado en el servidor (faltan las claves de Supabase)."); return; }
    if (!email.trim() || !pw) { setGateError("Escribe el correo y la contraseña."); return; }
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pw });
    if (error) { setGateError("Correo o contraseña incorrectos."); return; }
    setPw("");
  }

  if (checking) return <main className="adm-center"><p>Cargando…</p></main>;
  if (!authed) {
    return (
      <main className="adm-center">
        <form className="admin-gate" onSubmit={enter}>
          <h1>Panel de administración</h1>
          <p>Catálogo de Ventas Virtual Colombia. Entra con tu correo y contraseña.</p>
          <input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" autoFocus />
          <input className="input" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Contraseña" />
          <button className="btn full" type="submit">Entrar</button>
          {gateError && <div className="form-error">{gateError}</div>}
        </form>
      </main>
    );
  }

  if (errAcceso && !acceso) {
    return (
      <main className="adm-center">
        <div className="admin-gate">
          <h1>No pude abrir el panel</h1>
          <p>{errAcceso}</p>
          <button type="button" className="btn full" onClick={logout}>Salir</button>
        </div>
      </main>
    );
  }
  if (!acceso) return <main className="adm-center"><p>Cargando…</p></main>;
  if (!acceso.activo) {
    return (
      <main className="adm-center">
        <div className="admin-gate">
          <h1>Sin acceso al panel</h1>
          <p>Tu usuario está desactivado o aún no tiene un rol. Habla con quien administra el panel.</p>
          <button type="button" className="btn full" onClick={logout}>Salir</button>
        </div>
      </main>
    );
  }

  const actual = moduloActivo(pathname);
  // Módulo solo de consulta: el formulario queda deshabilitado. Productos y Usuarios tienen sus
  // listados con filtros y resuelven por su cuenta qué ocultar; su edición sí se deshabilita aquí.
  const soloConsulta = permisoRuta !== null && permisoRuta !== "bandeja" && permisoRuta !== "usuarios"
    && permitido && !puede(permisoRuta, "editar");
  const consultaBloquea = soloConsulta && pathname !== "/admin/productos";

  return (
    <AdminCtx.Provider value={{ token, logout, acceso, puede }}>
      <div className={`adm${plegado ? " mini" : ""}`}>
        <aside className="adm-side" id="adm-side" aria-label="Menú del panel">
          <div className="adm-brand">
            <span className="adm-logo">VV</span>
            <span className="adm-brand-t"><b>Ventas Virtual</b><small>Panel de administración</small></span>
          </div>
          <nav className="adm-nav" aria-label="Módulos">
            <div className="adm-nav-h">Módulos</div>
            {visibles.map((m) => (
              <Link
                key={m.ruta}
                href={m.ruta}
                className="adm-link"
                data-tip={m.nombre}
                aria-label={m.nombre}
                aria-current={m.ruta === actual.ruta ? "page" : undefined}
              >
                <Ico n={m.icono} />
                <span className="adm-lbl">{m.nombre}</span>
              </Link>
            ))}
          </nav>
          <div className="adm-foot">
            <Link
              href={MI_CUENTA.ruta}
              className="adm-link"
              data-tip={`${acceso.nombre || MI_CUENTA.nombre} · ${acceso.rol}`}
              aria-label={`Mi cuenta: ${acceso.nombre}, ${acceso.rol}`}
              aria-current={pathname === MI_CUENTA.ruta ? "page" : undefined}
            >
              <Ico n={MI_CUENTA.icono} />
              <span className="adm-lbl">{acceso.nombre || MI_CUENTA.nombre}<small className="adm-rol">{acceso.rol}</small></span>
            </Link>
            <button type="button" className="adm-link" data-tip="Cerrar sesión" aria-label="Cerrar sesión" onClick={logout}>
              <Ico n="out" />
              <span className="adm-lbl">Cerrar sesión</span>
            </button>
          </div>
        </aside>
        <div className="adm-scrim" onClick={() => cambiarPlegado(true)} />

        <div className="adm-main">
          <header className="adm-top">
            <button
              type="button"
              className="adm-ibtn"
              aria-label={plegado ? "Abrir el menú" : "Plegar el menú"}
              aria-expanded={!plegado}
              aria-controls="adm-side"
              onClick={() => cambiarPlegado(!plegado)}
            >
              <Ico n="menu" />
            </button>
            <h1>{tituloDe(pathname, actual)}</h1>
            <span className="adm-sp" />
            <Link className="adm-site" href="/" target="_blank" rel="noopener noreferrer" aria-label="Ver la web">
              <Ico n="ext" /><span>Ver la web</span>
            </Link>
          </header>
          <main className="adm-content">
            <div className="adm-page">
              {!permitido ? (
                pathname === "/admin" ? <p>Cargando…</p> : (
                  <div className="pr-card" role="alert">
                    <h2 className="pr-h">Sin permiso</h2>
                    <p className="pr-sub">Tu rol no tiene acceso a este módulo.</p>
                    <Link className="btn pr-btn" href={visibles[0]?.ruta || MI_CUENTA.ruta}>Ir a mi inicio</Link>
                  </div>
                )
              ) : (
                <>
                  {soloConsulta && <p className="adm-consulta" role="status">Solo consulta: tu rol puede ver este módulo, pero no cambiarlo.</p>}
                  {consultaBloquea ? <fieldset disabled className="adm-fs">{children}</fieldset> : children}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </AdminCtx.Provider>
  );
}
