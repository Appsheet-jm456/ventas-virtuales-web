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
  // Horario de atención para el pie de página. Vacío = no se muestra.
  horario: "",

  // Banner rotativo del Inicio (HU-02). Para cambiarlo, reemplaza los archivos de /public/banners
  // o cambia las rutas. Tamaños: escritorio 1600×500, celular 800×800 (opcional).
  // href: una ruta de la web ("/productos?q=lenovo"), una URL, o "wa:<mensaje>" para abrir WhatsApp.
  banners: [
    {
      img: "/banners/banner-1.svg",
      imgMovil: "/banners/banner-1-movil.svg",
      alt: "Portátiles corporativos con garantía",
      href: "/productos?categoria=portatil",
    },
    {
      img: "/banners/banner-2.svg",
      imgMovil: "/banners/banner-2-movil.svg",
      alt: "Envíos a todo el país — escríbenos por WhatsApp",
      href: "wa:Hola 👋, quiero información sobre envíos a mi ciudad.",
    },
  ],

  // Imagen de cada categoría (HU-03). Se asigna a toda categoría de Baserow cuyo nombre
  // contenga la palabra clave (sin tildes ni mayúsculas). Cuadradas, 600×600.
  categoriaImagenes: [
    { clave: "portatil", img: "/categorias/portatiles.svg" },
    { clave: "torre", img: "/categorias/torres.svg" },
    { clave: "tiny", img: "/categorias/torres.svg" },
    { clave: "escritorio", img: "/categorias/torres.svg" },
    { clave: "parte", img: "/categorias/partes.svg" },
    { clave: "repuesto", img: "/categorias/partes.svg" },
    { clave: "accesorio", img: "/categorias/accesorios.svg" },
  ],
};

// Enlace de WhatsApp con mensaje prellenado.
// `numero` sale de la configuración (HU-15); sin él se usa el de respaldo de este archivo.
export function waLink(text, numero = SITE.whatsapp) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(text)}`;
}

// Resuelve el enlace de un banner: "wa:<mensaje>" abre WhatsApp; lo demás se usa tal cual.
export function bannerHref(href, numero) {
  if (!href) return "";
  return href.startsWith("wa:") ? waLink(href.slice(3), numero) : href;
}
