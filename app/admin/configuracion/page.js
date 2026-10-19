"use client";

import { useEffect, useMemo, useState } from "react";

import { useAdmin } from "../AdminShell";
import { supabaseNavegador } from "../../../lib/supabase-browser";
import { cld } from "../../../lib/cdn";
import SubirImagen, { REGLAS, descartarSubidas } from "../SubirImagen";

// Módulo Configuración del panel (HU-15): datos de la empresa, WhatsApp, redes, horario, reglas
// del catálogo y cambio de contraseña. Se guarda en la tabla `configuracion` de Supabase.

const SECCIONES = [
  ["cf-empresa", "Empresa"],
  ["cf-contacto", "Contacto y WhatsApp"],
  ["cf-redes", "Redes sociales"],
  ["cf-horario", "Horario"],
  ["cf-catalogo", "Catálogo"],
  ["cf-cuenta", "Cuenta"],
];

const EJEMPLO = { producto: "Lenovo ThinkPad T14 Gen 2", codigo: "100-101-1234" };

function Ico({ d }) {
  return <svg className="adm-i" viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;
}
const CHECK = <path d="M20 6L9 17l-5-5" />;

function Campo({ id, label, ayuda, children }) {
  return (
    <div className="field cf-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {ayuda && <small className="ct-hint">{ayuda}</small>}
    </div>
  );
}

function Interruptor({ id, titulo, texto, valor, onChange }) {
  return (
    <div className="cf-switch">
      <div>
        <b id={`${id}-t`}>{titulo}</b>
        <small>{texto}</small>
      </div>
      <button type="button" id={id} className="cf-tg" role="switch" aria-checked={valor} aria-labelledby={`${id}-t`} onClick={() => onChange(!valor)} />
    </div>
  );
}

