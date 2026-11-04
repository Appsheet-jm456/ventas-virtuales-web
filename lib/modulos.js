// Módulos y niveles de permiso del panel (HU-34). Sin dependencias: lo usan el navegador y el servidor.
export const MODULOS_PERMISO = [
  { id: "bandeja", nombre: "Bandeja de entrada", soloVer: true },
  { id: "productos", nombre: "Productos" },
  { id: "banners", nombre: "Banners e imágenes" },
  { id: "categorias", nombre: "Categorías" },
  { id: "politicas", nombre: "Políticas y Nosotros" },
  { id: "configuracion", nombre: "Configuración" },
  { id: "usuarios", nombre: "Usuarios" },
];

// `editar` incluye `ver`.
export function tienePermiso(permisos, modulo, nivel = "ver") {
  const n = permisos?.[modulo];
  return n === "editar" || (nivel === "ver" && n === "ver");
}

// Módulo que protege cada dirección del panel. null = cualquier usuario activo (Mi cuenta).
export function permisoDeRuta(pathname) {
  if (pathname === "/admin") return "bandeja";
  if (pathname === "/admin/cuenta") return null;
  if (pathname.startsWith("/admin/configuracion/usuarios")) return "usuarios";
  if (pathname.startsWith("/admin/configuracion/nosotros")) return "politicas";
  const m = pathname.match(/^\/admin\/([^/]+)/);
  return m ? m[1] : "bandeja";
}
