"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAdmin } from "../AdminShell";
import { parseImages } from "../../../lib/images";
import { listaDe } from "./FotosProducto";
import { FIELDS, HIDDEN_VALUES, CLAVE_AVISO } from "./campos";

// Módulo Productos del panel (HU-12). Pestañas Listado y Carga CSV (HU-09). El acceso y el panel
// lateral los pone AdminShell; cada petición lleva el token de la sesión y el servidor lo verifica.

const f = (r, k) => (r?.[k] ?? "").toString().trim();
const stockNum = (r) => parseInt(f(r, "Stock") || "0", 10) || 0;
const isHidden = (r) => HIDDEN_VALUES.includes((f(r, "Oculto") || "").toLowerCase());
const nombreDe = (r) => [f(r, "Marca"), f(r, "Modelo")].filter(Boolean).join(" ") || f(r, "Descripción") || f(r, "Código");
const specsDe = (r) => [f(r, "Procesador"), f(r, "RAM"), f(r, "Almacenamiento"), f(r, "Estado")].filter(Boolean).join(" · ");

// Plantilla CSV: encabezados que entiende la carga y una fila de ejemplo que, si se carga por
// error, queda oculta y agotada.
const PLANTILLA = [
  [...FIELDS.map((c) => c.key), "Oculto"],
  ["EJEMPLO-001", "Portátil usado", "PORTATIL LENOVO THINKPAD T14 GEN 2 CORE I5 1145G7 RAM 16GB SSD 512GB GR A",
    "Lenovo", "ThinkPad T14 Gen 2", "Core i5 1145G7", "11", "16GB", "512GB SSD", "Grado A", "1890000", "0",
    "https://drive.google.com/file/d/ID_DE_LA_FOTO/view", "", "Sí"],
];
const celdaCsv = (v) => (/[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

const FILTROS = [
  { id: "todos", nombre: "Todos", cumple: () => true },
  { id: "agotados", nombre: "Agotados", cumple: (r) => stockNum(r) <= 0 },
  { id: "ocultos", nombre: "Ocultos", cumple: (r) => isHidden(r) },
  { id: "sinfoto", nombre: "Sin foto", cumple: (r) => parseImages(r).length === 0 },
];

function norm(s) {
  return (s ?? "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function Ico({ d }) {
  return (
    <svg className="adm-i" viewBox="0 0 24 24" aria-hidden="true">{d}</svg>
  );
}
const I = {
  dots: <><circle cx="12" cy="5" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="12" cy="19" r="1.2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></>,
  slash: <><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></>,
  check: <path d="M20 6L9 17l-5-5" />,
  eye: <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeoff: <><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18 18 0 0 1 5.1-5.9M9.9 4.2A10.7 10.7 0 0 1 12 5c7 0 11 7 11 7a18 18 0 0 1-2.2 3.2M1 1l22 22" /></>,
  trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
  reload: <><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-8 8" /></>,
};

// Miniatura de la primera foto; si no carga (Drive sin compartir, RN-05) muestra el icono.
function Miniatura({ r }) {
  const src = parseImages(r)[0];
  const [falla, setFalla] = useState(false);
  if (!src || falla) return <span className="pr-thumb vacia"><Ico d={I.image} /></span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="pr-thumb" src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFalla(true)} />;
}

export default function ProductosPage() {
  const { token, logout } = useAdmin();

  const [tab, setTab] = useState("lista");
  const [rows, setRows] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState("todos");
  // Menú Acciones abierto: { id, top, left, arriba }. Flota sobre la página (position: fixed) para
  // que el contenedor con scroll de la tabla no lo recorte.
  const [menu, setMenu] = useState(null);

  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  // Confirmación de borrado dentro de la página: la fila a eliminar.
  const [borrar, setBorrar] = useState(null);
  // Carga CSV: { texto, nombre, vista, busy, error } mientras hay una carga en curso.
  const [csv, setCsv] = useState(null);
  const [arrastre, setArrastre] = useState(false);
  const fileRef = useRef(null);
  // Migración de fotos de Drive a Cloudinary: { total, hechos, migrados, fallidos, corriendo, fin } o null.
  const [mig, setMig] = useState(null);

  useEffect(() => {
    load();
    // Aviso que deja el formulario de página completa (HU-18) al guardar.
    try {
      const aviso = sessionStorage.getItem(CLAVE_AVISO);
      if (aviso) { setOkMsg(aviso); sessionStorage.removeItem(CLAVE_AVISO); }
    } catch {}
  }, []);

  // El menú Acciones se cierra al hacer clic fuera o con Escape.
  useEffect(() => {
    if (menu === null) return;
    const cerrar = () => setMenu(null);
    const tecla = (e) => { if (e.key === "Escape") setMenu(null); };
    document.addEventListener("click", cerrar);
    document.addEventListener("keydown", tecla);
    window.addEventListener("resize", cerrar);
    document.addEventListener("scroll", cerrar, true);
    return () => {
      document.removeEventListener("click", cerrar);
      document.removeEventListener("keydown", tecla);
      window.removeEventListener("resize", cerrar);
      document.removeEventListener("scroll", cerrar, true);
    };
  }, [menu]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${await token()}` },
      });
      const d = await res.json();
      setRows(Array.isArray(d.rows) ? d.rows : []);
      setDemo(!!d.demo);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const conteos = useMemo(
    () => Object.fromEntries(FILTROS.map((x) => [x.id, rows.filter(x.cumple).length])),
    [rows]
  );

  const filtered = useMemo(() => {
    const nq = norm(q);
    const fil = FILTROS.find((x) => x.id === filtro) || FILTROS[0];
    return rows.filter((r) =>
      fil.cumple(r) &&
      (!nq || norm([f(r, "Código"), f(r, "Marca"), f(r, "Modelo"), f(r, "Categoría"), f(r, "Descripción")].join(" ")).includes(nq))
    );
  }, [rows, q, filtro]);

  function avisar(ok, err = "") { setOkMsg(ok); setErrMsg(err); }

  // Crear y editar abren su propia página (HU-18).
  const openNew = () => router.push("/admin/productos/nuevo");
  const openEdit = (r) => router.push(`/admin/productos/${r._id}`);

  // Acción rápida desde el menú: actualiza solo los campos indicados.
  async function quickUpdate(r, fields, okText) {
    avisar("");
    try {
      const d = await callAdmin({ op: "update", id: r._id, fields });
      avisar(okText || d.mensaje || "Actualizado.");
      await load();
    } catch (e) {
      avisar("", String(e?.message || e));
    }
  }

  // Cambia entre Disponible (Stock 1) y Agotado/Vendido (Stock 0).
  function toggleAgotado(r) {
    if (stockNum(r) > 0) quickUpdate(r, { Stock: 0 }, `«${nombreDe(r)}» marcado como agotado.`);
    else quickUpdate(r, { Stock: 1 }, `«${nombreDe(r)}» vuelve a estar disponible (stock 1).`);
  }

  // Quita de la tienda (oculto) o vuelve a publicar. No borra de la base.
  function toggleOculto(r) {
    if (isHidden(r)) quickUpdate(r, { Oculto: "" }, `«${nombreDe(r)}» vuelve a la tienda.`);
    else quickUpdate(r, { Oculto: "Sí" }, `«${nombreDe(r)}» oculto en la tienda (sigue en la base).`);
  }

  async function callAdmin(payload, url = "/api/admin") {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) { logout(); throw new Error("Sesión expirada: vuelve a entrar."); }
    const d = await res.json();
    if (d.error) throw new Error(d.error);
    return d;
  }

  function descargarPlantilla() {
    const texto = "﻿" + PLANTILLA.map((fila) => fila.map(celdaCsv).join(",")).join("\r\n") + "\r\n";
    const url = URL.createObjectURL(new Blob([texto], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "plantilla-productos.csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function leerArchivo(file) {
    if (!file) return;
    avisar("");
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
      setCsv({ nombre: file.name, vista: null, busy: false, error: "El archivo debe ser .csv. En Excel: Archivo › Guardar como › CSV UTF-8." });
      return;
    }
    const texto = await file.text();
    setCsv({ texto, nombre: file.name, vista: null, busy: true });
    try {
      const vista = await callAdmin({ op: "vista", csv: texto }, "/api/admin/csv");
      setCsv({ texto, nombre: file.name, vista, busy: false });
    } catch (err) {
      setCsv({ texto, nombre: file.name, vista: null, busy: false, error: String(err?.message || err) });
    }
  }

  async function aplicarCsv() {
    setCsv((c) => ({ ...c, busy: true }));
    try {
      const d = await callAdmin({ op: "aplicar", csv: csv.texto }, "/api/admin/csv");
      avisar(d.mensaje || "Carga lista.");
      setCsv(null);
      await load();
    } catch (err) {
      setCsv((c) => ({ ...c, busy: false, error: String(err?.message || err) }));
    }
  }

  async function confirmarBorrado() {
    const r = borrar;
    setBusy(true);
    try {
      const d = await callAdmin({ op: "delete", id: r._id });
      avisar(d.mensaje || `«${nombreDe(r)}» eliminado.`);
      setBorrar(null);
      await load();
    } catch (e) {
      avisar("", String(e?.message || e));
      setBorrar(null);
    } finally {
      setBusy(false);
    }
  }

  const accion = (fn) => (e) => { e.stopPropagation(); setMenu(null); fn(); };

  // Abre el menú junto al botón: hacia abajo si cabe, si no hacia arriba.
  // Productos con alguna foto que no está en Cloudinary (Drive u otro enlace).
  const pendientesMig = useMemo(
    () => rows.filter((r) => listaDe(f(r, "Foto")).some((u) => /^https?:\/\//i.test(u) && !u.startsWith("https://res.cloudinary.com/"))),
    [rows],
  );

  // Migra en tandas: el servidor copia las fotos de unos pocos productos por petición.
  async function migrarFotos() {
    const ids = pendientesMig.map((r) => r._id);
    if (!ids.length) return;
    setMig({ total: ids.length, hechos: 0, migrados: 0, fallidos: [], corriendo: true, fin: false });
    let migrados = 0;
    const fallidos = [];
    try {
      for (let i = 0; i < ids.length; i += 3) {
        const lote = ids.slice(i, i + 3);
        const d = await callAdmin({ op: "migrar", ids: lote }, "/api/admin/cloudinary");
        migrados += d.migrados || 0;
        fallidos.push(...(d.fallidos || []));
        setMig({ total: ids.length, hechos: Math.min(i + 3, ids.length), migrados, fallidos: [...fallidos], corriendo: true, fin: false });
      }
    } catch (e) {
      fallidos.push({ codigo: "—", motivo: String(e?.message || e) });
    }
    setMig({ total: ids.length, hechos: ids.length, migrados, fallidos, corriendo: false, fin: true });
    await load();
  }

  function abrirMenu(e, r) {
    e.stopPropagation();
    if (menu?.id === r._id) { setMenu(null); return; }
    const b = e.currentTarget.getBoundingClientRect();
    const ALTO = 190, ANCHO = 210;
    const arriba = window.innerHeight - b.bottom < ALTO + 8 && b.top > ALTO + 8;
    setMenu({
      id: r._id,
      top: arriba ? b.top - 4 : b.bottom + 4,
      left: Math.max(8, Math.min(b.right - ANCHO, window.innerWidth - ANCHO - 8)),
      arriba,
    });
  }

  return (
    <div className="pr">
      <div className="pr-tabs" role="tablist" aria-label="Productos">
        <button type="button" role="tab" id="tab-lista" aria-controls="panel-lista" aria-selected={tab === "lista"} onClick={() => setTab("lista")}>
          Listado <span className="pr-n">{rows.length}</span>
        </button>
        <button type="button" role="tab" id="tab-csv" aria-controls="panel-csv" aria-selected={tab === "csv"} onClick={() => setTab("csv")}>
          Carga CSV
        </button>
        <button type="button" role="tab" id="tab-fotos" aria-controls="panel-fotos" aria-selected={tab === "fotos"} onClick={() => setTab("fotos")}>
          Migrar fotos {pendientesMig.length > 0 && <span className="pr-n">{pendientesMig.length}</span>}
        </button>
      </div>

      {demo && <div className="demo-note">Modo demo: Supabase no está configurado; los cambios no se guardarán.</div>}
      {okMsg && <p className="pr-aviso ok" role="status"><Ico d={I.check} />{okMsg}</p>}
      {errMsg && <p className="pr-aviso bad" role="alert">{errMsg}</p>}

      {tab === "lista" && (
        <section className="pr-card" id="panel-lista" role="tabpanel" aria-labelledby="tab-lista">
          <div className="pr-tools">
            <input
              className="input pr-buscar"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por código, marca, modelo o categoría"
              aria-label="Buscar productos"
            />
            <div className="pr-filtros" role="group" aria-label="Filtrar">
              {FILTROS.map((x) => (
                <button key={x.id} type="button" className="pr-chip" aria-pressed={filtro === x.id} onClick={() => setFiltro(x.id)}>
                  {x.nombre} <span className="pr-n">{conteos[x.id] ?? 0}</span>
                </button>
              ))}
            </div>
            <span className="adm-sp" />
            <button type="button" className="adm-ibtn" onClick={load} disabled={loading} aria-label="Recargar" title="Recargar">
              <Ico d={I.reload} />
            </button>
            <button type="button" className="btn pr-btn" onClick={openNew}><Ico d={I.plus} />Nuevo producto</button>
          </div>

          <div className="admin-table-wrap pr-tabla">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th><span className="sr">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const sinFoto = parseImages(r).length === 0;
                  const abierto = menu?.id === r._id;
                  return (
                    <tr key={r._id}>
                      <td>
                        <div className="pr-cell">
                          <Miniatura r={r} />
                          <div className="pr-txt">
                            <b>{nombreDe(r)}</b>
                            <small><span className="mono">{f(r, "Código")}</span>{specsDe(r) ? ` · ${specsDe(r)}` : ""}</small>
                          </div>
                        </div>
                      </td>
                      <td>{f(r, "Categoría") || "—"}</td>
                      <td className="num">{f(r, "Precio") ? `$${Number(f(r, "Precio")).toLocaleString("es-CO")}` : "—"}</td>
                      <td className="num">
                        {stockNum(r) > 0 ? <span className="badge ok">{stockNum(r)} en stock</span> : <span className="badge bad">Agotado</span>}
                      </td>
                      <td>
                        <div className="pr-estado">
                          {isHidden(r) ? <span className="badge off">Oculto</span> : <span className="badge ok">En la web</span>}
                          {sinFoto && <span className="badge warn">Sin foto</span>}
                        </div>
                      </td>
                      <td className="pr-acc">
                        <div className="pr-menu">
                          <button
                            type="button"
                            className="adm-ibtn"
                            aria-label={`Acciones de ${nombreDe(r)}`}
                            aria-haspopup="menu"
                            aria-expanded={abierto}
                            onClick={(e) => abrirMenu(e, r)}
                          >
                            <Ico d={I.dots} />
                          </button>
                          {abierto && (
                            <div
                              className="pr-pop"
                              role="menu"
                              style={{ top: menu.top, left: menu.left, transform: menu.arriba ? "translateY(-100%)" : undefined }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button type="button" role="menuitem" onClick={accion(() => openEdit(r))}><Ico d={I.edit} />Editar</button>
                              <button type="button" role="menuitem" onClick={accion(() => toggleAgotado(r))}>
                                <Ico d={stockNum(r) > 0 ? I.slash : I.check} />{stockNum(r) > 0 ? "Marcar agotado" : "Reponer (stock 1)"}
                              </button>
                              <button type="button" role="menuitem" onClick={accion(() => toggleOculto(r))}>
                                <Ico d={isHidden(r) ? I.eye : I.eyeoff} />{isHidden(r) ? "Mostrar en la web" : "Ocultar de la web"}
                              </button>
                              <button type="button" role="menuitem" className="bad" onClick={accion(() => setBorrar(r))}><Ico d={I.trash} />Eliminar</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="pr-vacio">
                    {loading ? "Cargando…" : rows.length === 0
                      ? <>Aún no hay productos. Créalos con <b>Nuevo producto</b> o súbelos en <button type="button" className="pr-link" onClick={() => setTab("csv")}>Carga CSV</button>.</>
                      : "Ningún producto coincide con la búsqueda o el filtro."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="pr-pie">Mostrando {filtered.length} de {rows.length} productos.</p>
        </section>
      )}

      {tab === "fotos" && (
        <section className="pr-card" id="panel-fotos" role="tabpanel" aria-labelledby="tab-fotos">
          <h2 className="pr-h">Migrar fotos de Drive a Cloudinary</h2>
          <p className="pr-sub">
            Copia a Cloudinary las fotos que hoy son enlaces de Google Drive u otro sitio y cambia el enlace en el producto.
            Las fotos deben estar compartidas como «cualquiera con el enlace»; las que no se puedan leer se dejan como estaban
            y aparecen en la lista de abajo. Se puede repetir sin problema: lo ya migrado se salta. Los videos no se tocan.
          </p>
          <p className="pr-sub"><b>{pendientesMig.length}</b> {pendientesMig.length === 1 ? "producto tiene" : "productos tienen"} fotos fuera de Cloudinary.</p>
          <button type="button" className="btn pr-btn" onClick={migrarFotos} disabled={!pendientesMig.length || mig?.corriendo || demo}>
            <Ico d={I.upload} />{mig?.corriendo ? "Migrando…" : "Migrar fotos"}
          </button>
          {mig && (
            <div className="mig" role="status">
              <progress value={mig.hechos} max={mig.total} aria-label="Avance de la migración" />
              <p className="pr-sub">{mig.hechos} de {mig.total} productos revisados · {mig.migrados} migrados{mig.fallidos.length ? ` · ${mig.fallidos.length} con problemas` : ""}{mig.fin ? " · terminado" : ""}</p>
              {mig.fallidos.length > 0 && (
                <ul className="mig-fallos">
                  {mig.fallidos.map((x, i) => <li key={i}><b>{x.codigo}</b>: {x.motivo}</li>)}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      {tab === "csv" && (
        <section className="pr-card" id="panel-csv" role="tabpanel" aria-labelledby="tab-csv">
          <h2 className="pr-h">Cargar productos por CSV</h2>
          <p className="pr-sub">
            Sube el archivo, revisa la vista previa y confirma. Nada se guarda hasta que confirmes. Los productos se
            identifican por <b>Código</b>: si existe se actualiza y si no, se crea. Los que no vienen en el archivo no
            se tocan ni se borran.
          </p>
          <ol className="pr-pasos">
            <li><b>Descarga la plantilla</b> y llénala en Excel o Google Sheets.</li>
            <li><b>Guárdala como CSV UTF-8</b> y súbela aquí.</li>
            <li><b>Revisa la vista previa</b> y confirma la carga.</li>
          </ol>
          <button type="button" className="btn-ghost pr-btn" onClick={descargarPlantilla}><Ico d={I.file} />Descargar plantilla CSV</button>

          <div
            className={`pr-drop${arrastre ? " over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setArrastre(true); }}
            onDragLeave={() => setArrastre(false)}
            onDrop={(e) => { e.preventDefault(); setArrastre(false); leerArchivo(e.dataTransfer.files?.[0]); }}
          >
            <Ico d={I.upload} />
            <b>Arrastra el CSV aquí</b>
            <span>o</span>
            <button type="button" className="btn pr-btn" onClick={() => fileRef.current?.click()} disabled={csv?.busy}>Elegir archivo</button>
            <input
              ref={fileRef}
              id="csv-archivo"
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; leerArchivo(file); }}
            />
          </div>

          {csv && (
            <div className="pr-vista">
              <h3>Vista previa · {csv.nombre}</h3>
              {csv.busy && !csv.vista && <p>Revisando el archivo…</p>}
              {csv.error && <div className="form-error">{csv.error}</div>}
              {csv.vista && (
                <>
                  <div className="pr-estado">
                    <span className="badge ok">{csv.vista.nuevos} nuevos</span>
                    <span className="badge off">{csv.vista.modificados} se modifican</span>
                    <span className={`badge ${csv.vista.errores.length ? "bad" : "off"}`}>{csv.vista.errores.length} con error</span>
                    <span className="pr-sub" style={{ margin: 0 }}>de {csv.vista.total} filas</span>
                  </div>
                  {csv.vista.errores.length > 0 && (
                    <div className="admin-table-wrap pr-errores">
                      <table className="admin-table">
                        <thead><tr><th>Fila</th><th>Código</th><th>Motivo</th></tr></thead>
                        <tbody>
                          {csv.vista.errores.map((x, i) => (
                            <tr key={i}><td className="num">{x.fila}</td><td className="mono">{x.codigo || "—"}</td><td>{x.motivo}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {csv.vista.errores.length > 0 && <p className="pr-sub">Las filas con error se omiten; las demás se cargan.</p>}
                </>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setCsv(null)} disabled={csv.busy}>Cancelar</button>
                <button type="button" className="btn" onClick={aplicarCsv} disabled={csv.busy || !csv.vista || csv.vista.nuevos + csv.vista.modificados === 0}>
                  {csv.busy ? "Trabajando…" : "Confirmar carga"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Confirmación de borrado dentro de la página */}
      {borrar && (
        <div className="modal-overlay" onClick={() => !busy && setBorrar(null)}>
          <div className="modal-card pr-confirma" role="alertdialog" aria-modal="true" aria-labelledby="borrar-t" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2 id="borrar-t">¿Eliminar «{nombreDe(borrar)}»?</h2>
            </div>
            <div className="modal-body">
              <p>Código <span className="mono">{f(borrar, "Código")}</span>. Esta acción <b>no se puede deshacer</b>.</p>
              <p className="ep-hint">Si solo se vendió, usa <b>Marcar agotado</b>: sigue visible con la cinta «Agotado». Si no quieres que se vea, usa <b>Ocultar de la web</b>.</p>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setBorrar(null)} disabled={busy} autoFocus>Cancelar</button>
                <button type="button" className="btn-danger" onClick={confirmarBorrado} disabled={busy}>{busy ? "Eliminando…" : "Eliminar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
