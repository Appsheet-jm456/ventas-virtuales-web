"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAdmin } from "./AdminShell";

// Bandeja de entrada del panel (HU-11): cómo va la web y qué conviene atender hoy.
// Visitas y clics a WhatsApp salen de la tabla `eventos`; el resto, del catálogo.

const PERIODOS = [["7", "Últimos 7 días"], ["14", "Últimos 14 días"], ["30", "Últimos 30 días"], ["mes", "Este mes"]];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fecha = (iso) => `${Number(iso.slice(8, 10))} ${MESES[Number(iso.slice(5, 7)) - 1]}`;
const num = (n) => Number(n || 0).toLocaleString("es-CO");

function Ico({ d }) {
  return <svg className="adm-i" viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;
}
const I = {
  slash: <><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-8 8" /></>,
  check: <path d="M20 6L9 17l-5-5" />,
  box: <><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3.3 7.5L12 12.5l8.7-5M12 22V12.5" /></>,
};

// Variación frente al periodo anterior, en palabras.
function Variacion({ actual, previo }) {
  if (!previo && !actual) return <span className="bj-d">Sin datos en este periodo</span>;
  if (!previo) return <span className="bj-d up">Nuevo: no hubo en el periodo anterior</span>;
  const pct = Math.round(((actual - previo) / previo) * 100);
  if (pct === 0) return <span className="bj-d">Igual que el periodo anterior</span>;
  return <span className={`bj-d ${pct > 0 ? "up" : "down"}`}>{pct > 0 ? "▲" : "▼"} {Math.abs(pct)}% vs. periodo anterior</span>;
}

// Escala «redonda» para un eje: devuelve el tope y las marcas.
function escala(max) {
  if (max <= 0) return { tope: 4, marcas: [0, 1, 2, 3, 4] };
  const paso0 = max / 4;
  const pot = 10 ** Math.floor(Math.log10(paso0));
  const paso = Math.max(1, [1, 2, 5, 10].map((m) => m * pot).find((p) => p >= paso0));
  const tope = paso * Math.ceil(max / paso);
  const marcas = [];
  for (let v = 0; v <= tope + 1e-9; v += paso) marcas.push(Math.round(v));
  return { tope, marcas };
}

// Barras = visitas (eje izquierdo); línea = clics en WhatsApp (eje derecho).
function Grafica({ serie }) {
  const W = 640, H = 230, pl = 40, pr = 40, pt = 12, pb = 28;
  const n = serie.length;
  const ev = escala(Math.max(...serie.map((d) => d.visitas), 0));
  const ew = escala(Math.max(...serie.map((d) => d.whatsapp), 0));
  const ancho = (W - pl - pr) / n;
  const y = (v, e) => pt + (H - pt - pb) * (1 - v / e.tope);
  const cada = Math.ceil(n / 7);
  const linea = serie.map((d, i) => `${i ? "L" : "M"}${(pl + i * ancho + ancho / 2).toFixed(1)} ${y(d.whatsapp, ew).toFixed(1)}`).join(" ");
  const ult = serie[n - 1];
  return (
    <svg className="bj-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Visitas por día en barras y clics en WhatsApp en línea">
      {ev.marcas.map((m) => (
        <g key={m}>
          <line className="bj-grid" x1={pl} x2={W - pr} y1={y(m, ev)} y2={y(m, ev)} />
          <text x={pl - 6} y={y(m, ev) + 4} textAnchor="end">{num(m)}</text>
        </g>
      ))}
      {ew.marcas.map((m) => (
        <text key={m} className="bj-wa-t" x={W - pr + 6} y={y(m, ew) + 4}>{num(m)}</text>
      ))}
      {serie.map((d, i) => (
        <g key={d.dia}>
          <rect className={`bj-bar${i === n - 1 ? " hoy" : ""}`} x={pl + i * ancho + ancho * 0.18} y={y(d.visitas, ev)}
            width={ancho * 0.64} height={Math.max(0, y(0, ev) - y(d.visitas, ev))} rx="2">
            <title>{`${fecha(d.dia)}: ${num(d.visitas)} visitas, ${num(d.whatsapp)} clics en WhatsApp`}</title>
          </rect>
          {(i === n - 1 || (i % cada === 0 && n - 1 - i >= cada / 2)) && (
            <text x={pl + i * ancho + ancho / 2} y={H - 8} textAnchor="middle">{fecha(d.dia)}</text>
          )}
        </g>
      ))}
      <path className="bj-line" d={linea} />
      {ult && <circle className="bj-dot" cx={pl + (n - 1) * ancho + ancho / 2} cy={y(ult.whatsapp, ew)} r="4" />}
    </svg>
  );
}

function Alerta({ tipo, icono, titulo, texto, boton, href }) {
  return (
    <li className="bj-alerta">
      <span className={`bj-ic ${tipo}`}><Ico d={icono} /></span>
      <div><b>{titulo}</b><small>{texto}</small></div>
      {boton && <Link className="btn-ghost bj-ir" href={href}>{boton}</Link>}
    </li>
  );
}

const plural = (n, uno, varios) => (n === 1 ? uno : varios);

