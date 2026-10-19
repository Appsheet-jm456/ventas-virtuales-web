"use client";

import { useEffect, useMemo, useState } from "react";

import { useAdmin } from "../AdminShell";

// Módulo Categorías del panel (HU-14): crear, actualizar, ordenar, mostrar/ocultar y quitar.
// Una categoría agrupa los productos cuya Categoría contiene su palabra (sin tildes).

const norm = (s) => (s ?? "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const palabraDe = (nombre) => norm(nombre).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();
const catDe = (r) => (r?.["Categoría"] ?? "").toString();
const agrupa = (rows, palabra) => (palabraDe(palabra) ? rows.filter((r) => norm(catDe(r)).includes(palabraDe(palabra))) : []);

function Ico({ d }) {
  return <svg className="adm-i" viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;
}
const I = {
  plus: <path d="M12 5v14M5 12h14" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></>,
  eye: <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeoff: <><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18 18 0 0 1 5.1-5.9M9.9 4.2A10.7 10.7 0 0 1 12 5c7 0 11 7 11 7a18 18 0 0 1-2.2 3.2M1 1l22 22" /></>,
  trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  check: <path d="M20 6L9 17l-5-5" />,
};

// Ejemplos reales de lo que agrupa una palabra, para que el dueño vea si acierta.
function Coincidencias({ rows, palabra }) {
  if (!palabraDe(palabra)) return <small className="ct-hint">Escribe la palabra para ver qué productos agrupa.</small>;
  const suyos = agrupa(rows, palabra);
  const textos = [...new Set(suyos.map(catDe).filter(Boolean))].slice(0, 4);
  if (!suyos.length) return <small className="ct-hint warn">Ningún producto tiene una categoría que contenga «{palabraDe(palabra)}».</small>;
  return (
    <small className="ct-hint">
      Agrupa <b>{suyos.length}</b> producto{suyos.length === 1 ? "" : "s"}: {textos.map((t) => `«${t}»`).join(", ")}
    </small>
  );
}

export default function CategoriasPage() {
  const { token, logout } = useAdmin();
  const [cats, setCats] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  // Formulario de nueva categoría. La palabra se sugiere del nombre hasta que el dueño la edita.
  const [nuevo, setNuevo] = useState({ nombre: "", palabra: "", tocada: false });
  // Edición en la fila: { id, nombre, palabra }
  const [edit, setEdit] = useState(null);
  const [quitar, setQuitar] = useState(null);

  useEffect(() => { cargar(); }, []);

  async function api(payload) {
    const res = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) { logout(); throw new Error("Sesión expirada: vuelve a entrar."); }
    const d = await res.json();
    if (d.error) throw new Error(d.error);
    return d;
  }

  async function cargar() {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        api({ op: "listar" }),
        fetch("/api/products", { cache: "no-store", headers: { Authorization: `Bearer ${await token()}` } }).then((r) => r.json()),
      ]);
      setCats(c.categorias || []);
      setRows(Array.isArray(p.rows) ? p.rows : []);
    } catch (e) {
      setErrMsg(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  function avisar(ok, err = "") { setOkMsg(ok); setErrMsg(err); }

  // Ejecuta una operación, recarga y muestra el resultado. Devuelve true si salió bien.
  async function correr(payload, ok) {
    setBusy(true); avisar("");
    try {
      await api(payload);
      await cargar();
      avisar(ok);
      return true;
    } catch (e) {
      avisar("", String(e?.message || e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function crear(e) {
    e.preventDefault();
    const nombre = nuevo.nombre.trim();
    if (await correr({ op: "crear", campos: { nombre, palabra: nuevo.palabra } }, `Categoría «${nombre}» agregada.`)) {
      setNuevo({ nombre: "", palabra: "", tocada: false });
    }
  }

  async function guardar() {
    if (await correr({ op: "actualizar", id: edit.id, campos: { nombre: edit.nombre, palabra: edit.palabra } }, `Categoría «${edit.nombre.trim()}» actualizada.`)) {
      setEdit(null);
    }
  }

  const sinCategoria = useMemo(
    () => rows.filter((r) => !cats.some((c) => norm(catDe(r)).includes(palabraDe(c.palabra)))).length,
    [rows, cats]
  );

  return (
    <div className="pr">
      {okMsg && <p className="pr-aviso ok" role="status"><Ico d={I.check} />{okMsg}</p>}
      {errMsg && <p className="pr-aviso bad" role="alert">{errMsg}</p>}

      <section className="pr-card">
        <h2 className="pr-h">Nueva categoría</h2>
        <p className="pr-sub">
          La <b>palabra que agrupa</b> decide qué productos entran: los que tienen esa palabra en su columna
          Categoría, sin importar tildes ni mayúsculas. La imagen se cambia en Banners e imágenes.
        </p>
        <form className="ct-form" onSubmit={crear}>
          <div className="field">
            <label htmlFor="ct-nombre">Nombre en la web</label>
            <input
              id="ct-nombre"
              className="input"
              value={nuevo.nombre}
              placeholder="Ej: Impresoras"
              onChange={(e) => {
                const nombre = e.target.value;
                setNuevo((s) => ({ ...s, nombre, palabra: s.tocada ? s.palabra : palabraDe(nombre) }));
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="ct-palabra">Palabra que agrupa</label>
            <input
              id="ct-palabra"
              className="input mono"
              value={nuevo.palabra}
              placeholder="Ej: impresora"
              onChange={(e) => setNuevo((s) => ({ ...s, palabra: e.target.value, tocada: true }))}
            />
          </div>
          <button className="btn pr-btn" type="submit" disabled={busy || !nuevo.nombre.trim()}><Ico d={I.plus} />Agregar categoría</button>
          <div className="ct-full"><Coincidencias rows={rows} palabra={nuevo.palabra} /></div>
        </form>
      </section>

      <section className="pr-card">
        <div className="admin-table-wrap pr-tabla">
          <table className="admin-table ct-tabla">
            <thead>
              <tr><th>Orden</th><th>Nombre</th><th>Palabra que agrupa</th><th>Productos</th><th>Estado</th><th><span className="sr">Acciones</span></th></tr>
            </thead>
            <tbody>
              {cats.map((c, i) => {
                const n = agrupa(rows, c.palabra).length;
                if (edit?.id === c.id) {
                  return (
                    <tr key={c.id} className="ct-editando">
                      <td className="num">{i + 1}</td>
                      <td><input className="input" aria-label="Nombre" value={edit.nombre} onChange={(e) => setEdit((s) => ({ ...s, nombre: e.target.value }))} autoFocus /></td>
                      <td colSpan={3}>
                        <input className="input mono" aria-label="Palabra que agrupa" value={edit.palabra} onChange={(e) => setEdit((s) => ({ ...s, palabra: e.target.value }))} />
                        <Coincidencias rows={rows} palabra={edit.palabra} />
                      </td>
                      <td className="ct-acc">
                        <button type="button" className="btn ct-sm" onClick={guardar} disabled={busy}>Guardar</button>
                        <button type="button" className="btn-ghost ct-sm" onClick={() => setEdit(null)} disabled={busy}>Cancelar</button>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="ct-orden">
                        <button type="button" className="adm-ibtn" aria-label={`Subir ${c.nombre}`} disabled={busy || i === 0}
                          onClick={() => correr({ op: "ordenar", id: c.id, con: cats[i - 1].id }, "Orden actualizado.")}><Ico d={I.up} /></button>
                        <button type="button" className="adm-ibtn" aria-label={`Bajar ${c.nombre}`} disabled={busy || i === cats.length - 1}
                          onClick={() => correr({ op: "ordenar", id: c.id, con: cats[i + 1].id }, "Orden actualizado.")}><Ico d={I.down} /></button>
                      </div>
                    </td>
                    <td><b>{c.nombre}</b></td>
                    <td><span className="mono ct-palabra">{c.palabra}</span><small className="ct-url">/productos?categoria={c.palabra}</small></td>
                    <td className="num">{n}</td>
                    <td>{c.visible ? <span className="badge ok">Visible</span> : <span className="badge off">Oculta</span>}</td>
                    <td className="ct-acc">
                      <button type="button" className="adm-ibtn" aria-label={`Editar ${c.nombre}`} title="Editar" disabled={busy}
                        onClick={() => { avisar(""); setEdit({ id: c.id, nombre: c.nombre, palabra: c.palabra }); }}><Ico d={I.edit} /></button>
                      <button type="button" className="adm-ibtn" aria-label={c.visible ? `Ocultar ${c.nombre}` : `Mostrar ${c.nombre}`} title={c.visible ? "Ocultar de la web" : "Mostrar en la web"} disabled={busy}
                        onClick={() => correr({ op: "actualizar", id: c.id, campos: { visible: !c.visible } }, c.visible ? `«${c.nombre}» oculta en la web.` : `«${c.nombre}» visible en la web.`)}>
                        <Ico d={c.visible ? I.eyeoff : I.eye} />
                      </button>
                      <button type="button" className="adm-ibtn ct-quitar" aria-label={`Quitar ${c.nombre}`} title="Quitar" disabled={busy}
                        onClick={() => { avisar(""); setQuitar({ ...c, n }); }}><Ico d={I.trash} /></button>
                    </td>
                  </tr>
                );
              })}
              {cats.length === 0 && (
                <tr><td colSpan={6} className="pr-vacio">{loading ? "Cargando…" : "Aún no hay categorías. Agrega la primera arriba."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && rows.length > 0 && (
          <p className="pr-pie">
            {sinCategoria === 0
              ? "Todos los productos están en alguna categoría."
              : sinCategoria === 1
                ? "1 producto no entra en ninguna categoría (sigue en el catálogo y la búsqueda)."
                : `${sinCategoria} productos no entran en ninguna categoría (siguen en el catálogo y la búsqueda).`}
          </p>
        )}
      </section>

      {quitar && (
        <div className="modal-overlay" onClick={() => !busy && setQuitar(null)}>
          <div className="modal-card pr-confirma" role="alertdialog" aria-modal="true" aria-labelledby="quitar-t" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2 id="quitar-t">¿Quitar la categoría «{quitar.nombre}»?</h2></div>
            <div className="modal-body">
              <p>
                {quitar.n > 0
                  ? quitar.n === 1
                    ? <>Su <b>único producto</b> no se borra: sigue en el catálogo y la búsqueda, pero deja de agruparse aquí.</>
                    : <>Sus <b>{quitar.n} productos</b> no se borran: siguen en el catálogo y la búsqueda, pero dejan de agruparse aquí.</>
                  : "No agrupa ningún producto."}
              </p>
              <p className="ep-hint">Si solo quieres que no se vea por un tiempo, usa <b>Ocultar</b>.</p>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setQuitar(null)} disabled={busy} autoFocus>Cancelar</button>
                <button type="button" className="btn-danger" disabled={busy}
                  onClick={async () => { const c = quitar; if (await correr({ op: "quitar", id: c.id }, `Categoría «${c.nombre}» quitada.`)) setQuitar(null); }}>
                  {busy ? "Quitando…" : "Quitar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
