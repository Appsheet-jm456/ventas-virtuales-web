// Entrega optimizada de imágenes de Cloudinary (decisión 0007): agrega a la URL guardada las
// transformaciones de formato y calidad automáticos y el tamaño. Cualquier otra URL (archivos de
// /public, Google Drive) pasa sin cambios. Sirve en servidor y en navegador.
export function cld(url, transformacion = "f_auto,q_auto") {
  const u = String(url || "");
  if (!u.startsWith("https://res.cloudinary.com/") || !u.includes("/image/upload/")) return u;
  return u.replace("/image/upload/", `/image/upload/${transformacion}/`);
}
