"use client";

import Link from "next/link";
import { useRef } from "react";

// Fila de categorías con imagen que se desplaza con flechas o deslizando (HU-03).
export default function CategoryStrip({ categorias = [] }) {
  const ref = useRef(null);
  const mover = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  if (!categorias.length) return null;

  return (
    <div className="cs">
      <button className="cs-nav prev" onClick={() => mover(-1)} aria-label="Ver categorías anteriores">‹</button>
      <div className="cs-track" ref={ref}>
        {categorias.map((c) => <CategoryTile key={c.nombre} c={c} />)}
      </div>
      <button className="cs-nav next" onClick={() => mover(1)} aria-label="Ver más categorías">›</button>
    </div>
  );
}

export function CategoryTile({ c }) {
  return (
    <Link className="cat-tile" href={`/productos?categoria=${encodeURIComponent(c.nombre)}`}>
      <span className="cat-img">
        {c.img ? <img src={c.img} alt="" loading="lazy" /> : <span className="cat-ico">💻</span>}
      </span>
      <span className="cat-name">{c.nombre}</span>
      <span className="cat-count">{c.disponibles} disponible{c.disponibles === 1 ? "" : "s"}</span>
    </Link>
  );
}
