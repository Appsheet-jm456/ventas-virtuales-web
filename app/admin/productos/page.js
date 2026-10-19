"use client";

import { useEffect, useMemo, useState } from "react";

import { useAdmin } from "../AdminShell";

// Módulo Productos del panel (Supabase). El acceso y el panel lateral los pone AdminShell; cada
// petición lleva el token de la sesión y el servidor lo verifica.

const f = (r, k) => (r?.[k] ?? "").toString().trim();
const stockNum = (r) => parseInt(f(r, "Stock") || "0", 10) || 0;
// ¿Está oculto de la tienda web? (columna "Oculto" de Baserow)
const HIDDEN_VALUES = ["sí", "si", "true", "1", "x", "oculto", "yes", "y"];
const isHidden = (r) => HIDDEN_VALUES.includes((f(r, "Oculto") || "").toLowerCase());

// Campos del formulario, en el mismo orden de la tabla de Baserow.
const FIELDS = [
  { key: "Código", label: "Código *", ph: "100-101-1234" },
  { key: "Categoría", label: "Categoría", ph: "Portátil usado" },
  { key: "Descripción", label: "Nombre producto (Descripción)", ph: "PORTATIL LENOVO THINKPAD…", full: true, area: true },
  { key: "Marca", label: "Marca", ph: "Lenovo" },
  { key: "Modelo", label: "Modelo", ph: "ThinkPad X1 Carbon Gen 9" },
  { key: "Procesador", label: "Procesador", ph: "Core i7 1185G7" },
  { key: "Generación", label: "Generación", ph: "11" },
  { key: "RAM", label: "RAM", ph: "16GB" },
  { key: "Almacenamiento", label: "Almacenamiento", ph: "512GB NVMe" },
  { key: "Estado", label: "Estado", ph: "Grado A" },
  { key: "Precio", label: "Precio", ph: "1800000", num: true },
  { key: "Stock", label: "Stock", ph: "1", num: true },
  { key: "Foto", label: "Foto(s) — URL (separadas por coma)", ph: "https://drive.google.com/file/d/…/view", full: true, area: true },
  { key: "Video", label: "Video — URL", ph: "https://drive.google.com/file/d/…/view", full: true, area: true },
];

const EMPTY = { ...Object.fromEntries(FIELDS.map((c) => [c.key, ""])), Oculto: "" };

