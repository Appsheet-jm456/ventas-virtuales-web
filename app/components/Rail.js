"use client";

import { useRef } from "react";

// Fila horizontal que se desplaza con flechas o deslizando. Sirve para cualquier lista de tarjetas.
export default function Rail({ children, className = "", label = "elementos" }) {
  const ref = useRef(null);
  const mover = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div className={`rail ${className}`}>
      <button className="rail-nav prev" onClick={() => mover(-1)} aria-label={`Ver ${label} anteriores`}>‹</button>
      <div className="rail-track" ref={ref}>{children}</div>
      <button className="rail-nav next" onClick={() => mover(1)} aria-label={`Ver más ${label}`}>›</button>
    </div>
  );
}
