"use client";

import { useRef, useState } from "react";
import TextoSeguro, { LineaSegura } from "../../components/TextoSeguro";

// Sección «Descripción ampliada» del formulario de producto (HU-29): resumen destacado, título y
// texto largo en «texto seguro» (sin HTML). Botones de formato que escriben las marcas por el
// dueño y vista previa con el mismo componente que usa la web.

const MAX = { "Resumen": 400, "Título descripción": 120, "Descripción larga": 5000 };

function Contador({ k, valor }) {
  const n = String(valor || "").length;
  return <small className={`ct-hint da-cuenta${n > MAX[k] ? " cf-dirty" : ""}`}>{n} / {MAX[k]}</small>;
}

export default function DescripcionAmpliada({ fields, set, disabled }) {
  const area = useRef(null);
  const [previa, setPrevia] = useState(false);
  const texto = fields["Descripción larga"] || "";

  // Envuelve la selección (negrita) o antepone una marca a cada línea seleccionada (lista, subtítulo).
  function formato(tipo) {
    const el = area.current;
    if (!el) return;
    const ini = el.selectionStart, fin = el.selectionEnd;
    let nuevo, selIni, selFin;
    if (tipo === "negrita") {
      const sel = texto.slice(ini, fin) || "texto en negrita";
      nuevo = texto.slice(0, ini) + `**${sel}**` + texto.slice(fin);
      selIni = ini + 2; selFin = selIni + sel.length;
    } else {
      const marca = tipo === "lista" ? "- " : "## ";
      const desde = texto.lastIndexOf("\n", ini - 1) + 1;
      const hastaN = texto.indexOf("\n", fin);
      const hasta = hastaN < 0 ? texto.length : hastaN;
      const bloque = texto.slice(desde, hasta) || (tipo === "lista" ? "Elemento" : "Subtítulo");
      const marcado = bloque.split("\n").map((l) => (l.startsWith(marca) ? l : marca + l.replace(/^(- |## )/, ""))).join("\n");
      nuevo = texto.slice(0, desde) + marcado + texto.slice(hasta);
      selIni = desde; selFin = desde + marcado.length;
    }
    set("Descripción larga", nuevo.slice(0, MAX["Descripción larga"]));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(selIni, selFin); });
  }

  const hay = (fields["Resumen"] || "").trim() || (fields["Título descripción"] || "").trim() || texto.trim();

  return (
    <div className="da">
      <div className="field full">
        <label htmlFor="campo-resumen">Resumen destacado</label>
        <textarea id="campo-resumen" className="input" rows={3} maxLength={MAX["Resumen"]} value={fields["Resumen"] || ""} disabled={disabled}
          placeholder="¡Llegó a nuestro inventario uno de los portátiles empresariales más confiables!…" onChange={(e) => set("Resumen", e.target.value)} />
        <span className="da-pie"><small className="ct-hint">Va debajo del nombre, con una barra azul. Admite **negrita**.</small><Contador k="Resumen" valor={fields["Resumen"]} /></span>
      </div>
      <div className="field full">
        <label htmlFor="campo-detalle-titulo">Título de la descripción</label>
        <input id="campo-detalle-titulo" className="input" maxLength={MAX["Título descripción"]} value={fields["Título descripción"] || ""} disabled={disabled}
          placeholder="El compañero ideal para la productividad en cualquier lugar" onChange={(e) => set("Título descripción", e.target.value)} />
        <span className="da-pie"><span /><Contador k="Título descripción" valor={fields["Título descripción"]} /></span>
      </div>
      <div className="field full">
        <label htmlFor="campo-detalle">Texto de la descripción</label>
        <div className="da-barra" role="toolbar" aria-label="Formato del texto">
          <button type="button" className="ft-btn da-fmt" onClick={() => formato("negrita")} disabled={disabled} title="Negrita: **texto**"><b>N</b> Negrita</button>
          <button type="button" className="ft-btn da-fmt" onClick={() => formato("lista")} disabled={disabled} title="Lista: - elemento">• Lista</button>
          <button type="button" className="ft-btn da-fmt" onClick={() => formato("subtitulo")} disabled={disabled} title="Subtítulo: ## Título">T Subtítulo</button>
        </div>
        <textarea id="campo-detalle" ref={area} className="input da-texto" rows={10} maxLength={MAX["Descripción larga"]} value={texto} disabled={disabled}
          placeholder={"El **HP ProBook 440 G7** es un portátil empresarial…\n\n## Lo que incluye\n- Cargador original\n- Garantía de 3 meses"}
          onChange={(e) => set("Descripción larga", e.target.value)} />
        <span className="da-pie"><small className="ct-hint">Deja una línea en blanco entre párrafos. No se acepta HTML: se muestra como texto.</small><Contador k="Descripción larga" valor={texto} /></span>
      </div>
      {hay && <button type="button" className="pr-link" onClick={() => setPrevia((v) => !v)} aria-expanded={previa}>{previa ? "Ocultar vista previa" : "Vista previa"}</button>}
      {previa && hay && (
        <div className="da-previa">
          {fields["Estado"] && <span className="da-insignia">{fields["Estado"]}</span>}
          {(fields["Resumen"] || "").trim() && <p className="da-resumen"><LineaSegura texto={fields["Resumen"]} /></p>}
          {(fields["Título descripción"] || "").trim() && <h4 className="da-titulo">{fields["Título descripción"]}</h4>}
          <TextoSeguro texto={texto} className="da-cuerpo" />
        </div>
      )}
    </div>
  );
}
