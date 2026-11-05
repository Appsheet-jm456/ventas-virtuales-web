"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdmin } from "../AdminShell";
import { CLAVE_AVISO_PAGINAS } from "./EditorPagina";

// Módulo Políticas del panel (HU-26): lista de páginas (garantía, devolución, envíos, términos,
// privacidad…) con orden, estado y acciones. Crear y editar abren la página completa del editor.

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
  ext: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
};

export default function PoliticasPage() {
  const { token, logout } = useAdmin();
  const [paginas, setPaginas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [quitar, setQuitar] = useState(null);

  async function api(payload) {
    const res = await fetch("/api/admin/paginas", {
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
    try { setPaginas((await api({ op: "listar" })).paginas || []); }
    catch (e) { setErrMsg(String(e?.message || e)); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    try { const m = sessionStorage.getItem(CLAVE_AVISO_PAGINAS); if (m) { setOkMsg(m); sessionStorage.removeItem(CLAVE_AVISO_PAGINAS); } } catch {}
    cargar();
  }, []);

  async function correr(payload, mensaje) {
    setBusy(true); setOkMsg(""); setErrMsg("");
    try { await api(payload); await cargar(); setOkMsg(mensaje); return true; }
    catch (e) { setErrMsg(String(e?.message || e)); return false; }
    finally { setBusy(false); }
  }

  return (
    <div className="pr">
      {okMsg && <p className="pr-aviso ok" role="status"><Ico d={I.check} />{okMsg}</p>}
      {errMsg && <p className="pr-aviso bad" role="alert">{errMsg}</p>}

      <section className="pr-card">
        <div className="pg-cabeza">
          <div>
            <h2 className="pr-h">Políticas y páginas de soporte</h2>
            <p className="pr-sub">Garantía, devoluciones, envíos, términos y privacidad. Las <b>visibles</b> salen en la columna «Soporte» del pie de la web, en este orden.</p>
          </div>
          <Link className="btn-ghost pr-btn" href="/admin/configuracion/nosotros">Página Nosotros</Link>
          <Link className="btn pr-btn" href="/admin/politicas/nueva"><Ico d={I.plus} />Nueva página</Link>
        </div>
        <div className="admin-table-wrap pr-tabla">
          <table className="admin-table">
            <thead>
              <tr><th>Orden</th><th>Página</th><th>Dirección</th><th>Secciones</th><th>Estado</th><th><span className="sr">Acciones</span></th></tr>
            </thead>
            <tbody>
              {paginas.map((p, i) => (
                <tr key={p.id}>
                  <td>
                    <div className="ct-orden">
                      <button type="button" className="adm-ibtn" aria-label={`Subir ${p.titulo}`} disabled={busy || i === 0}
                        onClick={() => correr({ op: "mover", id: p.id, dir: -1 }, "Orden actualizado.")}><Ico d={I.up} /></button>
                      <button type="button" className="adm-ibtn" aria-label={`Bajar ${p.titulo}`} disabled={busy || i === paginas.length - 1}
                        onClick={() => correr({ op: "mover", id: p.id, dir: 1 }, "Orden actualizado.")}><Ico d={I.down} /></button>
                    </div>
                  </td>
                  <td><Link href={`/admin/politicas/${p.id}`}><b>{p.titulo}</b></Link></td>
                  <td><span className="mono ct-palabra">/politicas/{p.slug}</span></td>
                  <td className="num">{(p.secciones || []).length}</td>
                  <td>{p.visible ? <span className="badge ok">Visible</span> : <span className="badge off">Oculta</span>}</td>
                  <td className="ct-acc">
                    <Link className="adm-ibtn" href={`/admin/politicas/${p.id}`} aria-label={`Editar ${p.titulo}`} title="Editar"><Ico d={I.edit} /></Link>
                    {p.visible && <a className="adm-ibtn" href={`/politicas/${p.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${p.titulo} en la web`} title="Ver en la web"><Ico d={I.ext} /></a>}
                    <button type="button" className="adm-ibtn" aria-label={p.visible ? `Ocultar ${p.titulo}` : `Publicar ${p.titulo}`} title={p.visible ? "Ocultar de la web" : "Publicar en la web"} disabled={busy}
                      onClick={() => correr({ op: "guardar", id: p.id, datos: { ...p, visible: !p.visible } }, p.visible ? `«${p.titulo}» oculta en la web.` : `«${p.titulo}» publicada en la web.`)}>
                      <Ico d={p.visible ? I.eyeoff : I.eye} />
                    </button>
                    <button type="button" className="adm-ibtn ct-quitar" aria-label={`Quitar ${p.titulo}`} title="Quitar" disabled={busy}
                      onClick={() => { setOkMsg(""); setErrMsg(""); setQuitar(p); }}><Ico d={I.trash} /></button>
                  </td>
                </tr>
              ))}
              {paginas.length === 0 && (
                <tr><td colSpan={6} className="pr-vacio">{loading ? "Cargando…" : "Aún no hay páginas. Crea la primera con «Nueva página»."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="pr-pie">Los textos iniciales son <b>borradores por revisar</b> con un asesor: revisa cada uno, completa lo que va entre corchetes [ ] y publícalo.</p>
      </section>

      {quitar && (
        <div className="modal-overlay" onClick={() => !busy && setQuitar(null)}>
          <div className="modal-card pr-confirma" role="alertdialog" aria-modal="true" aria-labelledby="quitar-t" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2 id="quitar-t">¿Quitar la página «{quitar.titulo}»?</h2></div>
            <div className="modal-body">
              <p>Se borra con sus {(quitar.secciones || []).length} secciones y deja de verse en la web. No se puede deshacer.</p>
              <p className="ep-hint">Si solo quieres que no se vea por un tiempo, usa <b>Ocultar</b>.</p>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setQuitar(null)} disabled={busy} autoFocus>Cancelar</button>
                <button type="button" className="btn-danger" disabled={busy}
                  onClick={async () => { const p = quitar; if (await correr({ op: "borrar", id: p.id }, `Página «${p.titulo}» quitada.`)) setQuitar(null); }}>
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