export default function ConfiguracionPage() {
  const { token, logout } = useAdmin();
  const [guardado, setGuardado] = useState(null); // { empresa, catalogo } como está en la base
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [clave, setClave] = useState({ nueva: "", repetir: "", busy: false, ok: "", error: "" });
  const [logosSubidos, setLogosSubidos] = useState([]); // subidos y aún sin guardar
  const [subiendoLogo, setSubiendoLogo] = useState(false);

  useEffect(() => { cargar(); }, []);

  async function api(payload) {
    const res = await fetch("/api/admin/configuracion", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) { logout(); throw new Error("Sesión expirada: vuelve a entrar."); }
    const d = await res.json();
    if (d.error) throw new Error(d.error);
    return d;
  }

  async function cargar() {
    try {
      const d = await api({ op: "leer" });
      const v = { empresa: d.empresa, catalogo: d.catalogo };
      setGuardado(v);
      setForm(v);
    } catch (e) {
      setErrMsg(String(e?.message || e));
    }
  }

  const cambios = useMemo(() => form && guardado && JSON.stringify(form) !== JSON.stringify(guardado), [form, guardado]);

  // Avisa antes de salir de la página con cambios sin guardar.
  useEffect(() => {
    if (!cambios) return;
    const aviso = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [cambios]);

  const setE = (k) => (e) => setForm((s) => ({ ...s, empresa: { ...s.empresa, [k]: e.target.value } }));
  const setC = (k) => (v) => setForm((s) => ({ ...s, catalogo: { ...s.catalogo, [k]: v } }));

  async function guardar() {
    setBusy(true); setOkMsg(""); setErrMsg("");
    try {
      const d = await api({ op: "guardar", empresa: form.empresa, catalogo: form.catalogo });
      const v = { empresa: { ...form.empresa, ...d.empresa }, catalogo: d.catalogo };
      setGuardado(v);
      setForm(v);
      descartarSubidas(token, logosSubidos.filter((u) => u !== v.empresa.logo));
      setLogosSubidos([]);
      setOkMsg("Configuración guardada. La web la toma en menos de un minuto.");
    } catch (e) {
      setErrMsg(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function cambiarClave(e) {
    e.preventDefault();
    if (clave.nueva.length < 8) { setClave((c) => ({ ...c, error: "La contraseña debe tener al menos 8 caracteres.", ok: "" })); return; }
    if (clave.nueva !== clave.repetir) { setClave((c) => ({ ...c, error: "Las dos contraseñas no coinciden.", ok: "" })); return; }
    setClave((c) => ({ ...c, busy: true, error: "", ok: "" }));
    const { error } = await supabaseNavegador().auth.updateUser({ password: clave.nueva });
    if (error) {
      const msg = /different from the old/i.test(error.message) ? "La nueva contraseña debe ser distinta de la actual." : "No se pudo cambiar: " + error.message;
      setClave((c) => ({ ...c, busy: false, error: msg }));
    } else {
      setClave({ nueva: "", repetir: "", busy: false, error: "", ok: "Contraseña cambiada. Úsala la próxima vez que entres." });
    }
  }

  function ir(e, id) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!form) {
    return (
      <div className="pr">
        {errMsg ? <p className="pr-aviso bad" role="alert">{errMsg}</p> : <p className="pr-sub">Cargando la configuración…</p>}
      </div>
    );
  }

  const { empresa, catalogo } = form;
  const numero = String(empresa.whatsapp || "").replace(/[\s+().-]/g, "");
  const mensaje = String(empresa.mensaje_producto || "").replaceAll("{producto}", EJEMPLO.producto).replaceAll("{codigo}", EJEMPLO.codigo);

  return (
    <div className="cf">
      <nav className="cf-nav" aria-label="Secciones de configuración">
        {SECCIONES.map(([id, nombre]) => <a key={id} href={`#${id}`} onClick={(e) => ir(e, id)}>{nombre}</a>)}
      </nav>

      <div className="cf-stack">
        {okMsg && <p className="pr-aviso ok" role="status"><Ico d={CHECK} />{okMsg}</p>}
        {errMsg && <p className="pr-aviso bad" role="alert">{errMsg}</p>}

        <section className="pr-card" id="cf-empresa">
          <h2 className="pr-h">Empresa</h2>
          <p className="pr-sub">Aparece en el encabezado, el pie de página y el título de la web.</p>
          <div className="cf-grid">
            <Campo id="cf-nombre" label="Nombre comercial">
              <input id="cf-nombre" className="input" value={empresa.nombre} onChange={setE("nombre")} />
            </Campo>
            <Campo id="cf-ciudad" label="Ciudad">
              <input id="cf-ciudad" className="input" value={empresa.ciudad} onChange={setE("ciudad")} />
            </Campo>
          </div>
          <Campo id="cf-lema" label="Lema">
            <textarea id="cf-lema" className="input" rows={2} value={empresa.lema} onChange={setE("lema")} />
          </Campo>
          <div className="cf-logo">
            <img className="cf-logo-img" src={empresa.logo ? cld(empresa.logo, "f_auto,q_auto,h_120") : "/logo.png"} alt="Logo actual" />
            <div className="cf-logo-txt">
              <b>Logo</b>
              <small className="ct-hint">{empresa.logo ? "Logo subido desde el panel." : <>Se usa el archivo <span className="mono">public/logo.png</span>.</>} Se guarda con <b>Guardar cambios</b>.</small>
              <SubirImagen id="cf-logo-subir" reglas={REGLAS.logo} texto={empresa.logo ? "Cambiar logo" : "Subir logo"} onSubiendo={setSubiendoLogo}
                onSubida={(url) => { setLogosSubidos((l) => [...l, url]); setForm((s) => ({ ...s, empresa: { ...s.empresa, logo: url } })); }} />
              {empresa.logo && <button type="button" className="pr-link" onClick={() => setForm((s) => ({ ...s, empresa: { ...s.empresa, logo: "" } }))}>Volver al logo del archivo</button>}
            </div>
          </div>
        </section>

        <section className="pr-card" id="cf-contacto">
          <h2 className="pr-h">Contacto y WhatsApp</h2>
          <p className="pr-sub">El botón «Estoy interesado» abre WhatsApp con este número y este mensaje.</p>
          <Campo id="cf-direccion" label="Dirección del local">
            <textarea id="cf-direccion" className="input" rows={2} value={empresa.direccion} onChange={setE("direccion")} />
          </Campo>
          <div className="cf-grid">
            <Campo id="cf-wa" label="WhatsApp (con indicativo)" ayuda="Solo números, sin espacios. Ejemplo: 573175591252.">
              <input id="cf-wa" className="input mono" inputMode="numeric" value={empresa.whatsapp} onChange={setE("whatsapp")} />
            </Campo>
            <Campo id="cf-wa-ver" label="Cómo se muestra el número" ayuda="Así lo ve el cliente en la web. Ejemplo: 317 559 1252.">
              <input id="cf-wa-ver" className="input" value={empresa.whatsapp_visible} onChange={setE("whatsapp_visible")} />
            </Campo>
          </div>
          <Campo id="cf-msg" label="Mensaje al tocar «Estoy interesado»" ayuda="{producto} se cambia por el nombre del equipo y {codigo} por su código.">
            <textarea id="cf-msg" className="input" rows={2} value={empresa.mensaje_producto} onChange={setE("mensaje_producto")} />
          </Campo>
          <div className="cf-preview">
            <b>Vista previa</b>
            <span className="mono">wa.me/{numero || "…"}</span>
            <span>«{mensaje}»</span>
          </div>
        </section>

        <section className="pr-card" id="cf-redes">
          <h2 className="pr-h">Redes sociales</h2>
          <p className="pr-sub">Déjalo vacío para no mostrar el enlace en el pie de página.</p>
          <div className="cf-grid cf-grid3">
            <Campo id="cf-ig" label="Instagram"><input id="cf-ig" className="input" value={empresa.instagram} onChange={setE("instagram")} placeholder="https://www.instagram.com/…" /></Campo>
            <Campo id="cf-fb" label="Facebook"><input id="cf-fb" className="input" value={empresa.facebook} onChange={setE("facebook")} placeholder="https://www.facebook.com/…" /></Campo>
            <Campo id="cf-tt" label="TikTok"><input id="cf-tt" className="input" value={empresa.tiktok} onChange={setE("tiktok")} placeholder="https://www.tiktok.com/@…" /></Campo>
          </div>
        </section>

        <section className="pr-card" id="cf-horario">
          <h2 className="pr-h">Horario de atención</h2>
          <p className="pr-sub">Se muestra en el pie de página. Vacío = no se muestra.</p>
          <Campo id="cf-hor" label="Horario">
            <input id="cf-hor" className="input" value={empresa.horario} onChange={setE("horario")} placeholder="Lunes a sábado, 9:00 a.m. a 6:00 p.m." />
          </Campo>
        </section>

        <section className="pr-card" id="cf-catalogo">
          <h2 className="pr-h">Catálogo</h2>
          <p className="pr-sub">Reglas de cómo ve el inventario el cliente.</p>
          <Interruptor id="cf-agotados" titulo="Mostrar productos agotados" texto="Se ven con la cinta «Agotado» y sin botón de compra. Apagado: desaparecen de la web hasta que tengan stock."
            valor={catalogo.mostrar_agotados} onChange={setC("mostrar_agotados")} />
          <Interruptor id="cf-precios" titulo="Mostrar precios" texto="Apagado: los productos dicen «Precio: consultar» y el cliente pregunta por WhatsApp."
            valor={catalogo.mostrar_precios} onChange={setC("mostrar_precios")} />
        </section>

        <div className="cf-savebar">
          <span className={cambios ? "cf-dirty" : "pr-sub"}>{cambios ? "Hay cambios sin guardar" : "Sin cambios por guardar"}</span>
          <div className="cf-acciones">
            <button type="button" className="btn-ghost" onClick={() => { descartarSubidas(token, logosSubidos); setLogosSubidos([]); setForm(guardado); setOkMsg(""); setErrMsg(""); }} disabled={!cambios || busy}>Descartar</button>
            <button type="button" className="btn pr-btn" onClick={guardar} disabled={!cambios || busy || subiendoLogo}><Ico d={CHECK} />{busy ? "Guardando…" : subiendoLogo ? "Esperando el logo…" : "Guardar cambios"}</button>
          </div>
        </div>

        <section className="pr-card" id="cf-cuenta">
          <h2 className="pr-h">Cuenta</h2>
          <p className="pr-sub">Cambia la contraseña con la que entras al panel. Se guarda aparte de la configuración.</p>
          <form className="cf-grid" onSubmit={cambiarClave}>
            <Campo id="cf-clave" label="Contraseña nueva" ayuda="Mínimo 8 caracteres.">
              <input id="cf-clave" className="input" type="password" autoComplete="new-password" value={clave.nueva}
                onChange={(e) => setClave((c) => ({ ...c, nueva: e.target.value, error: "", ok: "" }))} />
            </Campo>
            <Campo id="cf-clave2" label="Repite la contraseña">
              <input id="cf-clave2" className="input" type="password" autoComplete="new-password" value={clave.repetir}
                onChange={(e) => setClave((c) => ({ ...c, repetir: e.target.value, error: "", ok: "" }))} />
            </Campo>
            <div className="ct-full">
              <button type="submit" className="btn-ghost" disabled={clave.busy || !clave.nueva}>{clave.busy ? "Cambiando…" : "Cambiar contraseña"}</button>
              {clave.error && <div className="form-error">{clave.error}</div>}
              {clave.ok && <p className="pr-aviso ok" role="status" style={{ marginTop: 10 }}><Ico d={CHECK} />{clave.ok}</p>}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
