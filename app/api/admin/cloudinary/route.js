// Firma de subida a Cloudinary para el panel (HU-13) y borrado de subidas que no se guardaron.
// Exige la sesión de Supabase Auth. El navegador sube el archivo directo a Cloudinary con esta
// firma; el API Secret no sale del servidor.
import { tokenDe, usuarioDeToken, supabaseConfigurado, userClient } from "../../../../lib/supabase";
import { cloudinaryConfigurado, firmaSubida, borrarImagen, esImagenPropia, imagenEnUso, subirDesdeUrl } from "../../../../lib/cloudinary";
import { updateRow } from "../../../../lib/inventory";
import { driveDirect } from "../../../../lib/images";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Productos por petición al migrar: el navegador repite hasta terminar (evita el tiempo límite).
const TANDA = 3;

export async function POST(request) {
  if (!supabaseConfigurado()) {
    return Response.json({ error: "El panel no está configurado: faltan las claves de Supabase." }, { status: 500 });
  }
  const token = tokenDe(request);
  if (!(await usuarioDeToken(token))) {
    return Response.json({ error: "Sesión no válida." }, { status: 401 });
  }
  if (!cloudinaryConfigurado()) {
    return Response.json({ error: "Falta configurar Cloudinary en el servidor (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET)." });
  }
  let body = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Petición inválida." }, { status: 400 });
  }
  // Subidas que no se llegaron a guardar (formulario cancelado o imagen reemplazada antes de
  // guardar): se borran para no ocupar espacio. Solo si son del panel y nada las usa.
  if (body?.op === "borrar") {
    const urls = (Array.isArray(body.urls) ? body.urls : []).filter(esImagenPropia).slice(0, 10);
    let borradas = 0;
    for (const url of urls) {
      if (!(await imagenEnUso(userClient(token), url)) && (await borrarImagen(url))) borradas++;
    }
    return Response.json({ ok: true, borradas });
  }
  // HU-17: copia a Cloudinary las fotos de Drive (u otro sitio) de los productos indicados. Lo que
  // falla se deja como estaba: nunca se pierde la foto original.
  if (body?.op === "migrar") {
    const ids = (Array.isArray(body.ids) ? body.ids : []).filter((x) => typeof x === "string").slice(0, TANDA);
    const { data, error } = await userClient(token).from("productos").select("id,codigo,fotos").in("id", ids);
    if (error) return Response.json({ error: "Supabase: " + error.message }, { status: 500 });
    let migrados = 0;
    const fallidos = [];
    for (const p of data) {
      const resultados = await Promise.all((p.fotos || []).map(async (url) => {
        if (esImagenPropia(url) || !/^https?:\/\//i.test(url)) return { url, nueva: url };
        try {
          return { url, nueva: await subirDesdeUrl(driveDirect(url), p.codigo) };
        } catch (e) {
          return { url, nueva: url, motivo: String(e?.message || e) };
        }
      }));
      const fallo = resultados.find((r) => r.motivo);
      if (fallo) fallidos.push({ codigo: p.codigo, motivo: fallo.motivo });
      if (resultados.some((r) => r.nueva !== r.url)) {
        try {
          await updateRow(token, p.id, { Foto: resultados.map((r) => r.nueva).join(", ") });
          if (!fallo) migrados++;
        } catch (e) {
          fallidos.push({ codigo: p.codigo, motivo: String(e?.message || e) });
        }
      }
    }
    return Response.json({ ok: true, migrados, fallidos });
  }
  const firma = firmaSubida(String(body?.destino || ""), body?.codigo);
  if (!firma) return Response.json({ error: "Destino de imagen no reconocido o falta el código del producto." }, { status: 400 });
  return Response.json(firma);
}
