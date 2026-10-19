// Firma de subida a Cloudinary para el panel (HU-13) y borrado de subidas que no se guardaron.
// Exige la sesión de Supabase Auth. El navegador sube el archivo directo a Cloudinary con esta
// firma; el API Secret no sale del servidor.
import { tokenDe, usuarioDeToken, supabaseConfigurado, userClient } from "../../../../lib/supabase";
import { cloudinaryConfigurado, firmaSubida, borrarImagen, esImagenPropia, imagenEnUso } from "../../../../lib/cloudinary";

export const dynamic = "force-dynamic";

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
  const firma = firmaSubida(String(body?.destino || ""));
  if (!firma) return Response.json({ error: "Destino de imagen no reconocido." }, { status: 400 });
  return Response.json(firma);
}
