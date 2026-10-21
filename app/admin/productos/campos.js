// Campos de producto del panel, compartidos por el listado (plantilla CSV) y el formulario de
// página completa (HU-18). Van en el orden de la plantilla CSV.
export const FIELDS = [
  { key: "Código", label: "Código *", ph: "100-101-1234" },
  { key: "Categoría", label: "Categoría", ph: "Portátil usado" },
  { key: "Descripción", label: "Nombre producto (Descripción)", ph: "PORTATIL LENOVO THINKPAD…", full: true, area: true },
  { key: "Marca", label: "Marca", ph: "Lenovo" },
  { key: "Modelo", label: "Modelo", ph: "ThinkPad X1 Carbon Gen 9" },
  { key: "Procesador", label: "Procesador", ph: "Core i7 1185G7" },
  { key: "Generación", label: "Generación", ph: "11" },
  { key: "RAM", label: "RAM", ph: "16GB" },
  { key: "Almacenamiento", label: "Almacenamiento", ph: "512GB NVMe" },
  { key: "Estado", label: "Estado", ph: "Grado A" },
  { key: "Precio", label: "Precio", ph: "1800000", num: true },
  { key: "Stock", label: "Stock", ph: "1", num: true },
  { key: "Foto", label: "Fotos (la primera es la portada)", ph: "https://res.cloudinary.com/…", full: true, area: true },
  { key: "Video", label: "Video — URL", ph: "https://drive.google.com/file/d/…/view", full: true, area: true },
];

export const EMPTY = { ...Object.fromEntries(FIELDS.map((c) => [c.key, ""])), Oculto: "" };

// ¿Está oculto de la tienda web? (columna "Oculto")
export const HIDDEN_VALUES = ["sí", "si", "true", "1", "x", "oculto", "yes", "y"];

const txt = (r, k) => (r?.[k] ?? "").toString().trim();

// Campos editables de una fila del catálogo.
export function camposDe(r) {
  const fields = {};
  for (const c of FIELDS) fields[c.key] = txt(r, c.key);
  fields["Oculto"] = txt(r, "Oculto");
  return fields;
}

// Aviso que el formulario deja para mostrarlo en el listado al volver.
export const CLAVE_AVISO = "vv-productos-aviso";
