// Datos de la empresa, usados en el header, footer y botones de WhatsApp.
export const SITE = {
  nombre: "Ventas Virtual Colombia",
  lema: "Distribuidores de computadores corporativos nuevos y usados",
  // Logo de la empresa. Sube tu imagen a la carpeta /public con este nombre.
  // Si el archivo no existe, se muestra automáticamente la marca de respaldo "VV".
  logo: "/logo.png",
  direccion: "Av. Estación #23dn-68 local 2-107, San Vicente, Cali, Valle del Cauca (CC Pasarela, local 2-107, segundo piso)",
  ciudad: "Cali, Colombia",
  whatsapp: "573175591252",           // línea oficial de ventas
  whatsappDisplay: "317 559 1252",
  instagram: "https://www.instagram.com/ventasvirtualcol/",
  facebook: "https://www.facebook.com/p/Ventas-Virtual-Colombia-100092489010584/",
  tiktok: "https://www.tiktok.com/@ventasvirtualcol",
};

// Enlace de WhatsApp con mensaje prellenado.
export function waLink(text) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}
