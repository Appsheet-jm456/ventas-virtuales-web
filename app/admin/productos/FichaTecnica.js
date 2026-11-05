"use client";

import { useState } from "react";
import { FICHA_MAX_FILAS, FICHA_MAX_CAMPO, FICHA_MAX_VALOR, SUGERENCIAS, PLANTILLA_PORTATIL } from "../../../lib/ficha";

// Sección «Ficha técnica» del formulario de producto (HU-27): filas Característica → Valor que se
// agregan, editan, reordenan y quitan; plantilla de portátil, copiar de otro producto y vista
// previa. El valor es la lista [{ campo, valor }] que se guarda en la columna `ficha`.

const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export default function FichaTecnica({ value = [], onChange, cargarProductos, codigoActual, disabled }) {
  const filas = Array.isArray(value) ? value : [];
  const [copiar, setCopiar] = useState({ abierto: false, cargando: false, lista: [], busca: "", error: "" });
  const [verPrevia, setVerPrevia] = useState(false);
  const llenas = filas.filter((x) => x.campo?.trim() && x.valor?.trim());
  const lleno = filas.length >= FICHA_MAX_FILAS;

  const cambiar = (i, k, v) => onChange(filas.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const quitar = (i) => onChange(filas.filter((_, j) => j !== i));
  const mover = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= filas.length) return;
    const n = [...filas];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  function agregar() {
    if (lleno) return;
    onChange([...filas, { campo: "", valor: "" }]);
    // Lleva el foco a la característica de la fila nueva.
    setTimeout(() => document.getElementById(`ficha-campo-${filas.length}`)?.focus(), 0);
  }
  // No pisa lo escrito: solo agrega las características de la plantilla que aún no están.
  function usarPlantilla() {
    const ya = new Set(filas.map((x) => norm(x.campo)));
    const nuevas = PLANTILLA_PORTATIL.filter((c) => !ya.has(norm(c))).map((campo) => ({ campo, valor: "" }));
    onChange([...filas, ...nuevas].slice(0, FICHA_MAX_FILAS));
  }

  async function abrirCopiar() {
    if (copiar.abierto) { setCopiar((c) => ({ ...c, abierto: false })); return; }
    setCopiar({ abierto: true, cargando: true, lista: [], busca: "", error: "" });
    try {
      const rows = await cargarProductos();
      const lista = rows.filter((r) => Array.isArray(r.Ficha) && r.Ficha.length && r["Código"] !== codigoActual);
      setCopiar((c) => ({ ...c, cargando: false, lista }));
    } catch (e) {
      setCopiar((c) => ({ ...c, cargando: false, error: String(e?.message || e) }));
    }
  }
  function copiarDe(r) {
    if (llenas.length && !window.confirm(`Se reemplazan las ${llenas.length} filas actuales por la ficha de ${r["Código"]}. ¿Continuar?`)) return;
    onChange(r.Ficha.map((x) => ({ campo: x.campo, valor: x.valor })));
    setCopiar((c) => ({ ...c, abierto: false }));
  }
  const coincidencias = copiar.lista.filter((r) => {
    const q = norm(copiar.busca);
    return !q || norm([r["Código"], r["Marca"], r["Modelo"], r["Descripción"]].join(" ")).includes(q);
  }).slice(0, 8);

  return (
    <div className="ft">
      <datalist id="ficha-sugerencias">{SUGERENCIAS.map((s) => <option key={s} value={s} />)}</datalist>

      {filas.length === 0
        ? <p className="ct-hint ft-vacio">Sin ficha técnica: el bloque no se muestra en la web. Agrega filas o usa la plantilla.</p>
        : filas.length > llenas.length && <p className="ct-hint ft-vacio">Las filas sin valor no se guardan ni se muestran en la web.</p>}

      {filas.length > 0 && (
        <ol className="ft-filas">
          {filas.map((x, i) => (
            <li key={i} className="ft-fila">
              <span className="ft-num" aria-hidden="true">{i + 1}</span>
              <input id={`ficha-campo-${i}`} className="input ft-campo" list="ficha-sugerencias" maxLength={FICHA_MAX_CAMPO} value={x.campo}
                placeholder="Característica" aria-label={`Característica de la fila ${i + 1}`} disabled={disabled}
                onChange={(e) => cambiar(i, "campo", e.target.value)} />
              <input id={`ficha-valor-${i}`} className="input ft-valor" maxLength={FICHA_MAX_VALOR} value={x.valor}
                placeholder="Valor" aria-label={`Valor de ${x.campo || `la fila ${i + 1}`}`} disabled={disabled}
                onChange={(e) => cambiar(i, "valor", e.target.value)} />
              <span className="ft-acc">
                <button type="button" className="ft-btn" onClick={() => mover(i, -1)} disabled={disabled || i === 0} aria-label={`Subir ${x.campo || `fila ${i + 1}`}`} title="Subir">↑</button>
                <button type="button" className="ft-btn" onClick={() => mover(i, 1)} disabled={disabled || i === filas.length - 1} aria-label={`Bajar ${x.campo || `fila ${i + 1}`}`} title="Bajar">↓</button>
                <button type="button" className="ft-btn ft-quitar" onClick={() => quitar(i)} disabled={disabled} aria-label={`Quitar ${x.campo || `fila ${i + 1}`}`} title="Quitar">✕</button>
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="ft-barra">
        <button type="button" className="btn-ghost" onClick={agregar} disabled={disabled || lleno}>+ Agregar fila</button>
        <button type="button" className="btn-ghost" onClick={usarPlantilla} disabled={disabled || lleno}>Usar plantilla de portátil</button>
        <button type="button" className="btn-ghost" onClick={abrirCopiar} disabled={disabled} aria-expanded={copiar.abierto}>Copiar ficha de otro producto</button>
        {llenas.length > 0 && <button type="button" className="pr-link" onClick={() => setVerPrevia((v) => !v)} aria-expanded={verPrevia}>{verPrevia ? "Ocultar vista previa" : "Vista previa"}</button>}
        <small className={`ct-hint ft-cuenta${lleno ? " cf-dirty" : ""}`}>{filas.length} / {FICHA_MAX_FILAS} filas</small>
      </div>

      {copiar.abierto && (
        <div className="ft-copiar">
          <label htmlFor="ficha-copiar-busca">Buscar por código o modelo</label>
          <input id="ficha-copiar-busca" className="input" autoFocus value={copiar.busca} placeholder="Ej.: EliteBook 840 o 100-102"
            onChange={(e) => setCopiar((c) => ({ ...c, busca: e.target.value }))} />
          {copiar.cargando && <small className="ct-hint">Buscando productos con ficha…</small>}
          {copiar.error && <small className="form-error">{copiar.error}</small>}
          {!copiar.cargando && !copiar.error && (coincidencias.length
            ? <ul className="ft-copiar-lista">{coincidencias.map((r) => (
                <li key={r._id}><button type="button" onClick={() => copiarDe(r)}>
                  <span className="mono">{r["Código"]}</span> {[r["Marca"], r["Modelo"]].filter(Boolean).join(" ")} <small>({r.Ficha.length} filas)</small>
                </button></li>))}</ul>
            : <small className="ct-hint">{copiar.lista.length ? "Ningún producto con ficha coincide." : "Aún no hay otros productos con ficha técnica."}</small>)}
        </div>
      )}

      {verPrevia && llenas.length > 0 && (
        <div className="ft-previa">
          <b>Así se verá en la web</b>
          <table className="ft-tabla"><tbody>
            {llenas.map((x, i) => <tr key={i}><th>{x.campo}</th><td>{x.valor}</td></tr>)}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
