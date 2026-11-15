"use client";

import { useState, useEffect, useCallback } from "react";

// Galería de medios del producto (adaptada de InventarIA): foto principal +
// miniaturas; el video sale como miniatura con ▶ a la derecha de las fotos.
// Clic en foto → visor a pantalla completa con flechas. Clic en video → se
// reproduce grande y proporcional (16:9).

function VideoPlayer({ video }) {
  if (video.kind === "iframe") {
    return (
      <div className={`pv-frame${video.vertical ? " pv-vertical" : ""}`}>
        <iframe
          src={video.src}
          title={video.red === "tiktok" ? "Video de TikTok del producto" : "Video del producto"}
          loading="lazy"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return <video className="pv-native" src={video.src} controls preload="metadata" playsInline />;
}

// Botón «📷 Fotos» (HU-36, más pequeño por pedido del dueño): cuadro del tamaño de una miniatura
// que abre en una pestaña nueva la carpeta de Drive con las fotos reales.
function MasFotos({ url }) {
  return (
    <a className="pp-mas-fotos" href={url} target="_blank" rel="noopener noreferrer" title="Fotos reales del equipo en Google Drive"
      aria-label="Más fotos: fotos reales del equipo en Google Drive (se abre en una pestaña nueva)">
      <span className="pp-mas-ico" aria-hidden="true">📷</span>
      <span className="pp-mas-txt">Fotos</span>
      <span className="pp-mas-flecha" aria-hidden="true">↗</span>
    </a>
  );
}

export default function Gallery({ images = [], videos = [], alt = "", sold = false, masFotos = "" }) {
  const [broken, setBroken] = useState(() => new Set());
  const [current, setCurrent] = useState(0);
  // light = null | { type: "image" } | { type: "video", index }
  const [light, setLight] = useState(null);

  const valid = (images || []).filter((u) => u && !broken.has(u));
  const vids = (videos || []).filter((v) => v && v.src);

  useEffect(() => { setCurrent(0); }, [images]);
  useEffect(() => {
    if (current > valid.length - 1) setCurrent(Math.max(0, valid.length - 1));
  }, [valid.length, current]);

  const markBroken = (u) =>
    setBroken((s) => { const n = new Set(s); n.add(u); return n; });

  const go = useCallback((delta) => {
    setCurrent((c) => {
      const n = valid.length;
      if (!n) return 0;
      return (c + delta + n) % n;
    });
  }, [valid.length]);

  useEffect(() => {
    if (!light) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLight(null);
      else if (light.type === "image" && e.key === "ArrowRight") go(1);
      else if (light.type === "image" && e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [light, go]);

  if (valid.length === 0 && vids.length === 0) {
    return (
      <div className="pp-empty">
        {sold && <span className="pp-ribbon">Equipo agotado</span>}
        📷 Pronto tendremos fotos de este producto.<br />{masFotos ? "Mientras tanto, mira las fotos reales:" : "Pídelas por WhatsApp."}
        {masFotos && <div className="pp-empty-mas"><MasFotos url={masFotos} /></div>}
      </div>
    );
  }

  const idx = Math.min(current, Math.max(0, valid.length - 1));
  const mainUrl = valid[idx];
  const showThumbs = valid.length + vids.length > 1 || Boolean(masFotos);

  return (
    <div className={`pp${sold ? " sold" : ""}`}>
      {mainUrl ? (
        <button className="pp-main" onClick={() => setLight({ type: "image" })} title="Ampliar foto" type="button">
          {sold && <span className="pp-ribbon">Equipo agotado</span>}
          <img src={mainUrl} alt={alt} loading="lazy" onError={() => markBroken(mainUrl)} />
          <span className="pp-zoom">⤢</span>
        </button>
      ) : (
        // Solo hay video: muéstralo directo.
        <div className="pp-video-only">
          {sold && <span className="pp-ribbon">Equipo agotado</span>}
          {vids[0].red === "tiktok"
            ? (
              <button type="button" className="pp-tiktok-portada" onClick={() => setLight({ type: "video", index: 0 })} aria-label="Ver video de TikTok">
                {vids[0].thumb && <img src={vids[0].thumb} alt="" loading="lazy" />}
                <span className="pp-play">▶</span>
                <span className="pp-vid-marca">TikTok</span>
              </button>
            )
            : <VideoPlayer video={vids[0]} />}
        </div>
      )}

      {showThumbs && (
        <div className="pp-thumbs">
          {valid.map((u, i) => (
            <button
              key={u}
              type="button"
              className={`pp-thumb${i === idx ? " active" : ""}`}
              onMouseEnter={() => setCurrent(i)}
              onClick={() => setCurrent(i)}
              aria-label={`Ver foto ${i + 1}`}
            >
              <img src={u} alt="" loading="lazy" onError={() => markBroken(u)} />
            </button>
          ))}
          {mainUrl && vids.map((v, i) => (
            <button
              key={v.src}
              type="button"
              className="pp-thumb pp-thumb-vid"
              onClick={() => setLight({ type: "video", index: i })}
              aria-label={v.red === "tiktok" ? `Ver video ${i + 1} de TikTok` : `Ver video ${i + 1}`}
            >
              {v.thumb
                ? <img src={v.thumb} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                : <span className={`pp-vid-bg${v.red === "tiktok" ? " pp-vid-tiktok" : ""}`} />}
              <span className="pp-play">▶</span>
              {v.red === "tiktok" && <span className="pp-vid-marca" aria-hidden="true">TikTok</span>}
            </button>
          ))}
          {masFotos && <MasFotos url={masFotos} />}
        </div>
      )}

      {/* Visor de imágenes */}
      {light?.type === "image" && mainUrl && (
        <div className="pp-light" onClick={() => setLight(null)}>
          <button className="pp-close" type="button" onClick={() => setLight(null)} aria-label="Cerrar">✕</button>
          {valid.length > 1 && (
            <button className="pp-nav prev" type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Anterior">‹</button>
          )}
          <img
            className="pp-light-img"
            src={valid[Math.min(current, valid.length - 1)]}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            onError={() => markBroken(valid[Math.min(current, valid.length - 1)])}
          />
          {valid.length > 1 && (
            <button className="pp-nav next" type="button" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Siguiente">›</button>
          )}
          {valid.length > 1 && <div className="pp-counter">{idx + 1} / {valid.length}</div>}
        </div>
      )}

      {/* Visor de video */}
      {light?.type === "video" && vids[light.index] && (
        <div className="pp-light" onClick={() => setLight(null)}>
          <button className="pp-close" type="button" onClick={() => setLight(null)} aria-label="Cerrar">✕</button>
          <div className={`pp-video-wrap${vids[light.index].vertical ? " vertical" : ""}`} onClick={(e) => e.stopPropagation()}>
            <VideoPlayer video={vids[light.index]} />
          </div>
        </div>
      )}
    </div>
  );
}
