"use client";

import { useEffect, useState } from "react";

import { useAdmin } from "../../AdminShell";
import { MODULOS_PERMISO } from "../../../../lib/modulos";

// Usuarios y roles del panel (HU-34). Quien tiene el permiso Usuarios administra a las personas;
// solo el Superadmin ve la pestaña Roles y define qué puede cada rol.

const fecha = (iso) => (iso ? new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "Nunca");

function estadoDe(u) {
  if (!u.activo) return <span className="badge off">Desactivado</span>;
  if (!u.ultimo_acceso) return <span className="badge warn">Pendiente de activar</span>;
  return <span className="badge ok">Activo</span>;
}

// Enlace de activación: se copia y se envía por WhatsApp. No se guarda en ninguna parte.
function ModalEnlace({ datos, cerrar }) {
  const url = `${window.location.origin}/activar#t=${datos.enlace}`;
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      setCopiado(false);
      document.getElementById("us-enlace")?.select();
    }
  }
  const mensaje = `Hola ${datos.nombre}, este es tu enlace para entrar al panel de Ventas Virtual. Vence en 1 hora y solo sirve una vez: ${url}`;
  return (
    <div className="modal-overlay">
      <div className="modal-card pr-confirma" role="dialog" aria-modal="true" aria-labelledby="us-enlace-t">
        <div className="modal-head"><h2 id="us-enlace-t">Enlace de acceso de {datos.nombre}</h2></div>
        <div className="modal-body">
          <p>Envíaselo solo a esa persona. <b>Vence en 1 hora</b> y sirve una sola vez; con él crea su contraseña. Si vence, genera otro.</p>
          <input id="us-enlace" className="input mono" readOnly value={url} aria-label="Enlace de acceso" onFocus={(e) => e.target.select()} />
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={cerrar}>Cerrar</button>
            <a className="btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>
            <button type="button" className="btn" onClick={copiar} autoFocus>{copiado ? "¡Copiado!" : "Copiar enlace"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalUsuario({ inicial, roles, esYo, busy, error, guardar, cerrar }) {
  const nuevo = !inicial.id;
  const [f, setF] = useState({ nombre: inicial.nombre || "", correo: inicial.correo || "", rol_id: inicial.rol_id || "" });
  return (
    <div className="modal-overlay">
      <form className="modal-card pr-confirma" role="dialog" aria-modal="true" aria-labelledby="us-form-t"
        onSubmit={(e) => { e.preventDefault(); guardar(f); }}>
        <div className="modal-head"><h2 id="us-form-t">{nuevo ? "Agregar usuario" : `Editar a ${inicial.nombre}`}</h2></div>
        <div className="modal-body us-form">
          <label htmlFor="us-nombre">Nombre</label>
          <input id="us-nombre" className="input" maxLength={80} value={f.nombre} autoFocus onChange={(e) => setF((s) => ({ ...s, nombre: e.target.value }))} />
          <label htmlFor="us-correo">Correo</label>
          <input id="us-correo" className="input" type="email" value={f.correo} disabled={!nuevo} onChange={(e) => setF((s) => ({ ...s, correo: e.target.value }))} />
          <label htmlFor="us-rol">Rol</label>
          <select id="us-rol" className="input" value={f.rol_id} disabled={esYo} onChange={(e) => setF((s) => ({ ...s, rol_id: e.target.value }))}>
            <option value="">Elige un rol…</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          {esYo && <small className="ep-hint">No puedes cambiar tu propio rol.</small>}
          {!nuevo && inicial.historial?.length > 0 && (
            <details className="us-hist">
              <summary>Historial</summary>
              <ul>{[...inicial.historial].reverse().map((h, i) => <li key={i}>{fecha(h.fecha)} · {h.accion} · {h.por}</li>)}</ul>
            </details>
          )}
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={cerrar} disabled={busy}>Cancelar</button>
            <button type="submit" className="btn" disabled={busy}>{busy ? "Guardando…" : nuevo ? "Crear y generar enlace" : "Guardar"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function EditorRol({ rol, api, recargar, avisar }) {
  const [f, setF] = useState({ nombre: rol.nombre || "", descripcion: rol.descripcion || "", permisos: rol.permisos || {} });
  const [busy, setBusy] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const nuevo = !rol.id;

  function nivel(modulo, valor) {
    setF((s) => {
      const permisos = { ...s.permisos };
      if (valor) permisos[modulo] = valor; else delete permisos[modulo];
      return { ...s, permisos };
    });
  }
  async function ejecutar(payload) {
    setBusy(true);
    const r = await api("/api/admin/roles", payload);
    setBusy(false);
    if (r.error) { avisar("", r.error); return; }
    avisar(r.mensaje, "");
    await recargar();
  }

  if (rol.es_super) {
    return (
      <section className="pr-card">
        <h3 className="pr-h">{rol.nombre}</h3>
        <p className="pr-sub">{rol.descripcion} {rol.usuarios} usuario(s). Este rol no se puede cambiar.</p>
      </section>
    );
  }
  return (
    <section className="pr-card">
      <form className="us-form" onSubmit={(e) => { e.preventDefault(); ejecutar(nuevo ? { op: "crear", datos: f } : { op: "guardar", id: rol.id, datos: f }); }}>
        <div className="us-dos">
          <div>
            <label htmlFor={`rl-n-${rol.id || "nuevo"}`}>Nombre del rol</label>
            <input id={`rl-n-${rol.id || "nuevo"}`} className="input" maxLength={40} value={f.nombre} onChange={(e) => setF((s) => ({ ...s, nombre: e.target.value }))} />
          </div>
          <div>
            <label htmlFor={`rl-d-${rol.id || "nuevo"}`}>Descripción</label>
            <input id={`rl-d-${rol.id || "nuevo"}`} className="input" maxLength={200} value={f.descripcion} onChange={(e) => setF((s) => ({ ...s, descripcion: e.target.value }))} />
          </div>
        </div>
        <div className="admin-table-wrap pr-tabla">
          <table className="admin-table">
            <thead><tr><th>Módulo</th><th>Permiso</th></tr></thead>
            <tbody>
              {MODULOS_PERMISO.map((m) => (
                <tr key={m.id}>
                  <td>{m.nombre}</td>
                  <td>
                    <select className="input" aria-label={`Permiso de ${rol.nombre || "rol nuevo"} en ${m.nombre}`} value={f.permisos[m.id] || ""} onChange={(e) => nivel(m.id, e.target.value)}>
                      <option value="">Sin acceso</option>
                      <option value="ver">Ver</option>
                      {!m.soloVer && <option value="editar">Ver y editar</option>}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="us-acc">
          <button type="submit" className="btn" disabled={busy || !f.nombre.trim()}>{busy ? "Guardando…" : nuevo ? "Crear rol" : "Guardar rol"}</button>
          {!nuevo && (
            confirmar ? (
              <>
                <button type="button" className="btn-danger" disabled={busy} onClick={() => ejecutar({ op: "eliminar", id: rol.id })}>Sí, eliminar</button>
                <button type="button" className="btn-ghost" onClick={() => setConfirmar(false)}>Cancelar</button>
              </>
            ) : (
              <button type="button" className="btn-ghost" disabled={rol.usuarios > 0} title={rol.usuarios > 0 ? "Hay usuarios con este rol" : undefined} onClick={() => setConfirmar(true)}>Eliminar rol</button>
            )
          )}
          {!nuevo && <small className="ep-hint">{rol.usuarios} usuario(s) con este rol.</small>}
        </div>
      </form>
    </section>
  );
}

export default function UsuariosPage() {
  const { token, logout, puede } = useAdmin();
  const editar = puede("usuarios", "editar");
  const [tab, setTab] = useState("usuarios");
  const [d, setD] = useState(null);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(null); // usuario en edición o {} para uno nuevo
  const [errForm, setErrForm] = useState("");
  const [enlace, setEnlace] = useState(null); // { nombre, enlace }
  const [confirma, setConfirma] = useState(null); // { op, u, titulo, texto, boton }
  const [rolNuevo, setRolNuevo] = useState(false);

  async function api(url, payload) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) { logout(); return { error: "Sesión no válida." }; }
    return res.json();
  }
  const avisar = (ok, err) => { setOkMsg(ok); setErrMsg(err); };

  async function cargar() {
    const r = await api("/api/admin/usuarios", { op: "listar" });
    if (r.error) { setErrMsg(r.error); return; }
    setD(r);
    setRolNuevo(false);
  }
  useEffect(() => { cargar(); }, []);

  async function guardar(f) {
    setBusy(true); setErrForm("");
    const nuevo = !form.id;
    const r = await api("/api/admin/usuarios", nuevo ? { op: "crear", datos: f } : { op: "actualizar", id: form.id, datos: f });
    setBusy(false);
    if (r.error) { setErrForm(r.error); return; }
    avisar(r.mensaje, "");
    setForm(null);
    if (nuevo) setEnlace({ nombre: f.nombre.trim(), enlace: r.enlace });
    await cargar();
  }

  async function correr(op, u) {
    setBusy(true);
    const r = await api("/api/admin/usuarios", { op, id: u.id });
    setBusy(false);
    setConfirma(null);
    if (r.error) { avisar("", r.error); return; }
    avisar(r.mensaje || "", "");
    if (r.enlace) setEnlace({ nombre: u.nombre, enlace: r.enlace });
    await cargar();
  }

  if (!d) return <div className="pr">{errMsg ? <p className="pr-aviso bad" role="alert">{errMsg}</p> : <p className="pr-sub">Cargando…</p>}</div>;

  // Tocar a un Superadmin es solo de otro Superadmin.
  const tocable = (u) => editar && (!u.es_super || d.es_super);
  const asignables = d.roles.filter((r) => d.es_super || !r.es_super);

  return (
    <div className="pr">
      {d.es_super && (
        <div className="pr-tabs" role="tablist" aria-label="Usuarios y roles">
          <button type="button" role="tab" aria-selected={tab === "usuarios"} onClick={() => setTab("usuarios")}>Usuarios <span className="pr-n">{d.usuarios.length}</span></button>
          <button type="button" role="tab" aria-selected={tab === "roles"} onClick={() => setTab("roles")}>Roles y permisos <span className="pr-n">{d.roles.length}</span></button>
        </div>
      )}
      {okMsg && <p className="pr-aviso ok" role="status">{okMsg}</p>}
      {errMsg && <p className="pr-aviso bad" role="alert">{errMsg}</p>}

      {tab === "usuarios" && (
        <section className="pr-card">
          <div className="us-cab">
            <p className="pr-sub">Cada persona entra con su correo y tiene un rol. Para quitar el acceso, desactiva al usuario: conserva su historial.</p>
            {editar && <button type="button" className="btn pr-btn" onClick={() => { setErrForm(""); setForm({}); }}>Agregar usuario</button>}
          </div>
          <div className="admin-table-wrap pr-tabla">
            <table className="admin-table us-tabla">
              <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Último acceso</th>{editar && <th><span className="sr">Acciones</span></th>}</tr></thead>
              <tbody>
                {d.usuarios.map((u) => (
                  <tr key={u.id}>
                    <td><b>{u.nombre}</b>{u.id === d.yo && <small className="ep-hint"> (tú)</small>}</td>
                    <td className="us-correo">{u.correo}</td>
                    <td>{u.rol}</td>
                    <td>{estadoDe(u)}</td>
                    <td>{fecha(u.ultimo_acceso)}</td>
                    {editar && (
                      <td className="us-acc">
                        {tocable(u) && (
                          <>
                            <button type="button" className="btn-ghost us-sm" disabled={busy} onClick={() => { setErrForm(""); setForm(u); }}>Editar</button>
                            {u.activo && <button type="button" className="btn-ghost us-sm" disabled={busy} onClick={() => correr("enlace", u)}>Enlace de acceso</button>}
                            {u.id !== d.yo && (u.activo
                              ? <button type="button" className="btn-ghost us-sm" disabled={busy} onClick={() => setConfirma({ op: "desactivar", u, titulo: `¿Desactivar a ${u.nombre}?`, texto: "Pierde el acceso al instante. Puedes reactivarlo cuando quieras.", boton: "Desactivar" })}>Desactivar</button>
                              : <button type="button" className="btn-ghost us-sm" disabled={busy} onClick={() => correr("reactivar", u)}>Reactivar</button>)}
                            {u.id !== d.yo && !u.ultimo_acceso && (
                              <button type="button" className="btn-ghost us-sm" disabled={busy} onClick={() => setConfirma({ op: "eliminar", u, titulo: `¿Eliminar a ${u.nombre}?`, texto: "Nunca entró al panel. Su cuenta se borra por completo.", boton: "Eliminar" })}>Eliminar</button>
                            )}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "roles" && d.es_super && (
        <>
          <div className="us-cab">
            <p className="pr-sub">Define qué puede hacer cada rol. Los cambios rigen desde la siguiente acción de cada persona.</p>
            {!rolNuevo && <button type="button" className="btn pr-btn" onClick={() => setRolNuevo(true)}>Nuevo rol</button>}
          </div>
          {rolNuevo && <EditorRol key="nuevo" rol={{ permisos: {} }} api={api} recargar={cargar} avisar={avisar} />}
          {d.roles.map((r) => <EditorRol key={r.id + JSON.stringify(r.permisos) + r.nombre + r.usuarios} rol={r} api={api} recargar={cargar} avisar={avisar} />)}
        </>
      )}

      {form && (
        <ModalUsuario inicial={form} roles={form.es_super ? d.roles : asignables} esYo={form.id === d.yo} busy={busy} error={errForm}
          guardar={guardar} cerrar={() => setForm(null)} />
      )}
      {enlace && <ModalEnlace datos={enlace} cerrar={() => setEnlace(null)} />}
      {confirma && (
        <div className="modal-overlay">
          <div className="modal-card pr-confirma" role="alertdialog" aria-modal="true" aria-labelledby="us-conf-t">
            <div className="modal-head"><h2 id="us-conf-t">{confirma.titulo}</h2></div>
            <div className="modal-body">
              <p>{confirma.texto}</p>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setConfirma(null)} disabled={busy} autoFocus>Cancelar</button>
                <button type="button" className="btn-danger" onClick={() => correr(confirma.op, confirma.u)} disabled={busy}>{busy ? "Un momento…" : confirma.boton}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
