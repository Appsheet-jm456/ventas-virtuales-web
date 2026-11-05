"use client";

import { useEffect, useState } from "react";

import { useAdmin } from "../AdminShell";
import SubirImagen, { REGLAS, descartarSubidas } from "../SubirImagen";
import HeroCarousel from "../../components/HeroCarousel";
import { cld } from "../../../lib/cdn";
import { imagenCategoria } from "../../../lib/productos";

// Módulo Banners e imágenes (HU-13): banners rotativos del Inicio (subir, editar, ordenar,
// activar y quitar) e imagen de cada categoría. Las imágenes van a Cloudinary (decisión 0007).

function Ico({ d }) {
  return <svg className="adm-i" viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;
}
const I = {
  plus: <path d="M12 5v14M5 12h14" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></>,
  trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  check: <path d="M20 6L9 17l-5-5" />,
  grip: <><circle cx="9" cy="6" r="1.3" /><circle cx="15" cy="6" r="1.3" /><circle cx="9" cy="12" r="1.3" /><circle cx="15" cy="12" r="1.3" /><circle cx="9" cy="18" r="1.3" /><circle cx="15" cy="18" r="1.3" /></>,
};

const VACIO = { titulo: "", alt: "", enlace: "", imagen: "", imagenMovil: "" };

// Formulario de un banner, para crear o editar.
// Las imágenes subidas en este formulario que no terminan guardadas se borran de Cloudinary.
function FormBanner({ inicial, onGuardar, onCancelar, busy }) {
  const { token } = useAdmin();
  const [b, setB] = useState(inicial);
  const [subidas, setSubidas] = useState([]);
  const [subiendo, setSubiendo] = useState(0);
  const set = (k) => (e) => setB((s) => ({ ...s, [k]: e.target.value }));
  const nueva = (k) => (url) => { setSubidas((l) => [...l, url]); setB((s) => ({ ...s, [k]: url })); };
  const marcar = (v) => setSubiendo((n) => Math.max(0, n + (v ? 1 : -1)));
  async function guardar(e) {
    e.preventDefault();
    if (await onGuardar(b)) descartarSubidas(token, subidas.filter((u) => u !== b.imagen && u !== b.imagenMovil));
  }
  function cancelar() {
    descartarSubidas(token, subidas);
    onCancelar();
  }
  return (
    <form className="bn-form" onSubmit={guardar}>
      <div className="cf-grid">
        <div className="field cf-field">
          <label htmlFor="bn-titulo">Nombre del banner</label>
          <input id="bn-titulo" className="input" value={b.titulo} onChange={set("titulo")} placeholder="Ej: Portátiles corporativos" />
          <small className="ct-hint">Solo lo ves tú en el panel.</small>
        </div>
        <div className="field cf-field">
          <label htmlFor="bn-enlace">Al tocarlo, abre</label>
          <input id="bn-enlace" className="input mono" value={b.enlace} onChange={set("enlace")} placeholder="/productos?categoria=portatil" />
          <small className="ct-hint">Una página de la web (/productos?categoria=portatil), una URL con https://, o wa: y el mensaje para abrir WhatsApp. Vacío: no abre nada.</small>
        </div>
      </div>
      <div className="field cf-field">
        <label htmlFor="bn-alt">Texto alternativo</label>
        <input id="bn-alt" className="input" value={b.alt} onChange={set("alt")} placeholder="Ej: Portátiles corporativos con garantía" />
        <small className="ct-hint">Lo que dice la imagen, para lectores de pantalla y buscadores.</small>
      </div>
      <div className="bn-imgs">
        <div className="bn-img">
          <b>Imagen de escritorio</b>
          {b.imagen
            ? <img className="bn-thumb" src={cld(b.imagen, "f_auto,q_auto,w_640")} alt="" />
            : <div className="bn-thumb vacia">Sin imagen</div>}
          <SubirImagen id="bn-subir" reglas={REGLAS.banner} texto={b.imagen ? "Cambiar imagen" : "Subir imagen"} onSubida={nueva("imagen")} onSubiendo={marcar} disabled={busy} />
        </div>
        <div className="bn-img">
          <b>Imagen de celular <span className="pr-sub">(opcional)</span></b>
          {b.imagenMovil
            ? <img className="bn-thumb movil" src={cld(b.imagenMovil, "f_auto,q_auto,w_300")} alt="" />
            : <div className="bn-thumb movil vacia">Usa la de escritorio</div>}
          <div className="bn-acc-img">
            <SubirImagen id="bn-subir-movil" reglas={REGLAS.bannerMovil} texto={b.imagenMovil ? "Cambiar" : "Subir imagen"} onSubida={nueva("imagenMovil")} onSubiendo={marcar} disabled={busy} />
            {b.imagenMovil && <button type="button" className="pr-link" onClick={() => setB((s) => ({ ...s, imagenMovil: "" }))}>Quitar la de celular</button>}
          </div>
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={cancelar} disabled={busy}>Cancelar</button>
        <button type="submit" className="btn pr-btn" disabled={busy || subiendo > 0 || !b.imagen || !b.titulo.trim()}>
          <Ico d={I.check} />{busy ? "Guardando…" : subiendo ? "Esperando la imagen…" : "Guardar banner"}
        </button>
      </div>
    </form>
  );
}