export default function Bandeja() {
  const { token, logout } = useAdmin();
  const [periodo, setPeriodo] = useState("14");
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargar(periodo); }, [periodo]);

  async function cargar(p) {
    setCargando(true); setError("");
    try {
      const res = await fetch("/api/admin/metricas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
        body: JSON.stringify({ periodo: p }),
      });
      if (res.status === 401) { logout(); return; }
      const j = await res.json();
      if (j.error) throw new Error(j.error);
      setD(j);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setCargando(false);
    }
  }

  const c = d?.catalogo;
  const alertas = [];
  if (c) {
    if (c.publicados === 0) alertas.push({ tipo: "warn", icono: I.box, titulo: "No hay productos publicados", texto: "La web muestra el catálogo vacío. Súbelos con la carga CSV.", boton: "Cargar productos", href: "/admin/productos" });
    if (c.sinFoto > 0) alertas.push({ tipo: "warn", icono: I.image, titulo: `${num(c.sinFoto)} ${plural(c.sinFoto, "producto publicado", "productos publicados")} sin foto`, texto: "Se ven con un icono en vez de foto y suelen venderse menos.", boton: "Ver productos", href: "/admin/productos" });
    if (c.agotadosViejos > 0) alertas.push({ tipo: "bad", icono: I.slash, titulo: `${num(c.agotadosViejos)} ${plural(c.agotadosViejos, "agotado", "agotados")} hace más de 30 días`, texto: "Considera ocultarlos o reponer el stock.", boton: "Revisar", href: "/admin/productos" });
    if (d.banners.activos === 0) alertas.push({ tipo: "bad", icono: I.image, titulo: "No hay banners activos", texto: "La portada se queda sin el banner rotativo.", boton: "Ir a banners", href: "/admin/banners" });
    else if (d.banners.inactivos > 0) alertas.push({ tipo: "warn", icono: I.image, titulo: `${num(d.banners.inactivos)} ${plural(d.banners.inactivos, "banner desactivado", "banners desactivados")}`, texto: `La portada muestra ${num(d.banners.activos)}.`, boton: "Ir a banners", href: "/admin/banners" });
    if (!alertas.length) alertas.push({ tipo: "ok", icono: I.check, titulo: "Todo en orden", texto: "No hay nada pendiente en el catálogo ni en los banners." });
  }
  const sinEventos = d && d.visitas.actual + d.whatsapp.actual === 0;

  return (
    <div className="pr">
      <div className="bj-cab">
        <p className="pr-sub" style={{ margin: 0 }}>
          {d ? `Del ${fecha(d.periodo.desde)} al ${fecha(d.periodo.hasta)}, hora de Colombia. Sin cookies ni datos personales.` : "Cargando…"}
        </p>
        <select id="bj-periodo" className="input bj-per" aria-label="Periodo" value={periodo} onChange={(e) => setPeriodo(e.target.value)} disabled={cargando}>
          {PERIODOS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
      </div>

      {error && <p className="pr-aviso bad" role="alert">{error}</p>}

      {d && (
        <>
          <div className="bj-kpis">
            <div className="pr-card bj-kpi"><span className="bj-l">Visitas (páginas vistas)</span><span className="bj-v">{num(d.visitas.actual)}</span><Variacion {...d.visitas} /></div>
            <div className="pr-card bj-kpi"><span className="bj-l">Clics en WhatsApp</span><span className="bj-v">{num(d.whatsapp.actual)}</span><Variacion {...d.whatsapp} /></div>
            <div className="pr-card bj-kpi"><span className="bj-l">Productos publicados</span><span className="bj-v">{num(c.publicados)}</span><span className="bj-d">{num(c.ocultos)} {plural(c.ocultos, "oculto", "ocultos")}</span></div>
            <div className="pr-card bj-kpi"><span className="bj-l">Agotados</span><span className="bj-v">{num(c.agotados)}</span><span className={`bj-d ${c.agotados ? "down" : ""}`}>{c.publicados ? `${Math.round((c.agotados / c.publicados) * 100)}% de lo publicado` : "Sin productos publicados"}</span></div>
          </div>

          <div className="bj-cols">
            <section className="pr-card">
              <h2 className="pr-h">Visitas y clics a WhatsApp</h2>
              <p className="pr-sub">Cuántos visitantes llegan cada día y cuántos escriben a un asesor.</p>
              {sinEventos
                ? <div className="bj-vacio">Aún no hay visitas registradas en este periodo. Se cuentan desde que esta versión de la web está publicada.</div>
                : <>
                    <div className="tablewrap"><Grafica serie={d.serie} /></div>
                    <div className="bj-leyenda">
                      <span><i className="bj-sw bar" />Visitas por día (eje izquierdo)</span>
                      <span><i className="bj-sw wa" />Clics en WhatsApp (eje derecho)</span>
                    </div>
                  </>}
            </section>
            <section className="pr-card">
              <h2 className="pr-h">Más consultados</h2>
              <p className="pr-sub">Clics en «Estoy interesado» por producto.</p>
              {d.masConsultados.length === 0
                ? <div className="bj-vacio">Todavía nadie ha tocado «Estoy interesado» en este periodo.</div>
                : <ol className="bj-rank">
                    {d.masConsultados.map((p) => (
                      <li key={p.codigo}>
                        <span className="bj-rn">{p.nombre}<small className="mono">{p.codigo}{p.existe ? "" : " · ya no existe"}</small></span>
                        <b className="num">{num(p.clics)}</b>
                        <div className="bj-rb"><i style={{ width: `${(p.clics / d.masConsultados[0].clics) * 100}%` }} /></div>
                      </li>
                    ))}
                  </ol>}
            </section>
          </div>

          <section className="pr-card">
            <h2 className="pr-h">Para revisar</h2>
            <p className="pr-sub">Lo que conviene atender hoy.</p>
            <ul className="bj-alertas">{alertas.map((a) => <Alerta key={a.titulo} {...a} />)}</ul>
          </section>
        </>
      )}
    </div>
  );
}
