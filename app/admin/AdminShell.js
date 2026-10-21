"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { supabaseNavegador } from "../../lib/supabase-browser";

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
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  ext: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  out: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
};

function Ico({ n }) {
  return (
    <svg className="adm-i" viewBox="0 0 24 24" aria-hidden="true">{ICONOS[n]}</svg>
  );
}

// Los cinco módulos del panel. `ruta` es la dirección; Bandeja es la portada del panel.
export const MODULOS = [
  { ruta: "/admin", nombre: "Bandeja de entrada", icono: "inbox" },
  { ruta: "/admin/productos", nombre: "Productos", icono: "box" },
  { ruta: "/admin/banners", nombre: "Banners e imágenes", icono: "image" },
  { ruta: "/admin/categorias", nombre: "Categorías", icono: "tag" },
  { ruta: "/admin/configuracion", nombre: "Configuración", icono: "gear" },
];

const CLAVE_PLEGADO = "vv-admin-plegado";

function moduloActivo(pathname) {
  const exacto = MODULOS.find((m) => m.ruta === pathname);
  if (exacto) return exacto;
  return MODULOS.filter((m) => m.ruta !== "/admin").find((m) => pathname.startsWith(m.ruta + "/")) || MODULOS[0];
}

// Título del encabezado: el del módulo, salvo en las páginas de crear o editar producto (HU-18).
function tituloDe(pathname, modulo) {
  if (pathname === "/admin/productos/nuevo") return "Nuevo producto";
  if (/^\/admin\/productos\/[^/]+$/.test(pathname)) return "Editar producto";
  return modulo.nombre;
}

export default function AdminShell({ children }) {
  const pathname = usePathname() || "/admin";
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
    setAuthed(false); setPw("");
  }

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

  const actual = moduloActivo(pathname);

  return (
    <AdminCtx.Provider value={{ token, logout }}>
      <div className={`adm${plegado ? " mini" : ""}`}>
        <aside className="adm-side" id="adm-side" aria-label="Menú del panel">
          <div className="adm-brand">
            <span className="adm-logo">VV</span>
            <span className="adm-brand-t"><b>Ventas Virtual</b><small>Panel de administración</small></span>
          </div>
          <nav className="adm-nav" aria-label="Módulos">
            <div className="adm-nav-h">Módulos</div>
            {MODULOS.map((m) => (
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
            <div className="adm-page">{children}</div>
          </main>
        </div>
      </div>
    </AdminCtx.Provider>
  );
}