export default function BannersPage() {
  const { token, logout } = useAdmin();
  const [banners, setBanners] = useState([]);
  const [cats, setCats] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [editando, setEditando] = useState(null); // "nuevo" o el id del banner
  const [quitar, setQuitar] = useState(null);
  const [arrastre, setArrastre] = useState({ desde: null, sobre: null });

  useEffect(() => { cargar(); }, []);

  async function api(url, payload) {
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
  const apiB = (p) => api("/api/admin/banners", p);
  const apiC = (p) => api("/api/admin/categorias", p);

  async function cargar() {
    try {
      const [b, c] = await Promise.all([apiB({ op: "listar" }), apiC({ op: "listar" })]);
      setBanners(b.banners || []);
      setCats(c.categorias || []);
    } catch (e) {
      setErrMsg(String(e?.message || e));
    } finally {
      setCargando(false);
    }
  }

  // Ejecuta, recarga y avisa. Devuelve true si salió bien.
  async function correr(fn, ok) {
    setBusy(true); setOkMsg(""); setErrMsg("");
    try {
      await fn();
      await cargar();
      setOkMsg(ok);
      return true;
    } catch (e) {
      setErrMsg(String(e?.message || e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function guardarBanner(b) {
    const campos = { titulo: b.titulo, alt: b.alt, enlace: b.enlace, imagen: b.imagen, imagenMovil: b.imagenMovil };
    const ok = editando === "nuevo"
      ? await correr(() => apiB({ op: "crear", campos }), `Banner «${b.titulo.trim()}» agregado al final y activo.`)
      : await correr(() => apiB({ op: "actualizar", id: editando, campos }), `Banner «${b.titulo.trim()}» actualizado.`);
    if (ok) setEditando(null);
    return ok;
  }

  // Mueve un banner a la posición `a` y guarda el orden completo.
  function mover(desde, a) {
    if (desde === a || a < 0 || a >= banners.length) return;
    const lista = [...banners];
    lista.splice(a, 0, lista.splice(desde, 1)[0]);
    setBanners(lista);
    correr(() => apiB({ op: "reordenar", ids: lista.map((b) => b.id) }), "Orden guardado.");
  }

  const enPortada = banners.filter((b) => b.activo && b.imagen);
  const previa = enPortada.map((b) => ({
    img: cld(b.imagen, "f_auto,q_auto,w_1200"),
    imgMovil: b.imagenMovil ? cld(b.imagenMovil, "f_auto,q_auto,w_600") : "",
    alt: b.alt || b.titulo,
    href: "",
  }));

  return (
    <div className="pr">
      {okMsg && <p className="pr-aviso ok" role="status"><Ico d={I.check} />{okMsg}</p>}
      {errMsg && <p className="pr-aviso bad" role="alert">{errMsg}</p>}

      <section className="pr-card">
        <h2 className="pr-h">Vista previa de la portada</h2>
        <p className="pr-sub">
          {cargando ? "Cargando…" : previa.length
            ? `Así rota el banner en Inicio: ${previa.length} activo${previa.length === 1 ? "" : "s"}, cada 5 segundos.`
            : "Aún no hay banners activos con imagen: la portada muestra los de respaldo. En cuanto subas uno, la portada usa los tuyos."}
        </p>
        <div className="bn-prev">
          <HeroCarousel key={previa.map((p) => p.img).join("|")} {...(previa.length ? { banners: previa } : {})} />
        </div>
      </section>

      <section className="pr-card">
        <div className="bn-cab">
          <div>
            <h2 className="pr-h">Banners</h2>
            <p className="pr-sub" style={{ margin: 0 }}>Arrastra desde los puntos o usa las flechas: el primero se ve primero. La imagen trae su propio diseño (texto y corte diagonal).</p>
          </div>
          {editando !== "nuevo" && (
            <button type="button" className="btn pr-btn" onClick={() => { setEditando("nuevo"); setOkMsg(""); setErrMsg(""); }} disabled={busy}><Ico d={I.plus} />Nuevo banner</button>
          )}
        </div>

        {editando === "nuevo" && <FormBanner inicial={VACIO} onGuardar={guardarBanner} onCancelar={() => setEditando(null)} busy={busy} />}

        <ul className="bn-lista">
          {banners.map((b, i) => editando === b.id ? (
            <li key={b.id} className="bn-item editando"><FormBanner inicial={b} onGuardar={guardarBanner} onCancelar={() => setEditando(null)} busy={busy} /></li>
          ) : (
            <li
              key={b.id}
              className={`bn-item${arrastre.sobre === i && arrastre.desde !== i ? " sobre" : ""}${arrastre.desde === i ? " arrastrando" : ""}`}
              draggable={!busy && !editando}
              onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setArrastre({ desde: i, sobre: i }); }}
              onDragOver={(e) => { e.preventDefault(); if (arrastre.sobre !== i) setArrastre((s) => ({ ...s, sobre: i })); }}
              onDrop={(e) => { e.preventDefault(); const d = arrastre.desde; setArrastre({ desde: null, sobre: null }); if (d !== null) mover(d, i); }}
              onDragEnd={() => setArrastre({ desde: null, sobre: null })}
            >
              <span className="bn-grip" title="Arrastra para ordenar" aria-hidden="true"><Ico d={I.grip} /></span>
              {b.imagen
                ? <img className="bn-mini" src={cld(b.imagen, "f_auto,q_auto,w_320")} alt="" />
                : <span className="bn-mini vacia">Sin imagen</span>}
              <div className="bn-txt">
                <b>{i + 1}. {b.titulo}</b>
                <small>
                  {!b.imagen ? "Sin imagen: no se muestra en la portada" : b.activo ? "Activo" : "Desactivado"}
                  {b.imagenMovil ? " · con imagen de celular" : ""}
                  {b.enlace ? <> · abre <span className="mono">{b.enlace}</span></> : " · sin enlace"}
                </small>
              </div>
              <div className="bn-acc">
                <button type="button" className="adm-ibtn" aria-label={`Subir ${b.titulo}`} disabled={busy || i === 0} onClick={() => mover(i, i - 1)}><Ico d={I.up} /></button>
                <button type="button" className="adm-ibtn" aria-label={`Bajar ${b.titulo}`} disabled={busy || i === banners.length - 1} onClick={() => mover(i, i + 1)}><Ico d={I.down} /></button>
                <button type="button" className="cf-tg" role="switch" aria-checked={b.activo} aria-label={`Activar ${b.titulo}`} title={b.activo ? "Desactivar" : "Activar"} disabled={busy}
                  onClick={() => correr(() => apiB({ op: "actualizar", id: b.id, campos: { activo: !b.activo } }), b.activo ? `«${b.titulo}» desactivado.` : `«${b.titulo}» activo.`)} />
                <button type="button" className="adm-ibtn" aria-label={`Editar ${b.titulo}`} title="Editar" disabled={busy} onClick={() => { setEditando(b.id); setOkMsg(""); setErrMsg(""); }}><Ico d={I.edit} /></button>
                <button type="button" className="adm-ibtn ct-quitar" aria-label={`Quitar ${b.titulo}`} title="Quitar" disabled={busy} onClick={() => setQuitar(b)}><Ico d={I.trash} /></button>
              </div>
            </li>
          ))}
          {!cargando && banners.length === 0 && <li className="pr-vacio">Aún no hay banners. Crea el primero con <b>Nuevo banner</b>.</li>}
        </ul>
      </section>

      <section className="pr-card">
        <h2 className="pr-h">Imágenes de categorías</h2>
        <p className="pr-sub">La imagen de cada categoría en Inicio y en la página Categorías. Sin imagen propia se usa la ilustración de respaldo.</p>
        <div className="bn-cats">
          {cats.map((c) => (
            <div className="bn-cat" key={c.id}>
              <img src={c.imagen ? cld(c.imagen, "f_auto,q_auto,c_fill,g_auto,ar_1:1,w_400") : imagenCategoria(c.palabra) || imagenCategoria(c.nombre)} alt="" />
              <div className="bn-cat-txt">
                <b>{c.nombre}</b>
                <small>{c.imagen ? "Imagen propia" : "Ilustración de respaldo"}</small>
              </div>
              <SubirImagen id={`cat-${c.id}`} reglas={REGLAS.categoria} texto={c.imagen ? "Cambiar" : "Subir imagen"} disabled={busy}
                onSubida={(url) => correr(() => apiC({ op: "actualizar", id: c.id, campos: { imagen: url } }), `Imagen de «${c.nombre}» actualizada.`)} />
              {c.imagen && (
                <button type="button" className="pr-link" disabled={busy}
                  onClick={() => correr(() => apiC({ op: "actualizar", id: c.id, campos: { imagen: "" } }), `«${c.nombre}» vuelve a la ilustración de respaldo.`)}>
                  Usar la de respaldo
                </button>
              )}
            </div>
          ))}
          {!cargando && cats.length === 0 && <p className="pr-sub">No hay categorías. Créalas en el módulo Categorías.</p>}
        </div>
      </section>

      {quitar && (
        <div className="modal-overlay" onClick={() => !busy && setQuitar(null)}>
          <div className="modal-card pr-confirma" role="alertdialog" aria-modal="true" aria-labelledby="bnq-t" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2 id="bnq-t">¿Quitar el banner «{quitar.titulo}»?</h2></div>
            <div className="modal-body">
              <p>Se borra de la portada y sus imágenes se eliminan de Cloudinary. No se puede deshacer.</p>
              <p className="ep-hint">Si solo quieres que no se vea por un tiempo, desactívalo con el interruptor.</p>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setQuitar(null)} disabled={busy} autoFocus>Cancelar</button>
                <button type="button" className="btn-danger" disabled={busy}
                  onClick={async () => { const b = quitar; if (await correr(() => apiB({ op: "quitar", id: b.id }), `Banner «${b.titulo}» quitado.`)) setQuitar(null); }}>
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
