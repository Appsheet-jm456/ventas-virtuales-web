"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAdmin } from "../AdminShell";
import { descartarSubidas } from "../SubirImagen";
import FotosProducto, { listaDe } from "./FotosProducto";
import { FIELDS, HIDDEN_VALUES, CLAVE_AVISO } from "./campos";

// Formulario de producto en página completa (HU-18), para crear y para editar. Secciones en dos
// columnas: datos, especificaciones y fotos a la izquierda; estado, precio y stock a la derecha.
// Las fotos subidas y no guardadas se borran de Cloudinary al salir (HU-17).

const CAMPO = Object.fromEntries(FIELDS.map((c) => [c.key, c]));
const GENERAL = ["Código", "Categoría", "Descripción", "Marca", "Modelo"];
const SPECS = ["Procesador", "Generación", "RAM", "Almacenamiento", "Estado"];

const stockDe = (fields) => parseInt(fields["Stock"] || "0", 10) || 0;
const pesos = (v) => {
  const n = Number(String(v || "").replace(/\D/g, ""));
  return n > 0 ? `$${n.toLocaleString("es-CO")}` : "";
};

export default function ProductoForm({ inicial, id }) {
  const { token, logout } = useAdmin();
  const router = useRouter();
  const [fields, setFields] = useState(inicial);
  const [busy, setBusy] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const subidasRef = useRef([]);
  const guardadoRef = useRef(false);
  const fotosOriginales = useRef(listaDe(inicial.Foto));

  const cambios = JSON.stringify(fields) !== JSON.stringify(inicial);
  const set = (k, v) => setFields((s) => ({ ...s, [k]: v }));
  const disponible = stockDe(fields) > 0;
  const oculto = HIDDEN_VALUES.includes((fields["Oculto"] || "").toLowerCase());
  const nombre = [fields["Marca"], fields["Modelo"]].filter(Boolean).join(" ") || (id ? "Producto sin nombre" : "Nuevo producto");

  // El navegador avisa si se cierra o recarga la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!cambios) return;
    const avisar = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [cambios]);

  // Al salir sin guardar (Cancelar, el panel lateral o «Atrás») se borran las fotos subidas.
  useEffect(() => () => {
    if (!guardadoRef.current) descartarSubidas(token, subidasRef.current);
  }, []);

  function salir() {
    if (cambios && !window.confirm("Tienes cambios sin guardar. ¿Salir sin guardar?")) return;
    router.push("/admin/productos");
  }

  async function guardar() {
    setError("");
    if (!fields["Código"].trim()) { setError("El Código es obligatorio."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
        body: JSON.stringify(id ? { op: "update", id, fields } : { op: "create", fields }),
      });
      if (res.status === 401) { logout(); return; }
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      // Lo que ya no se usa: fotos nuevas que se quitaron y fotos guardadas que se quitaron.
      guardadoRef.current = true;
      descartarSubidas(token, [...subidasRef.current, ...fotosOriginales.current]);
      try { sessionStorage.setItem(CLAVE_AVISO, d.mensaje || "Guardado."); } catch {}
      router.push("/admin/productos");
    } catch (e) {
      setError(String(e?.message || e));
      setBusy(false);
    }
  }

  function campo(k) {
    const c = CAMPO[k];
    const props = {
      id: `campo-${k}`,
      className: "input",
      value: fields[k],
      placeholder: c.ph,
      onChange: (e) => set(k, e.target.value),
    };
    return (
      <div key={k} className={`field${c.full ? " full" : ""}`}>
        <label htmlFor={props.id}>{c.label}</label>
        {c.area ? <textarea rows={2} {...props} /> : <input inputMode={c.num ? "numeric" : undefined} {...props} />}
      </div>
    );
  }

  return (
    <div className="pf">
      <div className="pf-head">
        <button type="button" className="pf-volver" onClick={salir}>← Productos</button>
        <div className="pf-titulo">
          <h2>{nombre}</h2>
          {fields["Código"] && <span className="pf-codigo">{fields["Código"]}</span>}
          {id && <span className={`badge ${oculto ? "off" : "ok"}`}>{oculto ? "Oculto" : "En la web"}</span>}
          {id && <span className={`badge ${disponible ? "ok" : "bad"}`}>{disponible ? "Disponible" : "Agotado"}</span>}
        </div>
      </div>

      <div className="pf-grid">
        <div className="pf-col">
          <section className="pr-card pf-sec">
            <h3>Información general</h3>
            <div className="form-grid">{GENERAL.map(campo)}</div>
          </section>
          <section className="pr-card pf-sec">
            <h3>Especificaciones</h3>
            <div className="form-grid">{SPECS.map(campo)}</div>
          </section>
          <section className="pr-card pf-sec">
            <h3>Fotos y video</h3>
            <div className="field full">
              <label htmlFor="campo-Foto-subir">{CAMPO.Foto.label}</label>
              <FotosProducto
                value={fields.Foto}
                codigo={fields["Código"]}
                disabled={busy}
                onSubiendo={setSubiendo}
                onSubida={(u) => { subidasRef.current = [...subidasRef.current, u]; }}
                onChange={(v) => set("Foto", v)}
              />
            </div>
            {campo("Video")}
          </section>
        </div>

        <aside className="pf-lado">
          <section className="pr-card pf-sec">
            <h3>Estado en la tienda</h3>
            <div className="seg pf-seg">
              <button type="button" className={`seg-btn${disponible ? " active-ok" : ""}`} onClick={() => set("Stock", disponible ? fields["Stock"] : "1")}>
                Disponible
              </button>
              <button type="button" className={`seg-btn${!disponible ? " active-bad" : ""}`} onClick={() => set("Stock", "0")}>
                Agotado / Vendido
              </button>
            </div>
            <label className="ep-check">
              <input type="checkbox" checked={oculto} onChange={(e) => set("Oculto", e.target.checked ? "Sí" : "")} />
              <span>Ocultar de la web</span>
            </label>
            <p className="ep-hint">
              <b>Agotado/Vendido:</b> sigue visible con la cinta «Equipo agotado».{" "}
              <b>Ocultar:</b> desaparece del catálogo, pero se conserva en la base.
            </p>
          </section>
          <section className="pr-card pf-sec">
            <h3>Precio e inventario</h3>
            <div className="field">
              <label htmlFor="campo-Precio">Precio</label>
              <div className="pf-precio">
                <span aria-hidden="true">$</span>
                <input id="campo-Precio" className="input" inputMode="numeric" value={fields["Precio"]} placeholder={CAMPO.Precio.ph} onChange={(e) => set("Precio", e.target.value)} />
              </div>
              {pesos(fields["Precio"]) && <small className="ct-hint">Se verá como {pesos(fields["Precio"])}</small>}
            </div>
            {campo("Stock")}
          </section>
        </aside>
      </div>

      <div className="pf-barra">
        <span className="pf-estado">{subiendo ? "Subiendo fotos…" : cambios ? "Cambios sin guardar" : "Sin cambios"}</span>
        {error && <span className="form-error pf-error" role="alert">{error}</span>}
        <button type="button" className="btn-ghost" onClick={salir} disabled={busy}>Cancelar</button>
        <button type="button" className="btn" onClick={guardar} disabled={busy || subiendo || (id && !cambios)}>
          {busy ? "Guardando…" : id ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </div>
  );
}
