// Catálogo en Supabase (decisión 0009). Las filas se entregan con los nombres de columna del
// formato histórico de Baserow ("Código", "Categoría"…) para que las páginas no cambien.
import { publicClient, userClient, supabaseConfigurado } from "./supabase";
import { getConfig } from "./configuracion";

// Inventario de ejemplo para MODO DEMO (cuando Baserow no está configurado).
const SAMPLE_INVENTORY = [
  { _id: 1, "Código": "PU-001", "Categoría": "Portátil usado", "Marca": "Lenovo", "Modelo": "ThinkPad T480", "Procesador": "Core i5 8350U", "Generación": "8", "RAM": "16GB", "Almacenamiento": "256GB SSD", "Estado": "Grado A", "Precio": 1150000, "Stock": 3, "Descripción": "Equipo corporativo, batería buena, teclado retroiluminado.", "Foto": "", "Video": "" },
  { _id: 2, "Código": "PU-002", "Categoría": "Portátil usado", "Marca": "Dell", "Modelo": "Latitude 7420", "Procesador": "Core i7 1185G7", "Generación": "11", "RAM": "16GB", "Almacenamiento": "256GB SSD", "Estado": "Grado A", "Precio": 1599000, "Stock": 1, "Descripción": "Portátil empresarial premium de 14 pulgadas.", "Foto": "", "Video": "" },
  { _id: 3, "Código": "PU-003", "Categoría": "Portátil usado", "Marca": "HP", "Modelo": "EliteBook 840 G5", "Procesador": "Core i5 8265U", "Generación": "8", "RAM": "8GB", "Almacenamiento": "256GB SSD", "Estado": "Grado A", "Precio": 1050000, "Stock": 4, "Descripción": "Pantalla 14 FHD IPS, liviano y resistente.", "Foto": "", "Video": "" },
  { _id: 4, "Código": "PU-004", "Categoría": "Portátil usado", "Marca": "Lenovo", "Modelo": "ThinkPad X1 Carbon G7", "Procesador": "Core i7 8665U", "Generación": "8", "RAM": "16GB", "Almacenamiento": "512GB SSD", "Estado": "Grado B", "Precio": 1890000, "Stock": 2, "Descripción": "Ultraliviano de 14 pulgadas.", "Foto": "", "Video": "" },
  { _id: 5, "Código": "PN-001", "Categoría": "Portátil nuevo", "Marca": "Dell", "Modelo": "Vostro 3520", "Procesador": "Core i5 1235U", "Generación": "12", "RAM": "8GB", "Almacenamiento": "512GB SSD", "Estado": "Nuevo", "Precio": 2350000, "Stock": 2, "Descripción": "Nuevo con garantía de fábrica.", "Foto": "", "Video": "" },
  { _id: 6, "Código": "TT-001", "Categoría": "Torre tiny", "Marca": "Lenovo", "Modelo": "ThinkCentre M720q", "Procesador": "Core i5 8500T", "Generación": "8", "RAM": "8GB", "Almacenamiento": "256GB SSD", "Estado": "Grado A", "Precio": 890000, "Stock": 5, "Descripción": "Mini PC corporativo, ideal para oficina.", "Foto": "", "Video": "" },
  { _id: 7, "Código": "TT-002", "Categoría": "Torre tiny", "Marca": "Dell", "Modelo": "OptiPlex 7060 Micro", "Procesador": "Core i5 8500T", "Generación": "8", "RAM": "16GB", "Almacenamiento": "256GB SSD", "Estado": "Grado A", "Precio": 950000, "Stock": 0, "Descripción": "Micro torre silenciosa.", "Foto": "", "Video": "" },
  { _id: 8, "Código": "PT-001", "Categoría": "Partes", "Marca": "Kingston", "Modelo": "Memoria RAM DDR4 8GB", "Procesador": "", "Generación": "", "RAM": "8GB", "Almacenamiento": "", "Estado": "Nuevo", "Precio": 95000, "Stock": 10, "Descripción": "SODIMM 3200 MHz para portátil.", "Foto": "", "Video": "" },
  { _id: 9, "Código": "ACC-058", "Categoría": "Accesorios", "Marca": "Genérico", "Modelo": "Cargador USB-C 65W", "Procesador": "", "Generación": "", "RAM": "", "Almacenamiento": "", "Estado": "Nuevo", "Precio": 75000, "Stock": 0, "Descripción": "Carga rápida para portátiles modernos.", "Foto": "", "Video": "" },
  { _id: 10, "Código": "ACC-061", "Categoría": "Accesorios", "Marca": "Logitech", "Modelo": "Mouse inalámbrico M185", "Procesador": "", "Generación": "", "RAM": "", "Almacenamiento": "", "Estado": "Nuevo", "Precio": 45000, "Stock": 12, "Descripción": "Receptor USB nano.", "Foto": "", "Video": "" },
];


