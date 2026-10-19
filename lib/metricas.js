// Resumen de la Bandeja de entrada (HU-11). Solo con el token del administrador: la RLS de
// `eventos` no deja leer a nadie más. Días en hora de Colombia (UTC−5, sin horario de verano).
import { userClient } from "./supabase";

const DIA = 24 * 60 * 60 * 1000;
const BOGOTA = -5 * 60 * 60 * 1000;
const fechaBogota = (ms) => new Date(ms + BOGOTA).toISOString().slice(0, 10);
// Medianoche de Colombia del día de `ms`, en milisegundos UTC.
const inicioDia = (ms) => Date.parse(fechaBogota(ms) + "T00:00:00Z") - BOGOTA;

// Periodo pedido y el anterior de la misma duración. `periodo`: "7", "14", "30" o "mes".
export function rangos(periodo, ahora = Date.now()) {
  const manana = inicioDia(ahora) + DIA;
  let desde;
  if (periodo === "mes") {
    desde = Date.parse(fechaBogota(ahora).slice(0, 8) + "01T00:00:00Z") - BOGOTA;
  } else {
    const dias = [7, 14, 30].includes(Number(periodo)) ? Number(periodo) : 14;
    desde = manana - dias * DIA;
  }
  const duracion = manana - desde;
  return { desde, hasta: manana, antes: desde - duracion };
}

function check({ data, error }) {
  if (error) throw new Error("Supabase: " + error.message);
  return data;
}

const total = (filas, k) => filas.reduce((s, f) => s + Number(f[k] || 0), 0);

export async function resumen(token, periodo) {
  const sb = userClient(token);
  const { desde, hasta, antes } = rangos(periodo);
  const iso = (ms) => new Date(ms).toISOString();

  const [actual, previo, top, productos, banners] = await Promise.all([
    sb.rpc("metricas_por_dia", { desde: iso(desde), hasta: iso(hasta) }).then(check),
    sb.rpc("metricas_por_dia", { desde: iso(antes), hasta: iso(desde) }).then(check),
    sb.rpc("productos_mas_consultados", { desde: iso(desde), hasta: iso(hasta), limite: 5 }).then(check),
    sb.from("productos").select("codigo,marca,modelo,descripcion,stock,fotos,activo,actualizado_en").then(check),
    sb.from("banners").select("titulo,activo").then(check),
  ]);

  // Serie completa, con los días sin eventos en cero.
  const porDia = new Map(actual.map((f) => [f.dia, f]));
  const serie = [];
  for (let t = desde; t < hasta; t += DIA) {
    const dia = fechaBogota(t);
    const f = porDia.get(dia);
    serie.push({ dia, visitas: Number(f?.visitas || 0), whatsapp: Number(f?.whatsapp || 0) });
  }

  const nombre = (p) => [p.marca, p.modelo].filter(Boolean).join(" ") || (p.descripcion || "").slice(0, 60) || p.codigo;
  const porCodigo = new Map(productos.map((p) => [p.codigo, p]));
  const activos = productos.filter((p) => p.activo);
  const hace30 = Date.now() - 30 * DIA;

  return {
    periodo: { desde: fechaBogota(desde), hasta: fechaBogota(hasta - DIA), dias: serie.length },
    visitas: { actual: total(actual, "visitas"), previo: total(previo, "visitas") },
    whatsapp: { actual: total(actual, "whatsapp"), previo: total(previo, "whatsapp") },
    serie,
    masConsultados: top.map((t) => {
      const p = porCodigo.get(t.producto);
      return { codigo: t.producto, nombre: p ? nombre(p) : t.producto, clics: Number(t.clics), existe: Boolean(p) };
    }),
    catalogo: {
      publicados: activos.length,
      agotados: activos.filter((p) => p.stock <= 0).length,
      ocultos: productos.length - activos.length,
      sinFoto: activos.filter((p) => !(p.fotos || []).length).length,
      agotadosViejos: activos.filter((p) => p.stock <= 0 && Date.parse(p.actualizado_en) < hace30).length,
    },
    banners: { activos: banners.filter((b) => b.activo).length, inactivos: banners.filter((b) => !b.activo).length },
  };
}
