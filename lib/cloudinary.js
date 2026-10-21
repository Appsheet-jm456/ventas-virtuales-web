// Cloudinary (decisión 0007; HU-13). SOLO servidor: usa el API Secret, que nunca llega al
// navegador (decisión 0002). El navegador sube directo a Cloudinary con una firma de corta
// vida que da /api/admin/cloudinary; aquí también se borran las imágenes reemplazadas.
import crypto from "crypto";

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;

export const cloudinaryConfigurado = () => Boolean(CLOUD && KEY && SECRET);

// Todo lo que sube el panel queda bajo esta carpeta; solo eso se puede borrar desde la web.
export const CARPETA = "ventas-virtual";

// Formatos aceptados por destino. Cloudinary rechaza la subida si no cumple (va en la firma).
const DESTINOS = {
  banner: "jpg,jpeg,png,webp",
  "banner-movil": "jpg,jpeg,png,webp",
  categoria: "jpg,jpeg,png,webp",
  producto: "jpg,jpeg,png,webp",
  logo: "jpg,jpeg,png,webp,svg",
};

function firmar(params) {
  const cadena = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  return crypto.createHash("sha1").update(cadena + SECRET).digest("hex");
}

// Las fotos de un producto van en su propia carpeta: ventas-virtual/productos/<código>. El código
// llega del navegador, así que se deja solo con letras, números, guion y guion bajo.
export const carpetaProducto = (codigo) => {
  const c = String(codigo || "").trim().replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return c ? `${CARPETA}/productos/${c}` : null;
};

// Datos para que el navegador suba un archivo a la carpeta del destino. null si el destino no
// existe o, en producto, si falta el código.
export function firmaSubida(destino, codigo) {
  const formatos = DESTINOS[destino];
  if (!formatos) return null;
  const folder = destino === "producto" ? carpetaProducto(codigo) : `${CARPETA}/${destino}`;
  if (!folder) return null;
  const params = { allowed_formats: formatos, folder, timestamp: Math.floor(Date.now() / 1000) };
  return { ...params, signature: firmar(params), api_key: KEY, cloud_name: CLOUD };
}

// public_id de una URL subida por el panel, o null si la URL no es de esta cuenta y carpeta.
export function publicIdDe(url) {
  if (!CLOUD) return null;
  const m = String(url || "").match(/^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
  if (!m || m[1] !== CLOUD || !m[2].startsWith(CARPETA + "/")) return null;
  return m[2];
}

// ¿Es una imagen subida por el panel a esta cuenta?
export const esImagenPropia = (url) => publicIdDe(url) !== null;

// ¿Alguna fila usa esta imagen? (banners, categorías, el logo o fotos de productos). Recibe un cliente de Supabase.
export async function imagenEnUso(cliente, url) {
  const [b, c, k, p] = await Promise.all([
    cliente.from("banners").select("id").or(`imagen_escritorio.eq."${url}",imagen_celular.eq."${url}"`).limit(1),
    cliente.from("categorias").select("id").eq("imagen", url).limit(1),
    cliente.from("configuracion").select("clave").eq("valor->>logo", url).limit(1),
    cliente.from("productos").select("id").contains("fotos", [url]).limit(1),
  ]);
  if (b.error || c.error || k.error || p.error) return true; // ante la duda, no se borra
  return Boolean(b.data.length || c.data.length || k.data.length || p.data.length);
}

// Borra de Cloudinary una imagen que ya no se usa. Nunca lanza: si falla, la imagen queda huérfana
// y no afecta a la web.
export async function borrarImagen(url) {
  const public_id = publicIdDe(url);
  if (!public_id || !cloudinaryConfigurado()) return false;
  const timestamp = Math.floor(Date.now() / 1000);
  const cuerpo = new URLSearchParams({ public_id, timestamp: String(timestamp), api_key: KEY, signature: firmar({ public_id, timestamp }) });
  try {
    const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/destroy`, { method: "POST", body: cuerpo });
    return r.ok;
  } catch {
    return false;
  }
}

// Copia a Cloudinary una imagen que está en otro sitio (HU-17: fotos de Google Drive). Cloudinary
// la descarga él mismo desde la URL, así que no pasa por este servidor. Devuelve la URL nueva o
// lanza un Error con el motivo en palabras (por ejemplo, Drive sin compartir).
export async function subirDesdeUrl(url, codigo) {
  const folder = carpetaProducto(codigo);
  if (!folder || !cloudinaryConfigurado()) throw new Error("Cloudinary no está configurado o falta el código.");
  const timestamp = Math.floor(Date.now() / 1000);
  const cuerpo = new URLSearchParams({
    file: url, folder, timestamp: String(timestamp), api_key: KEY, signature: firmar({ folder, timestamp }),
  });
  let r;
  try {
    r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: cuerpo });
  } catch {
    throw new Error("No se pudo contactar a Cloudinary.");
  }
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.secure_url) {
    throw new Error(/error in loading|resource not found|invalid image|image file/i.test(d.error?.message || "")
      ? "La foto no se pudo leer: ¿está compartida como «cualquiera con el enlace»?"
      : "Cloudinary no aceptó la foto: " + (d.error?.message || r.status));
  }
  return d.secure_url;
}
