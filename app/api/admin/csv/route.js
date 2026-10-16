// Carga de productos por CSV (HU-09). op "vista": analiza y no guarda. op "aplicar": guarda.
// Clave = Código. Lo que no viene en el archivo no se toca.
import { tokenDe, usuarioDeToken, userClient, supabaseConfigurado } from "../../../../lib/supabase";
import { analizarCsv } from "../../../../lib/csv";

export const dynamic = "force-dynamic";

async function codigosExistentes(cliente) {
  const mapa = new Map();
  for (let d = 0; d < 20000; d += 1000) {
    const { data, error } = await cliente.from("productos").select("id,codigo").range(d, d + 999);
    if (error) throw new Error(error.message);
    data.forEach((p) => mapa.set(p.codigo, p.id));
    if (data.length < 1000) break;
  }
  return mapa;
}

export async function POST(request) {
  if (!supabaseConfigurado()) return Response.json({ error: "Faltan las claves de Supabase." }, { status: 500 });
  const token = tokenDe(request);
  if (!(await usuarioDeToken(token))) return Response.json({ error: "Sesión no válida." }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Petición inválida." }, { status: 400 }); }
  if (body?.op !== "vista" && body?.op !== "aplicar") return Response.json({ error: "Operación no reconocida." }, { status: 400 });

  try {
    const cliente = userClient(token);
    const a = analizarCsv(body.csv, await codigosExistentes(cliente));
    if (a.error) return Response.json({ error: a.error }, { status: 400 });

    const resumen = {
      total: a.total, nuevos: a.nuevos.length, modificados: a.modificados.length, errores: a.errores,
      ejemplos: [...a.nuevos.slice(0, 5).map((x) => ({ tipo: "Nuevo", codigo: x.codigo })),
        ...a.modificados.slice(0, 5).map((x) => ({ tipo: "Modificado", codigo: x.codigo }))],
    };
    if (body.op === "vista") return Response.json({ ok: true, ...resumen });

    let creados = 0, actualizados = 0;
    for (let i = 0; i < a.nuevos.length; i += 200) {
      const lote = a.nuevos.slice(i, i + 200).map((x) => x.dato);
      const { error } = await cliente.from("productos").insert(lote);
      if (error) throw new Error("Al crear: " + error.message);
      creados += lote.length;
    }
    for (const x of a.modificados) {
      const { error } = await cliente.from("productos").update(x.dato).eq("id", x.id);
      if (error) throw new Error(`Al actualizar ${x.codigo}: ${error.message}`);
      actualizados++;
    }
    return Response.json({ ok: true, ...resumen, creados, actualizados, mensaje: `Carga lista: ${creados} nuevos, ${actualizados} actualizados, ${a.errores.length} omitidos por error.` });
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 200 });
  }
}
