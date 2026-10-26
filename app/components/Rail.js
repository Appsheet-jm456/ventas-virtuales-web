"use client";

import { Children, useEffect, useRef, useState } from "react";

// Fila horizontal que se desplaza con flechas o deslizando. Sirve para cualquier lista de tarjetas.
// Las flechas solo aparecen si hay algo que ver en esa dirección (HU-30): «‹» después de avanzar,
// «›» mientras queden tarjetas a la derecha, y ninguna si todo cabe.
export default function Rail({ children, className = "", label = "elementos" }) {
  const ref = useRef(null);
  const [hay, setHay] = useState({ prev: false, next: false });
  const total = Children.count(children);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setHay({ prev: el.scrollLeft > 2, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(medir) : null;
    ro?.observe(el);
    return () => { el.removeEventListener("scroll", medir); ro?.disconnect(); };
  }, [total]);

  const mover = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div className={`rail ${className}`}>
      <button type="button" className="rail-nav prev" hidden={!hay.prev} onClick={() => mover(-1)} aria-label={`Ver ${label} anteriores`}>‹</button>
      <div className="rail-track" ref={ref}>{children}</div>
      <button type="button" className="rail-nav next" hidden={!hay.next} onClick={() => mover(1)} aria-label={`Ver más ${label}`}>›</button>
    </div>
  );
}
