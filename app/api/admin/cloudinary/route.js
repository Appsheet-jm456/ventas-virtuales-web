// Firma de subida a Cloudinary para el panel (HU-13) y borrado de subidas que no se guardaron.
// Exige la sesión de Supabase Auth. El navegador sube el archivo directo a Cloudinary con esta
// firma; el API Secret no sale del servidor.
import { userClient } from "../../../../lib/supabase";
import { adminClient } from "../../../../lib/supabase-admin";
import { exigir, sinPermiso } from "../../../../lib/permisos";
import { tienePermiso } from "../../../../lib/modulos";
import { cloudinaryConfigurado, firmaSubida, borrarImagen, esImagenPropia, imagenEnUso, subirDesdeUrl } from "../../../../lib/cloudinary";
import { updateRow } from "../../../../lib/inventory";
import { driveDirect } from "../../../../lib/images";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Productos por petición al migrar: el navegador repite hasta terminar (evita el tiempo límite).
const TANDA = 3;

// Qué permiso exige subir una imagen a cada destino (HU-34).
const PERMISO_DESTINO = {
  producto: "productos", banner: "banners", "banner-movil": "banners", categoria: "categorias",
  logo: "configuracion", nosotros: "politicas",
};

export async function POST(request) {
  const a = await exigir(request, null);
  if (a.respuesta) return a.respuesta;
  const { token, acceso } = a;
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
    if (!Object.values(PERMISO_DESTINO).some((m) => tienePermiso(acceso.permisos, m, "editar"))) return sinPermiso();
    // Con la clave secreta: la RLS de un rol limitado ocultaría usos y se borraría una imagen en uso.
    const lector = adminClient() || userClient(token);
    const urls = (Array.isArray(body.urls) ? body.urls : []).filter(esImagenPropia).slice(0, 10);
    let borradas = 0;
    for (const url of urls) {
      if (!(await imagenEnUso(lector, url)) && (await borrarImagen(url))) borradas++;
    }
    return Response.json({ ok: true, borradas });
  }
  // HU-17: copia a Cloudinary las fotos de Drive (u otro sitio) de los productos indicados. Lo que
  // falla se deja como estaba: nunca se pierde la foto original.
  if (body?.op === "migrar") {
    if (!tienePermiso(acceso.permisos, "productos", "editar")) return sinPermiso();
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
  const moduloDestino = PERMISO_DESTINO[String(body?.destino || "")];
  if (moduloDestino && !tienePermiso(acceso.permisos, moduloDestino, "editar")) return sinPermiso();
  const firma = firmaSubida(String(body?.destino || ""), body?.codigo);
  if (!firma) return Response.json({ error: "Destino de imagen no reconocido o falta el código del producto." }, { status: 400 });
  return Response.json(firma);
}
