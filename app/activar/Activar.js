"use client";

import { useEffect, useState } from "react";

import { supabaseNavegador } from "../../lib/supabase-browser";

// El token viaja después del «#»: el navegador no lo envía al servidor ni lo deja en sus registros.
// Se usa solo al pulsar el botón, para que la vista previa de WhatsApp no gaste el enlace.
export default function Activar() {
  const [t, setT] = useState(null);
  const [verificado, setVerificado] = useState(false);
  const [clave, setClave] = useState({ nueva: "", repetir: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const valor = new URLSearchParams(window.location.hash.slice(1)).get("t") || "";
    setT(valor);
    if (valor) window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    if (clave.nueva.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (clave.nueva !== clave.repetir) { setError("Las dos contraseñas no coinciden."); return; }
    const sb = supabaseNavegador();
    if (!sb) { setError("El panel no está configurado en el servidor."); return; }
    setBusy(true);
    if (!verificado) {
      const { error: e1 } = await sb.auth.verifyOtp({ token_hash: t, type: "recovery" });
      if (e1) {
        setBusy(false);
        setError("Este enlace venció o ya se usó. Pide uno nuevo a quien administra el panel.");
        return;
      }
      setVerificado(true);
    }
    const { error: e2 } = await sb.auth.updateUser({ password: clave.nueva });
    if (e2) {
      setBusy(false);
      setError(/different from the old/i.test(e2.message) ? "La contraseña debe ser distinta de la anterior." : "No se pudo guardar: " + e2.message);
      return;
    }
    window.location.replace("/admin");
  }

  if (t === null) return <main className="adm-center"><p>Cargando…</p></main>;
  if (!t) {
    return (
      <main className="adm-center">
        <div className="admin-gate">
          <h1>Enlace incompleto</h1>
          <p>Abre el enlace completo que te enviaron, o pide uno nuevo a quien administra el panel.</p>
        </div>
      </main>
    );
  }
  return (
    <main className="adm-center">
      <form className="admin-gate" onSubmit={enviar}>
        <h1>Crea tu contraseña</h1>
        <p>Con ella entrarás al panel de Ventas Virtual Colombia. Mínimo 8 caracteres.</p>
        <input className="input" type="password" autoComplete="new-password" aria-label="Contraseña nueva" placeholder="Contraseña nueva" autoFocus
          value={clave.nueva} onChange={(e) => setClave((c) => ({ ...c, nueva: e.target.value }))} />
        <input className="input" type="password" autoComplete="new-password" aria-label="Repite la contraseña" placeholder="Repite la contraseña"
          value={clave.repetir} onChange={(e) => setClave((c) => ({ ...c, repetir: e.target.value }))} />
        <button className="btn full" type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar y entrar"}</button>
        {error && <div className="form-error" role="alert">{error}</div>}
      </form>
    </main>
  );
}
