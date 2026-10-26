"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Rail from "./Rail";

// «Vistos recientemente» (HU-30). El historial son solo los códigos de producto y vive en el
// navegador del visitante (almacenamiento local): no se envía al servidor, no usa cookies y no
// identifica a nadie (decisión 0010). Los datos de cada tarjeta se piden al catálogo público, así
// que un producto oculto o eliminado desaparece solo.
const CLAVE = "vv-vistos";
const GUARDADOS = 12; // códigos que se recuerdan
const MOSTRADOS = 8;  // tarjetas que se muestran

const leer = () => {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string" && x && x.length <= 100) : [];
  } catch { return []; }
};
const guardar = (lista) => { try { localStorage.setItem(CLAVE, JSON.stringify(lista.slice(0, GUARDADOS))); } catch {} };

export default function VistosRecientemente({ codigo }) {
  const [filas, setFilas] = useState([]);

  useEffect(() => {
    let vivo = true;
    const previos = leer();
    // El actual pasa al frente del historial; la fila muestra los demás.
    guardar([codigo, ...previos.filter((c) => c !== codigo)]);
    const otros = previos.filter((c) => c !== codigo).slice(0, GUARDADOS);
    if (!otros.length) return;
    (async () => {
      try {
        const res = await fetch(`/api/products?codigos=${otros.map(encodeURIComponent).join(",")}`, { cache: "no-store" });
        const d = await res.json();
        const porCodigo = new Map((d.rows || []).map((r) => [String(r["Código"] ?? "").trim(), r]));
        const vigentes = otros.filter((c) => porCodigo.has(c));
        if (!vivo) return;
        setFilas(vigentes.slice(0, MOSTRADOS).map((c) => porCodigo.get(c)));
        // Se olvidan los que ya no existen en el catálogo.
        guardar([codigo, ...vigentes]);
      } catch { /* sin conexión: la fila simplemente no aparece */ }
    })();
    return () => { vivo = false; };
  }, [codigo]);

  function borrar() {
    try { localStorage.removeItem(CLAVE); } catch {}
    setFilas([]);
  }

  if (!filas.length) return null;
  return (
    <section className="pd-fila" id="pd-vistos" aria-labelledby="pd-vistos-t">
      <div className="pd-fila-cab">
        <h2 id="pd-vistos-t">Vistos recientemente</h2>
        <button type="button" className="pd-fila-borrar" onClick={borrar}>Borrar historial</button>
      </div>
      <Rail className="pd-rail" label="productos vistos">
        {filas.map((r) => <ProductCard key={r["Código"]} r={r} />)}
      </Rail>
    </section>
  );
}
