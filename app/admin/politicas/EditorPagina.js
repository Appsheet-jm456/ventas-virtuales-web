"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../AdminShell";
import PoliticaVista from "../../components/PoliticaVista";
import { slugDe, MAX_SECCIONES, MAX_TITULO, MAX_TITULO_SECCION, MAX_TEXTO } from "../../../lib/paginas-base";

// Editor de una página de política (HU-26), para crear y para editar: título, dirección, estilo,
// visible y la lista de secciones (agregar, renombrar, borrar, subir y bajar), con vista previa
// igual a la web y aviso de cambios sin guardar.

export const CLAVE_AVISO_PAGINAS = "vv-paginas-aviso";
export const PAGINA_VACIA = { titulo: "", slug: "", estilo: "acordeon", visible: false, secciones: [{ titulo: "", texto: "" }] };

export default function EditorPagina({ inicial, id }) {
  const { token, logout } = useAdmin();
  const router = useRouter();
  const [d, setD] = useState(inicial);
  const [slugTocado, setSlugTocado] = useState(Boolean(id));
  const [previa, setPrevia] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const enfocar = useRef(null); // índice de la sección nueva que debe recibir el foco
  const cambios = JSON.stringify(d) !== JSON.stringify(inicial);
  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const secs = d.secciones;
  const setSec = (i, k, v) => set("secciones", secs.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const mover = (i, dir) => { const j = i + dir; if (j < 0 || j >= secs.length) return; const n = [...secs]; [n[i], n[j]] = [n[j], n[i]]; set("secciones", n); };

  useEffect(() => {
    if (!cambios) return;
    const avisar = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [cambios]);

  function cambiarTitulo(v) {
    setD((s) => ({ ...s, titulo: v, slug: slugTocado ? s.slug : slugDe(v) }));
  }
  function agregar() {
    if (secs.length >= MAX_SECCIONES) return;
    enfocar.current = secs.length;
    set("secciones", [...secs, { titulo: "", texto: "" }]);
  }
  useEffect(() => {
    if (enfocar.current === null) return;
    document.getElementById(`sec-t-${enfocar.current}`)?.focus();
    enfocar.current = null;
  }, [secs.length]);
  function quitar(i) {
    const s = secs[i];
    if ((s.titulo.trim() || s.texto.trim()) && !window.confirm(`¿Borrar la sección «${s.titulo || `sección ${i + 1}`}»?`)) return;
    set("secciones", secs.filter((_, j) => j !== i));
  }
  function salir() {
    if (cambios && !window.confirm("Tienes cambios sin guardar. ¿Salir sin guardar?")) return;
    router.push("/admin/politicas");
  }

  async function guardar() {
    setError(""); setBusy(true);
    try {
      const res = await fetch("/api/admin/paginas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
        body: JSON.stringify(id ? { op: "guardar", id, datos: d } : { op: "crear", datos: d }),
      });
      if (res.status === 401) { logout(); return; }
      const r = await res.json();
      if (r.error) throw new Error(r.error);
      try { sessionStorage.setItem(CLAVE_AVISO_PAGINAS, id ? `Página «${r.pagina.titulo}» guardada.` : `Página «${r.pagina.titulo}» creada.`); } catch {}
      setD(inicial); // evita el aviso de cambios al salir
      router.push("/admin/politicas");
    } catch (e) {
      setError(String(e?.message || e));
      setBusy(false);
    }
  }

  const llenas = secs.filter((s) => s.titulo.trim());

  return (
    <div className="pf pg">
      <div className="pf-head">
        <button type="button" className="pf-volver" onClick={salir}>← Políticas</button>
        <div className="pf-titulo">
          <h2>{d.titulo || (id ? "Página sin título" : "Nueva página")}</h2>
          {id && <span className={`badge ${d.visible ? "ok" : "off"}`}>{d.visible ? "Visible" : "Oculta"}</span>}
        </div>
      </div>

      <div className="pf-grid">
        <div className="pf-col">
          <section className="pr-card pf-sec">
            <h3>Página</h3>
            <div className="field full">
              <label htmlFor="pg-titulo">Título</label>
              <input id="pg-titulo" className="input" maxLength={MAX_TITULO} value={d.titulo} onChange={(e) => cambiarTitulo(e.target.value)} placeholder="Política de garantía" />
            </div>
            <div className="field full">
              <label htmlFor="pg-slug">Dirección</label>
              <div className="pg-slug"><span className="mono">/politicas/</span>
                <input id="pg-slug" className="input mono" value={d.slug} onChange={(e) => { setSlugTocado(true); set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); }} placeholder="garantia" />
              </div>
              <small className="ct-hint">Se propone desde el título. Si la cambias en una página ya publicada, los enlaces viejos dejan de funcionar.</small>
            </div>
          </section>

          <section className="pr-card pf-sec">
            <div className="pg-secs-head">
              <h3>Secciones</h3>
              <small className="ct-hint">{secs.length} / {MAX_SECCIONES}</small>
            </div>
            <p className="ct-hint">Cada sección sale en el índice. En el texto: línea en blanco entre párrafos, <b>**negrita**</b>, «- » para listas y «## » para subtítulos. No se acepta HTML.</p>
            <ol className="pg-secs">
              {secs.map((s, i) => (
                <li key={i} className="pg-sec">
                  <div className="pg-sec-head">
                    <span className="pg-num">{String(i + 1).padStart(2, "0")}</span>
                    <input id={`sec-t-${i}`} className="input" maxLength={MAX_TITULO_SECCION} value={s.titulo} placeholder="Título de la sección"
                      aria-label={`Título de la sección ${i + 1}`} onChange={(e) => setSec(i, "titulo", e.target.value)} />
                    <span className="ft-acc">
                      <button type="button" className="ft-btn" onClick={() => mover(i, -1)} disabled={i === 0} aria-label={`Subir sección ${i + 1}`} title="Subir">↑</button>
                      <button type="button" className="ft-btn" onClick={() => mover(i, 1)} disabled={i === secs.length - 1} aria-label={`Bajar sección ${i + 1}`} title="Bajar">↓</button>
                      <button type="button" className="ft-btn ft-quitar" onClick={() => quitar(i)} aria-label={`Borrar sección ${i + 1}`} title="Borrar">✕</button>
                    </span>
                  </div>
                  <textarea id={`sec-x-${i}`} className="input pg-texto" rows={6} maxLength={MAX_TEXTO} value={s.texto} placeholder="Texto de la sección"
                    aria-label={`Texto de la sección ${i + 1}`} onChange={(e) => setSec(i, "texto", e.target.value)} />
                  <small className="ct-hint pg-cuenta">{s.texto.length} / {MAX_TEXTO}</small>
                </li>
              ))}
            </ol>
            <button type="button" className="btn-ghost" onClick={agregar} disabled={secs.length >= MAX_SECCIONES}>+ Agregar sección</button>
          </section>
        </div>

        <aside className="pf-lado">
          <section className="pr-card pf-sec">
            <h3>Cómo se ve</h3>
            <fieldset className="pg-estilo">
              <legend className="sr">Estilo de las secciones</legend>
              <label className={d.estilo === "acordeon" ? "on" : ""}>
                <input type="radio" name="pg-estilo" checked={d.estilo === "acordeon"} onChange={() => set("estilo", "acordeon")} />
                <b>Acordeón «+»</b><small>Cada sección se abre y se cierra. Ideal para garantía o envíos.</small>
              </label>
              <label className={d.estilo === "texto" ? "on" : ""}>
                <input type="radio" name="pg-estilo" checked={d.estilo === "texto"} onChange={() => set("estilo", "texto")} />
                <b>Texto corrido</b><small>Todo el texto seguido. Ideal para términos o privacidad.</small>
              </label>
            </fieldset>
            <label className="ep-check">
              <input type="checkbox" id="pg-visible" checked={d.visible} onChange={(e) => set("visible", e.target.checked)} />
              <span>Visible en la web</span>
            </label>
            <p className="ep-hint">Oculta: no aparece en el pie ni en la web, pero la sigues editando aquí.</p>
            <button type="button" className="btn-ghost pg-previa-btn" onClick={() => setPrevia((v) => !v)} disabled={!llenas.length} aria-expanded={previa}>
              {previa ? "Ocultar vista previa" : "Vista previa"}
            </button>
          </section>
        </aside>
      </div>

      {previa && llenas.length > 0 && (
        <section className="pr-card pg-previa" aria-label="Vista previa">
          <PoliticaVista titulo={d.titulo || "Sin título"} estilo={d.estilo} secciones={llenas} previa />
        </section>
      )}

      <div className="pf-barra">
        <span className="pf-estado">{cambios ? "Cambios sin guardar" : "Sin cambios"}</span>
        {error && <span className="form-error pf-error" role="alert">{error}</span>}
        <button type="button" className="btn-ghost" onClick={salir} disabled={busy}>Cancelar</button>
        <button type="button" className="btn" onClick={guardar} disabled={busy || (id && !cambios)}>
          {busy ? "Guardando…" : id ? "Guardar cambios" : "Crear página"}
        </button>
      </div>
    </div>
  );
}
