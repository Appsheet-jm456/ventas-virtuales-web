"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Métricas de la web pública (HU-11): cuenta cada página vista y cada clic en un enlace de
// WhatsApp. Sin cookies ni identificadores. Si el enlace lleva data-producto, el clic se asocia a
// ese código para el ranking de «Más consultados».
function registrar(datos) {
  try {
    fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
      keepalive: true, // sigue aunque el clic abra WhatsApp y la página se vaya
    }).catch(() => {});
  } catch {
    // Nunca afecta al visitante.
  }
}

// La misma página registrada dos veces seguidas (doble montaje de React, recarga instantánea)
// cuenta una sola visita.
const ultima = { ruta: "", t: 0 };

export default function Medidor() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const ahora = Date.now();
    if (pathname === ultima.ruta && ahora - ultima.t < 2000) return;
    ultima.ruta = pathname;
    ultima.t = ahora;
    registrar({ tipo: "visita", ruta: pathname });
  }, [pathname]);

  useEffect(() => {
    function alClic(e) {
      const a = e.target.closest?.('a[href^="https://wa.me/"]');
      if (!a) return;
      registrar({ tipo: "whatsapp", ruta: window.location.pathname, producto: a.dataset.producto || "" });
    }
    document.addEventListener("click", alClic, true);
    return () => document.removeEventListener("click", alClic, true);
  }, []);

  return null;
}
