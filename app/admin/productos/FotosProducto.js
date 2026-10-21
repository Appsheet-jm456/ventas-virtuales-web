"use client";

import { useState } from "react";

import SubirImagen, { REGLAS } from "../SubirImagen";
import { cld } from "../../../lib/cdn";
import { parseImages } from "../../../lib/images";

// Fotos de un producto en el formulario (HU-17): miniaturas con portada, quitar, subir varias a
// Cloudinary (carpeta del producto) y, de respaldo, pegar una URL. value es el texto "url1, url2"
// que ya guarda el formulario; la primera foto es la portada. onSubida avisa de cada subida nueva
// para que el formulario borre de Cloudinary las que no se lleguen a guardar.

export const MAX_FOTOS = 8;
export const listaDe = (t) => String(t ?? "").split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);

function miniatura(url) {
  if (url.startsWith("https://res.cloudinary.com/")) return cld(url, "f_auto,q_auto,w_160,h_160,c_fill");
  return parseImages({ Foto: url })[0] || url;
}

export default function FotosProducto({ value, codigo, onChange, onSubida, onSubiendo, disabled }) {
  const fotos = listaDe(value);
  const [url, setUrl] = useState("");
  const [aviso, setAviso] = useState("");
  const lleno = fotos.length >= MAX_FOTOS;
  const sinCodigo = !String(codigo || "").trim();

  const poner = (lista) => onChange(lista.join(", "));
  const agregar = (nueva) => {
    setAviso("");
    if (fotos.includes(nueva)) return;
    poner([...fotos, nueva]);
  };

  function agregarUrl() {
    const u = url.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) { setAviso("La dirección debe empezar por https://"); return; }
    if (lleno) { setAviso(`Máximo ${MAX_FOTOS} fotos por producto.`); return; }
    agregar(u);
    setUrl("");
  }

  return (
    <div className="fp">
      {fotos.length > 0 && (
        <ul className="fp-lista" aria-label="Fotos del producto">
          {fotos.map((u, i) => (
            <li key={u} className={`fp-item${i === 0 ? " portada" : ""}`}>
              <img src={miniatura(u)} alt="" loading="lazy" referrerPolicy="no-referrer" />
              {i === 0 && <span className="fp-tag">Portada</span>}
              <div className="fp-acc">
                {i > 0 && <button type="button" onClick={() => poner([u, ...fotos.filter((x) => x !== u)])} disabled={disabled} title="Usar como portada">★</button>}
                <button type="button" onClick={() => poner(fotos.filter((x) => x !== u))} disabled={disabled} title="Quitar" aria-label="Quitar foto">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <SubirImagen
        id="campo-Foto-subir"
        reglas={REGLAS.producto}
        codigo={codigo}
        multiple
        texto="Subir fotos"
        disabled={disabled || lleno || sinCodigo}
        onSubiendo={onSubiendo}
        onSubida={(u) => { onSubida?.(u); agregar(u); }}
      />
      {sinCodigo && <small className="ct-hint warn">Escribe primero el Código: las fotos se guardan en la carpeta del producto.</small>}
      {lleno && <small className="ct-hint warn">Llegaste al máximo de {MAX_FOTOS} fotos.</small>}
      <div className="fp-url">
        <input
          id="campo-Foto"
          className="input"
          value={url}
          placeholder="…o pega la URL de una foto (https://…)"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarUrl(); } }}
          disabled={disabled}
        />
        <button type="button" className="btn-ghost" onClick={agregarUrl} disabled={disabled || !url.trim()}>Agregar</button>
      </div>
      {aviso && <div className="form-error" role="alert">{aviso}</div>}
    </div>
  );
}
