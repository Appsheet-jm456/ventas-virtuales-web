"use client";

import { useState } from "react";

import { useAdmin } from "../AdminShell";
import { supabaseNavegador } from "../../../lib/supabase-browser";

// Mi cuenta (HU-34): cualquier usuario activo ve su rol y cambia su contraseña.
export default function CuentaPage() {
  const { acceso } = useAdmin();
  const [clave, setClave] = useState({ nueva: "", repetir: "", busy: false, ok: "", error: "" });

  async function cambiar(e) {
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

  return (
    <div className="pr">
      <section className="pr-card">
        <h2 className="pr-h">{acceso.nombre}</h2>
        <p className="pr-sub">{acceso.correo} · Rol: <b>{acceso.rol}</b></p>
      </section>
      <section className="pr-card">
        <h2 className="pr-h">Cambiar contraseña</h2>
        <form className="us-form" onSubmit={cambiar}>
          <label htmlFor="cu-clave">Contraseña nueva</label>
          <input id="cu-clave" className="input" type="password" autoComplete="new-password" value={clave.nueva}
            onChange={(e) => setClave((c) => ({ ...c, nueva: e.target.value, error: "", ok: "" }))} />
          <label htmlFor="cu-clave2">Repite la contraseña</label>
          <input id="cu-clave2" className="input" type="password" autoComplete="new-password" value={clave.repetir}
            onChange={(e) => setClave((c) => ({ ...c, repetir: e.target.value, error: "", ok: "" }))} />
          <div>
            <button type="submit" className="btn" disabled={clave.busy || !clave.nueva}>{clave.busy ? "Cambiando…" : "Cambiar contraseña"}</button>
          </div>
          {clave.error && <div className="form-error" role="alert">{clave.error}</div>}
          {clave.ok && <p className="pr-aviso ok" role="status">{clave.ok}</p>}
        </form>
      </section>
    </div>
  );
}
