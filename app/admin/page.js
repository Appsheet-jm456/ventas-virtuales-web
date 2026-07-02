"use client";

import { useEffect, useMemo, useState } from "react";

// Panel de administración del catálogo: crear, editar y eliminar productos
// directamente en Baserow. Protegido con ADMIN_PASSWORD (se valida en el
// servidor en cada operación; aquí solo se guarda para la sesión).

const f = (r, k) => (r?.[k] ?? "").toString().trim();

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

const EMPTY = Object.fromEntries(FIELDS.map((c) => [c.key, ""]));

function norm(s) {
  return (s ?? "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [gateError, setGateError] = useState("");

  const [rows, setRows] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  // Modal de edición/creación. editing = { id|null, fields }
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("vvc-admin-pw");
    if (saved) { setPw(saved); setAuthed(true); }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const d = await res.json();
      setRows(Array.isArray(d.rows) ? d.rows : []);
      setDemo(!!d.demo);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  // Valida la clave haciendo una operación inocua (update sin campos a id 0
  // devolvería error de id; usamos una op inexistente que solo pasa el auth).
  async function enter(e) {
    e?.preventDefault();
    setGateError("");
    if (!pw.trim()) { setGateError("Escribe la clave."); return; }
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ op: "ping" }),
    });
    if (res.status === 401) { setGateError("Clave incorrecta."); return; }
    if (res.status === 500) {
      const d = await res.json().catch(() => ({}));
      setGateError(d.error || "El panel no está configurado en el servidor.");
      return;
    }
    sessionStorage.setItem("vvc-admin-pw", pw);
    setAuthed(true);
  }

  function logout() {
    sessionStorage.removeItem("vvc-admin-pw");
    setAuthed(false); setPw("");
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
    setEditing({ id: r._id, fields });
  }

  async function callAdmin(payload) {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) { logout(); throw new Error("Sesión expirada: vuelve a entrar."); }
    const d = await res.json();
    if (d.error) throw new Error(d.error);
    return d;
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

  // ---------- Pantalla de acceso ----------
  if (!authed) {
    return (
      <main className="admin wrap">
        <form className="admin-gate" onSubmit={enter}>
          <h1>Panel de administración</h1>
          <p>Catálogo de Ventas Virtual Colombia. Ingresa la clave de administración.</p>
          <input
            className="input"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Clave de administración"
            autoFocus
          />
          <button className="btn full" type="submit">Entrar</button>
          {gateError && <div className="form-error">{gateError}</div>}
        </form>
      </main>
    );
  }

  // ---------- Panel ----------
  return (
    <main className="admin wrap">
      <div className="admin-head">
        <h1>Administrar catálogo</h1>
        <div className="admin-tools">
          <input
            className="input"
            style={{ width: 260 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar código, marca, modelo…"
          />
          <button className="btn" onClick={openNew}>➕ Nuevo producto</button>
          <button className="btn-ghost" onClick={load} disabled={loading}>{loading ? "Cargando…" : "Recargar"}</button>
          <button className="btn-ghost" onClick={logout}>Salir</button>
        </div>
      </div>

      {demo && <div className="demo-note">Modo demo: Baserow no está configurado; los cambios no se guardarán.</div>}
      {okMsg && <p className="form-ok">✅ {okMsg}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Código</th><th>Categoría</th><th>Marca</th><th>Modelo</th>
              <th>Precio</th><th>Stock</th><th>Fotos</th><th>Video</th><th></th>
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
                    {parseInt(f(r, "Stock") || "0", 10) > 0
                      ? f(r, "Stock")
                      : <span className="badge bad">Agotado</span>}
                  </td>
                  <td>{nFotos ? `📷 ${nFotos}` : "—"}</td>
                  <td>{f(r, "Video") ? "🎬" : "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-btn" onClick={() => openEdit(r)}>Editar</button>
                      <button className="mini-btn danger" onClick={() => remove(r)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--muted)", padding: 26 }}>
                {loading ? "Cargando…" : "Sin productos."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal crear/editar */}
      {editing && (
        <div className="modal-overlay" onClick={() => !busy && setEditing(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editing.id ? `Editar ${editing.fields["Código"] || "producto"}` : "Nuevo producto"}</h2>
              <button className="close-btn" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="modal-body">
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
    </main>
  );
}
