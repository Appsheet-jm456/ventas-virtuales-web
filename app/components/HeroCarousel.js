"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SITE, bannerHref } from "../../lib/site";

const INTERVALO = 5000; // ms entre imágenes (HU-02)

// Banner rotativo del Inicio: pasa solo cada 5 s, con flechas, puntos y deslizar en el celular.
// Se detiene mientras el cursor está encima y no se mueve solo si el usuario pidió menos animación.
export default function HeroCarousel({ banners = SITE.banners || [], whatsapp }) {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const inicioToque = useRef(null);
  const n = banners.length;

  const ir = useCallback((k) => setI(((k % n) + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || pausa) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), INTERVALO);
    return () => clearInterval(t);
  }, [n, pausa]);

  if (!n) return null;

  return (
    <section
      className="hc"
      aria-roledescription="carrusel"
      aria-label="Promociones"
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      onTouchStart={(e) => { inicioToque.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (inicioToque.current == null) return;
        const dx = e.changedTouches[0].clientX - inicioToque.current;
        if (Math.abs(dx) > 40) ir(i + (dx < 0 ? 1 : -1));
        inicioToque.current = null;
      }}
    >
      <div className="hc-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {banners.map((b, k) => {
          const href = bannerHref(b.href, whatsapp);
          const externo = /^https?:/.test(href);
          const img = (
            <picture>
              {b.imgMovil && <source media="(max-width: 640px)" srcSet={b.imgMovil} />}
              <img src={b.img} alt={b.alt || ""} loading={k === 0 ? "eager" : "lazy"} />
            </picture>
          );
          return (
            <div className="hc-slide" key={k} aria-hidden={k !== i} role="group" aria-label={`${k + 1} de ${n}`}>
              {href
                ? <a href={href} tabIndex={k === i ? 0 : -1} {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{img}</a>
                : img}
            </div>
          );
        })}
      </div>
      {n > 1 && (
        <>
          <button className="hc-nav prev" onClick={() => ir(i - 1)} aria-label="Anterior">‹</button>
          <button className="hc-nav next" onClick={() => ir(i + 1)} aria-label="Siguiente">›</button>
          <div className="hc-dots">
            {banners.map((_, k) => (
              <button key={k} className={k === i ? "on" : ""} onClick={() => ir(k)} aria-label={`Ir a la imagen ${k + 1}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