function norm(s) {
  return (s ?? "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function ProductosPage() {
  const { token, logout } = useAdmin();

  const [rows, setRows] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  // Modal de edición/creación. editing = { id|null, fields }
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  // Carga CSV: { texto, nombre, vista } mientras hay una carga en curso.
  const [csv, setCsv] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${await token()}` },
      });
      const d = await res.json();
      setRows(Array.isArray(d.rows) ? d.rows : []);
      setDemo(!!d.demo);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const nq = norm(q);
    if (!nq) return rows;
    return rows.filter((r) =>
      norm([f(r, "Código"), f(r, "Marca"), f(r, "Modelo"), f(r, "Categoría"), f(r, "Descripción")].join(" ")).includes(nq)
    );
  }, [rows, q]);

  function openNew() {
    setFormError(""); setOkMsg("");
    setEditing({ id: null, fields: { ...EMPTY } });
  }
  function openEdit(r) {
    setFormError(""); setOkMsg("");
    const fields = {};
    for (const c of FIELDS) fields[c.key] = f(r, c.key);
    fields["Oculto"] = f(r, "Oculto");
    setEditing({ id: r._id, fields });
  }

  // Acción rápida desde la tabla: actualiza solo los campos indicados.
  async function quickUpdate(r, fields, okText) {
    setOkMsg("");
    try {
      const d = await callAdmin({ op: "update", id: r._id, fields });
      setOkMsg(okText || d.mensaje || "Actualizado.");
      await load();
    } catch (e) {
      window.alert(String(e?.message || e));
    }
  }

  // Cambia entre Disponible (Stock 1) y Agotado/Vendido (Stock 0).
  function toggleAgotado(r) {
    const nombre = [f(r, "Marca"), f(r, "Modelo")].filter(Boolean).join(" ") || f(r, "Código");
    if (stockNum(r) > 0) {
      quickUpdate(r, { Stock: 0 }, `"${nombre}" marcado como AGOTADO.`);
    } else {
      quickUpdate(r, { Stock: 1 }, `"${nombre}" vuelve a estar DISPONIBLE.`);
    }
  }

  // Quita de la tienda (oculto) o vuelve a publicar. No borra de Baserow.
  function toggleOculto(r) {
    const nombre = [f(r, "Marca"), f(r, "Modelo")].filter(Boolean).join(" ") || f(r, "Código");
    if (isHidden(r)) {
      quickUpdate(r, { Oculto: "" }, `"${nombre}" vuelve a la tienda.`);
    } else {
      quickUpdate(r, { Oculto: "Sí" }, `"${nombre}" quitado de la tienda (sigue en la base).`);
    }
  }

  async function callAdmin(payload, url = "/api/admin") {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) { logout(); throw new Error("Sesión expirada: vuelve a entrar."); }
    const d = await res.json();
    if (d.error) throw new Error(d.error);
    return d;
  }

  async function leerCsv(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setOkMsg("");
    const texto = await file.text();
    setCsv({ texto, nombre: file.name, vista: null, busy: true });
    try {
      const vista = await callAdmin({ op: "vista", csv: texto }, "/api/admin/csv");
      setCsv({ texto, nombre: file.name, vista, busy: false });
    } catch (err) {
      setCsv({ texto, nombre: file.name, vista: null, busy: false, error: String(err?.message || err) });
    }
  }

  async function aplicarCsv() {
    setCsv((c) => ({ ...c, busy: true }));
    try {
      const d = await callAdmin({ op: "aplicar", csv: csv.texto }, "/api/admin/csv");
      setOkMsg(d.mensaje || "Carga lista.");
      setCsv(null);
      await load();
    } catch (err) {
      setCsv((c) => ({ ...c, busy: false, error: String(err?.message || err) }));
    }
  }

  async function save() {
    if (!editing) return;
    setFormError("");
    if (!editing.fields["Código"].trim()) { setFormError("El Código es obligatorio."); return; }
    setBusy(true);
    try {
      const d = editing.id
        ? await callAdmin({ op: "update", id: editing.id, fields: editing.fields })
        : await callAdmin({ op: "create", fields: editing.fields });
      setOkMsg(d.mensaje || "Guardado.");
      setEditing(null);
      await load();
    } catch (e) {
      setFormError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(r) {
    const nombre = [f(r, "Marca"), f(r, "Modelo")].filter(Boolean).join(" ") || f(r, "Código");
    if (!window.confirm(`¿Eliminar "${nombre}" (${f(r, "Código")})?\n\nEsta acción NO se puede deshacer. Si solo se vendió, mejor edítalo y pon Stock 0 (saldrá "Agotado").`)) return;
    setOkMsg("");
    try {
      const d = await callAdmin({ op: "delete", id: r._id });
      setOkMsg(d.mensaje || "Eliminado.");
      await load();
    } catch (e) {
      setOkMsg("");
      window.alert(String(e?.message || e));
    }
  }

  return (
    <div>
      <div className="admin-head">
        <div className="admin-tools">
          <input
            className="input"
            style={{ width: 260 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar código, marca, modelo…"
          />
          <button className="btn" onClick={openNew}>➕ Nuevo producto</button>
          <label className="btn-ghost" style={{ cursor: "pointer" }}>
            📄 Cargar CSV
            <input type="file" accept=".csv,text/csv" onChange={leerCsv} style={{ display: "none" }} />
          </label>
          <button className="btn-ghost" onClick={load} disabled={loading}>{loading ? "Cargando…" : "Recargar"}</button>
        </div>
      </div>

      {demo && <div className="demo-note">Modo demo: Supabase no está configurado; los cambios no se guardarán.</div>}
      {okMsg && <p className="form-ok">✅ {okMsg}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Código</th><th>Categoría</th><th>Marca</th><th>Modelo</th>
              <th>Precio</th><th>Stock</th><th>Estado web</th><th>Fotos</th><th>Video</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const nFotos = f(r, "Foto") ? f(r, "Foto").split(/[\n,]+/).filter((s) => s.trim()).length : 0;
              return (
                <tr key={r._id}>
                  <td className="mono">{f(r, "Código")}</td>
                  <td>{f(r, "Categoría")}</td>
                  <td>{f(r, "Marca")}</td>
                  <td>{f(r, "Modelo")}</td>
                  <td className="num">{f(r, "Precio") ? `$${Number(f(r, "Precio")).toLocaleString("es-CO")}` : "—"}</td>
                  <td className="num">
                    {stockNum(r) > 0
                      ? f(r, "Stock")
                      : <span className="badge bad">Agotado</span>}
                  </td>
                  <td>
                    {isHidden(r)
                      ? <span className="badge off">Oculto</span>
                      : stockNum(r) > 0
                        ? <span className="badge ok">En línea</span>
                        : <span className="badge bad">Agotado</span>}
                  </td>
                  <td>{nFotos ? `📷 ${nFotos}` : "—"}</td>
                  <td>{f(r, "Video") ? "🎬" : "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-btn" onClick={() => toggleAgotado(r)} title="Cambia disponible/agotado">
                        {stockNum(r) > 0 ? "Agotar" : "Disponible"}
                      </button>
                      <button className="mini-btn" onClick={() => toggleOculto(r)} title="Quitar/mostrar en la tienda (no borra de la base)">
                        {isHidden(r) ? "Publicar" : "Quitar"}
                      </button>
                      <button className="mini-btn" onClick={() => openEdit(r)}>Editar</button>
                      <button className="mini-btn danger" onClick={() => remove(r)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: "center", color: "var(--muted)", padding: 26 }}>
                {loading ? "Cargando…" : "Sin productos."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal carga CSV: vista previa y confirmación */}
      {csv && (
        <div className="modal-overlay" onClick={() => !csv.busy && setCsv(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Cargar {csv.nombre}</h2>
              <button className="close-btn" onClick={() => setCsv(null)}>✕</button>
            </div>
            <div className="modal-body">
              {csv.busy && !csv.vista && <p>Revisando el archivo…</p>}
              {csv.error && <div className="form-error">{csv.error}</div>}
              {csv.vista && (
                <>
                  <p><b>{csv.vista.nuevos}</b> nuevos · <b>{csv.vista.modificados}</b> se modifican · <b>{csv.vista.errores.length}</b> con error (de {csv.vista.total} filas).</p>
                  <p className="ep-hint">Los productos que no vienen en el archivo no se tocan ni se borran.</p>
                  {csv.vista.errores.length > 0 && (
                    <ul className="ep-hint" style={{ maxHeight: 160, overflow: "auto" }}>
                      {csv.vista.errores.map((x, i) => <li key={i}>Fila {x.fila}{x.codigo ? ` (${x.codigo})` : ""}: {x.motivo}</li>)}
                    </ul>
                  )}
                </>
              )}
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => setCsv(null)} disabled={csv.busy}>Cancelar</button>
                <button className="btn" onClick={aplicarCsv} disabled={csv.busy || !csv.vista || csv.vista.nuevos + csv.vista.modificados === 0}>
                  {csv.busy ? "Trabajando…" : "Aplicar carga"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {editing && (
        <div className="modal-overlay" onClick={() => !busy && setEditing(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editing.id ? `Editar ${editing.fields["Código"] || "producto"}` : "Nuevo producto"}</h2>
              <button className="close-btn" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="estado-panel">
                <div className="ep-label">Estado en la tienda web</div>
                <div className="ep-row">
                  <div className="seg">
                    <button
                      type="button"
                      className={`seg-btn${(parseInt(editing.fields["Stock"] || "0", 10) || 0) > 0 ? " active-ok" : ""}`}
                      onClick={() => setEditing((s) => ({ ...s, fields: { ...s.fields, Stock: (parseInt(s.fields["Stock"] || "0", 10) || 0) > 0 ? s.fields["Stock"] : "1" } }))}
                    >
                      ✅ Disponible
                    </button>
                    <button
                      type="button"
                      className={`seg-btn${(parseInt(editing.fields["Stock"] || "0", 10) || 0) <= 0 ? " active-bad" : ""}`}
                      onClick={() => setEditing((s) => ({ ...s, fields: { ...s.fields, Stock: "0" } }))}
                    >
                      🚫 Agotado / Vendido
                    </button>
                  </div>
                  <label className="ep-check">
                    <input
                      type="checkbox"
                      checked={HIDDEN_VALUES.includes((editing.fields["Oculto"] || "").toLowerCase())}
                      onChange={(e) => setEditing((s) => ({ ...s, fields: { ...s.fields, Oculto: e.target.checked ? "Sí" : "" } }))}
                    />
                    <span>Quitar de la tienda (no se elimina de la base)</span>
                  </label>
                </div>
                <p className="ep-hint">
                  <b>Agotado/Vendido:</b> el equipo sigue visible con la cinta “Equipo agotado”.{" "}
                  <b>Quitar de la tienda:</b> desaparece del catálogo para los clientes, pero se conserva en la base.
                </p>
              </div>
              <div className="form-grid">
                {FIELDS.map((c) => (
                  <div key={c.key} className={`field${c.full ? " full" : ""}`}>
                    <label>{c.label}</label>
                    {c.area ? (
                      <textarea
                        className="input"
                        rows={2}
                        value={editing.fields[c.key]}
                        placeholder={c.ph}
                        onChange={(e) => setEditing((s) => ({ ...s, fields: { ...s.fields, [c.key]: e.target.value } }))}
                      />
                    ) : (
                      <input
                        className="input"
                        inputMode={c.num ? "numeric" : undefined}
                        value={editing.fields[c.key]}
                        placeholder={c.ph}
                        onChange={(e) => setEditing((s) => ({ ...s, fields: { ...s.fields, [c.key]: e.target.value } }))}
                      />
                    )}
                  </div>
                ))}
              </div>
              {formError && <div className="form-error">{formError}</div>}
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => setEditing(null)} disabled={busy}>Cancelar</button>
                <button className="btn" onClick={save} disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
