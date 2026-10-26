"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../AdminShell";
import SubirImagen, { REGLAS, descartarSubidas } from "../../SubirImagen";
import NosotrosVista from "../../../components/NosotrosVista";
import { cld } from "../../../../lib/cdn";
import { MAX, validarNosotros } from "../../../../lib/nosotros-base";

// Editor de la página «Nosotros» (HU-33), en Configuración › Nosotros: título, publicar, bloques
// (título, texto, foto a la izquierda o derecha con su texto alternativo) y cifras, con vista
// previa igual a la web. Las fotos subidas y no guardadas se borran al salir.

const VACIO = { titulo: "", texto: "", imagen: "", alt: "", posicion: "derecha" };

export default function NosotrosEditorPage() {
  const { token, logout } = useAdmin();
  const router = useRouter();
  const [guardado, setGuardado] = useState(null);
  const [d, setD] = useState(null);
  const [existe, setExiste] = useState(true);
  const [previa, setPrevia] = useState(false);
  const [busy, setBusy] = useState(false);
  const [subiendo, setSubiendo] = useState(0);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const subidas = useRef([]);
  const enfocar = useRef(null);

  async function api(payload) {
    const res = await fetch("/api/admin/nosotros", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` }, body: JSON.stringify(payload) });
    if (res.status === 401) { logout(); throw new Error("Sesión expirada: vuelve a entrar."); }
    const r = await res.json();
    if (r.error) throw new Error(r.error);
    return r;
  }

  useEffect(() => {
    (async () => {
      try { const r = await api({ op: "leer" }); setGuardado(r.nosotros); setD(r.nosotros); setExiste(r.existe); }
      catch (e) { setErrMsg(String(e?.message || e)); }
    })();
    // Al salir sin guardar, se borran las fotos subidas que no quedaron guardadas.
    return () => descartarSubidas(token, subidas.current);
  }, []);

  const cambios = d && guardado && (JSON.stringify(d) !== JSON.stringify(guardado) || !existe);
  useEffect(() => {
    if (!cambios) return;
    const aviso = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [cambios]);

  const bloques = d?.bloques || [];
  useEffect(() => {
    if (enfocar.current === null) return;
    document.getElementById(`nb-t-${enfocar.current}`)?.focus();
    enfocar.current = null;
  }, [bloques.length]);

  if (!d) return <div className="pr">{errMsg ? <p className="pr-aviso bad" role="alert">{errMsg}</p> : <p className="pr-sub">Cargando la página Nosotros…</p>}</div>;

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const setB = (i, k, v) => set("bloques", bloques.map((b, j) => (j === i ? { ...b, [k]: v } : b)));
  const moverB = (i, dir) => { const j = i + dir; if (j < 0 || j >= bloques.length) return; const n = [...bloques]; [n[i], n[j]] = [n[j], n[i]]; set("bloques", n); };
  const quitarB = (i) => {
    const b = bloques[i];
    if ((b.titulo || b.texto || b.imagen) && !window.confirm(`¿Quitar el bloque «${b.titulo || `bloque ${i + 1}`}»?`)) return;
    set("bloques", bloques.filter((_, j) => j !== i));
  };
  const agregarB = () => { if (bloques.length >= MAX.bloques) return; enfocar.current = bloques.length; set("bloques", [...bloques, { ...VACIO, posicion: bloques.length % 2 ? "derecha" : "izquierda" }]); };
  const cifras = d.cifras || [];
  const setC = (i, k, v) => set("cifras", cifras.map((c, j) => (j === i ? { ...c, [k]: v } : c)));

  async function guardar() {
    setBusy(true); setOkMsg(""); setErrMsg("");
    try {
      const r = await api({ op: "guardar", nosotros: d });
      setGuardado(r.nosotros); setD(r.nosotros); setExiste(true);
      subidas.current = subidas.current.filter((u) => !r.nosotros.bloques.some((b) => b.imagen === u));
      descartarSubidas(token, subidas.current); subidas.current = [];
      setOkMsg(r.nosotros.visible ? "Página Nosotros guardada y publicada. La web la toma en menos de un minuto." : "Página Nosotros guardada (sin publicar).");
    } catch (e) {
      setErrMsg(String(e?.message || e));
    } finally { setBusy(false); }
  }

  const previaOk = validarNosotros({ ...d, visible: false });

  return (
    <div className="pf nb">
      <div className="pf-head">
        <button type="button" className="pf-volver" onClick={() => { if (!cambios || window.confirm("Tienes cambios sin guardar. ¿Salir sin guardar?")) router.push("/admin/configuracion"); }}>← Configuración</button>
        <div className="pf-titulo">
          <h2>Página Nosotros</h2>
          <span className={`badge ${guardado.visible && existe ? "ok" : "off"}`}>{guardado.visible && existe ? "Publicada" : "Sin publicar"}</span>
          {guardado.visible && existe && <a className="pr-link" href="/nosotros" target="_blank" rel="noopener noreferrer">Ver en la web</a>}
        </div>
      </div>
      {!existe && <p className="pr-aviso ok" role="status">Te dejamos una estructura sugerida: cambia lo que va entre corchetes [ ], sube fotos y publícala cuando esté lista.</p>}
      {okMsg && <p className="pr-aviso ok" role="status">{okMsg}</p>}
      {errMsg && <p className="pr-aviso bad" role="alert">{errMsg}</p>}

      <div className="pf-grid">
        <div className="pf-col">
          <section className="pr-card pf-sec">
            <h3>Título</h3>
            <div className="field full">
              <label htmlFor="nb-titulo">Título de la página</label>
              <input id="nb-titulo" className="input" maxLength={MAX.titulo} value={d.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Nosotros | Ventas Virtual Colombia" />
            </div>
          </section>

          <section className="pr-card pf-sec">
            <div className="pg-secs-head"><h3>Bloques</h3><small className="ct-hint">{bloques.length} / {MAX.bloques}</small></div>
            <p className="ct-hint">Biografía, años en el mercado, por qué elegirnos, el equipo… En el texto: línea en blanco entre párrafos, <b>**negrita**</b>, «- » para listas y «## » para subtítulos. No se acepta HTML.</p>
            <ol className="pg-secs">
              {bloques.map((b, i) => (
                <li key={i} className="pg-sec nb-bloque">
                  <div className="pg-sec-head">
                    <span className="pg-num">{String(i + 1).padStart(2, "0")}</span>
                    <input id={`nb-t-${i}`} className="input" maxLength={MAX.tituloBloque} value={b.titulo} placeholder="Título del bloque" aria-label={`Título del bloque ${i + 1}`} onChange={(e) => setB(i, "titulo", e.target.value)} />
                    <span className="ft-acc">
                      <button type="button" className="ft-btn" onClick={() => moverB(i, -1)} disabled={i === 0} aria-label={`Subir bloque ${i + 1}`} title="Subir">↑</button>
                      <button type="button" className="ft-btn" onClick={() => moverB(i, 1)} disabled={i === bloques.length - 1} aria-label={`Bajar bloque ${i + 1}`} title="Bajar">↓</button>
                      <button type="button" className="ft-btn ft-quitar" onClick={() => quitarB(i)} aria-label={`Quitar bloque ${i + 1}`} title="Quitar">✕</button>
                    </span>
                  </div>
                  <textarea id={`nb-x-${i}`} className="input pg-texto" rows={5} maxLength={MAX.texto} value={b.texto} placeholder="Texto del bloque" aria-label={`Texto del bloque ${i + 1}`} onChange={(e) => setB(i, "texto", e.target.value)} />
                  <div className="nb-foto">
                    {b.imagen
                      ? <img className="nb-foto-img" src={cld(b.imagen, "f_auto,q_auto,c_fill,w_240,h_160")} alt="" />
                      : <span className="nb-foto-vacia" aria-hidden="true">Sin foto</span>}
                    <div className="nb-foto-campos">
                      <SubirImagen id={`nb-subir-${i}`} reglas={REGLAS.nosotros} texto={b.imagen ? "Cambiar foto" : "Subir foto"}
                        onSubiendo={(v) => setSubiendo((n) => Math.max(0, n + (v ? 1 : -1)))}
                        onSubida={(url) => { subidas.current.push(url); setB(i, "imagen", url); }} />
                      {b.imagen && <button type="button" className="pr-link" onClick={() => setB(i, "imagen", "")}>Quitar foto</button>}
                      {b.imagen && (
                        <>
                          <label className="nb-lbl" htmlFor={`nb-alt-${i}`}>Describe la foto (texto alternativo)</label>
                          <input id={`nb-alt-${i}`} className="input" maxLength={MAX.alt} value={b.alt} placeholder="El equipo de Ventas Virtual frente a la tienda" onChange={(e) => setB(i, "alt", e.target.value)} />
                          <fieldset className="nb-pos">
                            <legend className="nb-lbl">Foto a la</legend>
                            {[["izquierda", "Izquierda"], ["derecha", "Derecha"]].map(([v, et]) => (
                              <label key={v} className={b.posicion === v ? "on" : ""}>
                                <input type="radio" name={`nb-pos-${i}`} checked={b.posicion === v} onChange={() => setB(i, "posicion", v)} /> {et}
                              </label>
                            ))}
                          </fieldset>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <button type="button" className="btn-ghost" onClick={agregarB} disabled={bloques.length >= MAX.bloques}>+ Agregar bloque</button>
          </section>

          <section className="pr-card pf-sec">
            <div className="pg-secs-head"><h3>Cifras</h3><small className="ct-hint">{cifras.length} / {MAX.cifras}</small></div>
            <p className="ct-hint">Se muestran como tarjetas destacadas después del primer bloque. Ejemplo: «+10 años» · «en el mercado».</p>
            <ul className="nb-cifras">
              {cifras.map((c, i) => (
                <li key={i}>
                  <input className="input" maxLength={MAX.valor} value={c.valor} placeholder="+10 años" aria-label={`Número de la cifra ${i + 1}`} onChange={(e) => setC(i, "valor", e.target.value)} />
                  <input className="input" maxLength={MAX.etiqueta} value={c.etiqueta} placeholder="en el mercado" aria-label={`Texto de la cifra ${i + 1}`} onChange={(e) => setC(i, "etiqueta", e.target.value)} />
                  <button type="button" className="ft-btn ft-quitar" onClick={() => set("cifras", cifras.filter((_, j) => j !== i))} aria-label={`Quitar cifra ${i + 1}`}>✕</button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn-ghost" onClick={() => set("cifras", [...cifras, { valor: "", etiqueta: "" }])} disabled={cifras.length >= MAX.cifras}>+ Agregar cifra</button>
          </section>
        </div>

        <aside className="pf-lado">
          <section className="pr-card pf-sec">
            <h3>Publicación</h3>
            <label className="ep-check">
              <input type="checkbox" id="nb-visible" checked={d.visible === true} onChange={(e) => set("visible", e.target.checked)} />
              <span>Publicar en la web</span>
            </label>
            <p className="ep-hint">Publicada: se ve en <b>/nosotros</b> y aparece «Nosotros» en la barra superior y en el pie. Sin publicar: la sigues editando aquí.</p>
            <button type="button" className="btn-ghost pg-previa-btn" onClick={() => setPrevia((v) => !v)} aria-expanded={previa}>{previa ? "Ocultar vista previa" : "Vista previa"}</button>
          </section>
        </aside>
      </div>

      {previa && (
        <section className="pr-card pg-previa" aria-label="Vista previa">
          {previaOk.error ? <p className="pr-aviso bad">{previaOk.error}</p> : <NosotrosVista nosotros={previaOk.nosotros} />}
        </section>
      )}

      <div className="pf-barra">
        <span className="pf-estado">{subiendo ? "Subiendo foto…" : cambios ? "Cambios sin guardar" : "Sin cambios"}</span>
        <button type="button" className="btn-ghost" disabled={!cambios || busy} onClick={() => { descartarSubidas(token, subidas.current); subidas.current = []; setD(guardado); setOkMsg(""); setErrMsg(""); }}>Descartar</button>
        <button type="button" className="btn" onClick={guardar} disabled={busy || subiendo > 0 || !cambios}>{busy ? "Guardando…" : "Guardar cambios"}</button>
      </div>
    </div>
  );
}
