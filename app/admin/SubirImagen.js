"use client";

import { useRef, useState } from "react";

import { useAdmin } from "./AdminShell";

// Subida de una imagen a Cloudinary desde el panel (HU-13): revisa formato, peso y tamaño en el
// navegador, pide una firma al servidor y sube el archivo directo a Cloudinary. Al terminar
// entrega la URL con onSubida(url).

export const REGLAS = {
  banner: {
    destino: "banner", formatos: ["image/jpeg", "image/png", "image/webp"], maxMB: 2, proporcion: 1600 / 500, minAncho: 1200,
    ayuda: "1600×500 px (proporción 16:5) · JPG, PNG o WebP · hasta 2 MB",
  },
  bannerMovil: {
    destino: "banner-movil", formatos: ["image/jpeg", "image/png", "image/webp"], maxMB: 2, proporcion: 1, minAncho: 600,
    ayuda: "800×800 px (cuadrada) · opcional: sin ella el celular usa la de escritorio",
  },
  categoria: {
    destino: "categoria", formatos: ["image/jpeg", "image/png", "image/webp"], maxMB: 2, minAncho: 400,
    ayuda: "Cuadrada de 600×600 px o más · si no es cuadrada se recorta centrada",
  },
  producto: {
    destino: "producto", formatos: ["image/jpeg", "image/png", "image/webp"], maxMB: 2, minAncho: 600,
    ayuda: "JPG, PNG o WebP · al menos 600 px de ancho · hasta 2 MB cada una",
  },
  logo: {
    destino: "logo", formatos: ["image/png", "image/svg+xml", "image/webp", "image/jpeg"], maxMB: 1,
    ayuda: "PNG o SVG con fondo transparente · hasta 1 MB",
  },
};

const EXT = { "image/jpeg": "JPG", "image/png": "PNG", "image/webp": "WebP", "image/svg+xml": "SVG" };

function medir(file) {
  return new Promise((ok, mal) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { ok({ ancho: img.naturalWidth, alto: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { mal(new Error("No se pudo leer la imagen. ¿Está dañada?")); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

// Devuelve el problema de la imagen en palabras, o "".
async function revisar(file, r) {
  if (!r.formatos.includes(file.type)) return `Formato no aceptado. Usa ${r.formatos.map((f) => EXT[f]).join(", ")}.`;
  if (file.size > r.maxMB * 1024 * 1024) return `La imagen pesa ${(file.size / 1048576).toFixed(1)} MB; el máximo es ${r.maxMB} MB.`;
  if (file.type === "image/svg+xml") return "";
  const { ancho, alto } = await medir(file);
  if (r.minAncho && ancho < r.minAncho) return `La imagen mide ${ancho}×${alto} px; debe tener al menos ${r.minAncho} px de ancho.`;
  if (r.proporcion && Math.abs(ancho / alto - r.proporcion) / r.proporcion > 0.06) {
    const esperado = r.proporcion === 1 ? "cuadrada" : "de 1600×500 px (16:5)";
    return `La imagen mide ${ancho}×${alto} px y debe ser ${esperado}. Recórtala antes de subirla.`;
  }
  return "";
}

// Borra de Cloudinary subidas que no se llegaron a guardar. El servidor no borra nada que esté en uso.
export async function descartarSubidas(token, urls) {
  const lista = [...new Set(urls.filter(Boolean))];
  if (!lista.length) return;
  try {
    await fetch("/api/admin/cloudinary", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify({ op: "borrar", urls: lista }),
    });
  } catch {
    // Si falla, la imagen queda sin uso en Cloudinary; no afecta a la web.
  }
}

export default function SubirImagen({ reglas, onSubida, onSubiendo, texto = "Subir imagen", disabled, id, codigo, multiple = false }) {
  const { token, logout } = useAdmin();
  const input = useRef(null);
  const [estado, setEstado] = useState({ subiendo: false, error: "" });

  // Sube una sola imagen y devuelve su URL.
  async function subirUna(file) {
    const problema = await revisar(file, reglas);
    if (problema) throw new Error(`${file.name}: ${problema}`);
    const res = await fetch("/api/admin/cloudinary", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify({ destino: reglas.destino, codigo }),
    });
    if (res.status === 401) { logout(); throw new Error("Sesión expirada: vuelve a entrar."); }
    const f = await res.json();
    if (f.error) throw new Error(f.error);
    const datos = new FormData();
    datos.append("file", file);
    for (const k of ["api_key", "timestamp", "signature", "folder", "allowed_formats"]) datos.append(k, f[k]);
    const sub = await fetch(`https://api.cloudinary.com/v1_1/${f.cloud_name}/image/upload`, { method: "POST", body: datos });
    const r = await sub.json();
    if (!sub.ok || !r.secure_url) throw new Error("Cloudinary no aceptó la imagen: " + (r.error?.message || sub.status));
    return r.secure_url;
  }

  // Sube una o varias; cada foto buena se entrega apenas termina y los errores se suman.
  async function subir(archivos) {
    if (!archivos.length) return;
    setEstado({ subiendo: true, error: "" });
    onSubiendo?.(true);
    const errores = [];
    for (const file of archivos) {
      try {
        onSubida(await subirUna(file));
      } catch (e) {
        errores.push(String(e?.message || e));
      }
    }
    setEstado({ subiendo: false, error: errores.join(" ") });
    onSubiendo?.(false);
  }

  return (
    <div className="si">
      <button type="button" className="btn-ghost si-btn" onClick={() => input.current?.click()} disabled={disabled || estado.subiendo}>
        <svg className="adm-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
        {estado.subiendo ? "Subiendo…" : texto}
      </button>
      <input
        ref={input}
        id={id}
        type="file"
        accept={reglas.formatos.join(",")}
        multiple={multiple}
        hidden
        onChange={(e) => { const archivos = [...(e.target.files || [])]; e.target.value = ""; subir(archivos); }}
      />
      <small className="ct-hint">{reglas.ayuda}</small>
      {estado.error && <div className="form-error" role="alert">{estado.error}</div>}
    </div>
  );
}
