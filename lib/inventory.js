// Acceso a Baserow (misma tabla que InventarIA): lectura pública del catálogo
// y escritura para el panel de administración.

// Inventario de ejemplo para MODO DEMO (cuando Baserow no está configurado).
const SAMPLE_INVENTORY = [
  { _id: 1, "Código": "PU-001", "Categoría": "Portátil usado", "Marca": "Lenovo", "Modelo": "ThinkPad T480", "Procesador": "Core i5 8350U", "Generación": "8", "RAM": "16GB", "Almacenamiento": "256GB SSD", "Estado": "Grado A", "Precio": 1150000, "Stock": 3, "Descripción": "Equipo corporativo, batería buena, teclado retroiluminado.", "Foto": "", "Video": "" },
  { _id: 2, "Código": "PU-002", "Categoría": "Portátil usado", "Marca": "Dell", "Modelo": "Latitude 7420", "Procesador": "Core i7 1185G7", "Generación": "11", "RAM": "16GB", "Almacenamiento": "256GB SSD", "Estado": "Grado A", "Precio": 1599000, "Stock": 1, "Descripción": "Portátil empresarial premium de 14 pulgadas.", "Foto": "", "Video": "" },
  { _id: 3, "Código": "ACC-058", "Categoría": "Accesorios", "Marca": "Genérico", "Modelo": "Cargador USB-C 65W", "Procesador": "", "Generación": "", "RAM": "", "Almacenamiento": "", "Estado": "Nuevo", "Precio": 75000, "Stock": 0, "Descripción": "Carga rápida para portátiles modernos.", "Foto": "", "Video": "" },
];

function fieldToText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value.map((v) => (v && typeof v === "object" ? (v.url ?? v.value ?? "") : v)).filter(Boolean).join(", ");
  }
  if (typeof value === "object") return value.value ?? "";
  return value;
}

// Aplana una fila de Baserow. Conserva el id como _id (necesario para editar/eliminar).
export function flattenRow(row) {
  const out = { _id: row.id };
  for (const [key, value] of Object.entries(row)) {
    if (["id", "order"].includes(key)) continue;
    out[key] = fieldToText(value);
  }
  return out;
}

function baserowConfig() {
  const token = process.env.BASEROW_API_TOKEN;
  const tableId = process.env.BASEROW_TABLE_ID;
  const base = process.env.BASEROW_API_URL || "https://api.baserow.io";
  const ok = token && tableId && token !== "tu_token_de_baserow";
  return { token, tableId, base, ok };
}

async function fetchRawRows() {
  const { token, tableId, base } = baserowConfig();
  let rows = [];
  let page = 1;
  const size = 200;
  while (page <= 20) {
    const url = `${base}/api/database/rows/table/${tableId}/?user_field_names=true&size=${size}&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Token ${token}` }, cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Baserow respondió ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    rows = rows.concat(data.results || []);
    if (!data.next) break;
    page++;
  }
  return rows;
}

// Catálogo completo (aplanado). demo=true cuando Baserow no está configurado.
export async function getInventory() {
  const { ok } = baserowConfig();
  if (!ok) return { rows: SAMPLE_INVENTORY, demo: true };
  const rows = await fetchRawRows();
  return { rows: rows.map(flattenRow), demo: false };
}

// Crea una fila nueva (POST). `fields` usa nombres de columna con tildes.
export async function createRow(fields) {
  const { token, tableId, base, ok } = baserowConfig();
  if (!ok) throw new Error("Baserow no está configurado (faltan token/tabla).");
  const url = `${base}/api/database/rows/table/${tableId}/?user_field_names=true`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Baserow ${res.status}: ${text.slice(0, 250)}`);
  }
  return res.json();
}

// Actualiza una fila existente (PATCH) por su id de Baserow.
export async function updateRow(rowId, fields) {
  const { token, tableId, base, ok } = baserowConfig();
  if (!ok) throw new Error("Baserow no está configurado (faltan token/tabla).");
  const url = `${base}/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Baserow ${res.status}: ${text.slice(0, 250)}`);
  }
  return res.json();
}

// Elimina una fila por su id de Baserow. El token necesita permiso Delete.
export async function deleteRow(rowId) {
  const { token, tableId, base, ok } = baserowConfig();
  if (!ok) throw new Error("Baserow no está configurado (faltan token/tabla).");
  const url = `${base}/api/database/rows/table/${tableId}/${rowId}/`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Baserow ${res.status}: ${text.slice(0, 250)}`);
  }
  return true;
}
