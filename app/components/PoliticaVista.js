"use client";

import { useEffect, useMemo, useState } from "react";
import TextoSeguro from "./TextoSeguro";
import { anclas } from "../../lib/paginas-base";
import { norm } from "../../lib/productos";
import { textoPlano } from "../../lib/texto-seguro";

// Página de política (HU-26): índice numerado a la izquierda (fijo al hacer scroll), buscador y
// secciones a la derecha en acordeón «+» o en texto corrido. En celular el índice es un
// desplegable «Contenido». Sirve también como vista previa en el panel.

function Resaltado({ texto, q }) {
  if (!q) return texto;
  const i = norm(texto).indexOf(q);
  if (i < 0) return texto;
  return <>{texto.slice(0, i)}<mark>{texto.slice(i, i + q.length)}</mark>{texto.slice(i + q.length)}</>;
}

export default function PoliticaVista({ titulo, estilo = "acordeon", secciones = [], actualizado = "", previa = false }) {
  const ids = useMemo(() => anclas(secciones), [secciones]);
  const acordeon = estilo === "acordeon" && secciones.length > 1;
  const [abiertas, setAbiertas] = useState(() => new Set());
  const [activa, setActiva] = useState(ids[0]);
  const [busca, setBusca] = useState("");
  const q = norm(busca.trim());
  const coincide = (s) => !q || norm(`${s.titulo} ${textoPlano(s.texto)}`).includes(q);
  const visibles = secciones.map((s, i) => ({ s, i, id: ids[i] })).filter(({ s }) => coincide(s));

  // Enlace con #sección: abre y baja a esa sección.
  useEffect(() => {
    if (previa) return;
    const h = decodeURIComponent(window.location.hash.slice(1));
    if (h && ids.includes(h)) { setAbiertas(new Set([h])); setActiva(h); setTimeout(() => document.getElementById(h)?.scrollIntoView({ block: "start" }), 50); }
  }, [ids, previa]);

  // Marca en el índice la sección que se está leyendo.
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((ent) => {
      const vis = ent.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActiva(vis[0].target.id);
    }, { rootMargin: "-150px 0px -55% 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [ids, busca]);

  // Al buscar, el acordeón abre las secciones que coinciden.
  useEffect(() => { if (q && acordeon) setAbiertas(new Set(visibles.map((v) => v.id))); }, [q]);

  function ir(e, id) {
    e.preventDefault();
    if (acordeon) setAbiertas((a) => new Set(a).add(id));
    setActiva(id);
    if (!previa) history.replaceState(null, "", `#${id}`);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    document.querySelector(".pv-movil[open]")?.removeAttribute("open");
  }
  const alternar = (id) => setAbiertas((a) => { const n = new Set(a); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const indice = (
    <ol className="pv-lista">
      {visibles.map(({ s, i, id }) => (
        <li key={id}>
          <a href={`#${id}`} onClick={(e) => ir(e, id)} className={activa === id ? "activa" : undefined} aria-current={activa === id ? "location" : undefined}>
            <span className="pv-num">{String(i + 1).padStart(2, "0")}</span>
            <span><Resaltado texto={s.titulo} q={q} /></span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="pv">
      <header className="pv-cabeza">
        <h1>{titulo}</h1>
        {actualizado && <p className="pv-fecha">Última actualización: {actualizado}</p>}
      </header>

      <div className="pv-cuerpo">
        <nav className="pv-indice" aria-label="Contenido de la página">
          {secciones.length > 1 && (
            <div className="pv-buscar">
              <label htmlFor="pv-busca" className="sr-only">Buscar en esta política</label>
              <input id="pv-busca" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar en esta política" />
              {q && <small role="status">{visibles.length ? `${visibles.length} ${visibles.length === 1 ? "sección" : "secciones"}` : "Sin coincidencias"}</small>}
            </div>
          )}
          <details className="pv-movil">
            <summary>Contenido</summary>
            {indice}
          </details>
          <div className="pv-escritorio">
            <span className="pv-titulo-indice">Contenido</span>
            {indice}
          </div>
        </nav>

        <div className={`pv-secciones ${acordeon ? "pv-acordeon" : "pv-texto"}`}>
          {visibles.length === 0 && <p className="pv-vacio">No hay secciones que coincidan con «{busca}».</p>}
          {visibles.map(({ s, i, id }) => {
            const abierta = !acordeon || abiertas.has(id);
            return (
              <section key={id} id={id} className={`pv-sec${abierta ? " abierta" : ""}`}>
                {acordeon ? (
                  <h2>
                    <button type="button" aria-expanded={abierta} aria-controls={`${id}-txt`} onClick={() => alternar(id)}>
                      <span className="pv-num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="pv-sec-t"><Resaltado texto={s.titulo} q={q} /></span>
                      <span className="pv-mas" aria-hidden="true">{abierta ? "−" : "+"}</span>
                    </button>
                  </h2>
                ) : (
                  <h2><span className="pv-num">{String(i + 1).padStart(2, "0")}</span> <Resaltado texto={s.titulo} q={q} /></h2>
                )}
                <div id={`${id}-txt`} className="pv-sec-txt" hidden={!abierta}>
                  <TextoSeguro texto={s.texto} />
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