// Pesos y unidades son enteros: "1.150.000", "$1,150,000" y "1150000" valen lo mismo.
const num = (v, def = 0) => {
  const d = String(v ?? "").replace(/\D/g, "");
  return d ? Number(d) : def;
};

// Fotos: varias URL separadas por coma o salto de línea; la primera es la portada.
export const listaFotos = (t) => String(t ?? "").split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);

const OCULTO = ["sí", "si", "true", "1", "x", "oculto", "yes", "y"];
export const textoEsOculto = (v) => OCULTO.includes(String(v ?? "").trim().toLowerCase());

// Fila de la base -> fila con columnas históricas.
export function filaDesdeDb(p) {
  return {
    _id: p.id,
    "Código": p.codigo, "Categoría": p.categoria, "Descripción": p.descripcion, "Marca": p.marca,
    "Modelo": p.modelo, "Procesador": p.procesador, "Generación": p.generacion, "RAM": p.ram,
    "Almacenamiento": p.almacenamiento, "Estado": p.estado, "Precio": p.precio, "Stock": p.stock,
    "Foto": (p.fotos || []).join(", "), "Video": p.video || "", "Oculto": p.activo ? "" : "Sí",
  };
}

// Campos con columnas históricas -> columnas de la base. Solo traduce lo que viene.
export function filaADb(fields) {
  const o = {};
  const t = (k, col) => { if (k in fields) o[col] = String(fields[k] ?? "").trim(); };
  t("Código", "codigo"); t("Categoría", "categoria"); t("Descripción", "descripcion"); t("Marca", "marca");
  t("Modelo", "modelo"); t("Procesador", "procesador"); t("Generación", "generacion"); t("RAM", "ram");
  t("Almacenamiento", "almacenamiento"); t("Estado", "estado"); t("Video", "video");
  if ("Precio" in fields) o.precio = Math.max(0, num(fields["Precio"]));
  if ("Stock" in fields) o.stock = Math.max(0, Math.trunc(num(fields["Stock"])));
  if ("Foto" in fields) o.fotos = listaFotos(fields["Foto"]);
  if ("Oculto" in fields) o.activo = !textoEsOculto(fields["Oculto"]);
  return o;
}

export const isHidden = (row) => textoEsOculto(row?.["Oculto"]);

async function leerTodo(cliente) {
  const filas = [];
  for (let desde = 0; desde < 20000; desde += 1000) {
    const { data, error } = await cliente.from("productos").select("*").order("codigo").range(desde, desde + 999);
    if (error) throw new Error("Supabase: " + error.message);
    filas.push(...data);
    if (data.length < 1000) break;
  }
  return filas.map(filaDesdeDb);
}

// Catálogo completo, incluyendo ocultos. SOLO para el panel: exige el token de la sesión
// (las políticas RLS dejan al administrador ver todo; al público solo lo activo).
export async function getInventory(token) {
  if (!supabaseConfigurado()) return { rows: SAMPLE_INVENTORY, demo: true };
  return { rows: await leerTodo(userClient(token)), demo: false };
}

// Columnas que un cliente puede ver (RN-04).
const PUBLIC_FIELDS = [
  "Código", "Categoría", "Descripción", "Marca", "Modelo", "Procesador",
  "Generación", "RAM", "Almacenamiento", "Estado", "Precio", "Stock", "Foto", "Video",
];

export function publicRow(row) {
  const out = {};
  for (const k of PUBLIC_FIELDS) if (k in row) out[k] = row[k];
  return out;
}

// Catálogo público: la RLS ya deja solo los activos; aquí se recortan las columnas y se aplican
// las reglas del catálogo de la configuración (HU-15): ocultar agotados y ocultar precios.
export async function getPublicInventory() {
  if (!supabaseConfigurado()) {
    return { rows: SAMPLE_INVENTORY.filter((r) => !isHidden(r)).map(publicRow), demo: true };
  }
  const [rows, { catalogo }] = await Promise.all([leerTodo(publicClient()), getConfig()]);
  let out = rows.map(publicRow);
  if (!catalogo.mostrar_agotados) out = out.filter((r) => (parseInt(r["Stock"], 10) || 0) > 0);
  if (!catalogo.mostrar_precios) out = out.map((r) => ({ ...r, Precio: "" }));
  return { rows: out, demo: false };
}

function check({ error, data }) {
  if (error) {
    if (error.code === "23505") throw new Error("Ya existe un producto con ese Código.");
    throw new Error("Supabase: " + error.message);
  }
  return data;
}

export async function createRow(token, fields) {
  return filaDesdeDb(check(await userClient(token).from("productos").insert(filaADb(fields)).select().single()));
}

export async function updateRow(token, id, fields) {
  return filaDesdeDb(check(await userClient(token).from("productos").update(filaADb(fields)).eq("id", id).select().single()));
}

export async function deleteRow(token, id) {
  check(await userClient(token).from("productos").delete().eq("id", id));
  return true;
}
