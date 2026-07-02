"use client";

import { useState } from "react";
import { SITE } from "../../lib/site";

// Marca de la empresa. Muestra el logo (SITE.logo) como imagen y, si el
// archivo no existe todavía, cae automáticamente a la marca de texto "VV"
// para que nunca aparezca una imagen rota.
export default function Brand({ variant = "header" }) {
  const [failed, setFailed] = useState(false);
  const showLogo = SITE.logo && !failed;

  if (variant === "footer") {
    if (showLogo) {
      return (
        <span className="footer-logo">
          <img src={SITE.logo} alt={SITE.nombre} onError={() => setFailed(true)} />
        </span>
      );
    }
    return <div className="f-title">{SITE.nombre}</div>;
  }

  // variant "header"
  if (showLogo) {
    return (
      <img
        className="brand-logo"
        src={SITE.logo}
        alt={SITE.nombre}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <>
      <span className="brand-mark">VV</span>
      <span className="brand-text">
        <b>Ventas Virtual</b> Colombia
        <small>{SITE.lema}</small>
      </span>
    </>
  );
}
