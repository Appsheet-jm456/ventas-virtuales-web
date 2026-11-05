// Ficha técnica del producto (HU-27): lista ordenada de { campo, valor } en texto plano.
// Se usa en el panel (formulario y CSV) y en el servidor; no importa nada del servidor.

export const FICHA_MAX_FILAS = 40;
export const FICHA_MAX_CAMPO = 60;
export const FICHA_MAX_VALOR = 300;

// Nombres que propone el campo «Característica»; se puede escribir cualquier otro.
export const SUGERENCIAS = [
  "Marca / Modelo", "Procesador", "Memoria RAM", "Almacenamiento", "Pantalla", "Gráficos",
  "Conectividad", "Ethernet", "Puertos", "Batería", "Sistema operativo", "Teclado", "Cámara",
  "Audio", "Lector de huella", "Peso", "Dimensiones", "Color", "Cargador", "Garantía",
];

// «Usar plantilla de portátil»: filas típicas vacías para rellenar.
export const PLANTILLA_PORTATIL = [
  "Marca / Modelo", "Procesador", "Memoria RAM", "Almacenamiento", "Pantalla", "Gráficos",
  "Conectividad", "Ethernet", "Puertos", "Batería", "Sistema operativo", "Teclado", "Cámara", "Peso",
];

const texto = (v) => String(v ?? "").replace(/\s+/g, " ").trim();

// Valida y limpia la lista. Descarta las filas sin valor (p. ej. las de la plantilla que no se
// llenaron); un valor sin característica sí es un error.
// Devuelve { ficha } o { error } con un mensaje para el dueño.
export function validarFicha(lista) {
  if (lista == null || lista === "") return { ficha: [] };
  if (!Array.isArray(lista)) return { error: "La ficha técnica no tiene el formato esperado." };
  const ficha = [];
  for (const fila of lista) {
    const campo = texto(fila?.campo), valor = texto(fila?.valor);
    if (!valor) continue;
    const n = ficha.length + 1;
    if (!campo) return { error: `Ficha técnica: falta la característica del valor «${valor.slice(0, 40)}» (por ejemplo, Pantalla).` };
    if (campo.length > FICHA_MAX_CAMPO) return { error: `Ficha técnica, fila ${n}: la característica es muy larga (máximo ${FICHA_MAX_CAMPO} caracteres).` };
    if (valor.length > FICHA_MAX_VALOR) return { error: `Ficha técnica, fila ${n} («${campo}»): el valor es muy largo (máximo ${FICHA_MAX_VALOR} caracteres).` };
    ficha.push({ campo, valor });
  }
  if (ficha.length > FICHA_MAX_FILAS) return { error: `La ficha técnica tiene ${ficha.length} filas; el máximo es ${FICHA_MAX_FILAS}.` };
  return { ficha };
}

// Columna «Ficha» del CSV: «Pantalla=14" HD; Gráficos=Intel UHD 620». Solo el primer «=» separa.
export function fichaDesdeTexto(t) {
  return String(t ?? "").split(";").map((par) => {
    const i = par.indexOf("=");
    return i < 0 ? { campo: par, valor: "" } : { campo: par.slice(0, i), valor: par.slice(i + 1) };
  }).filter((x) => texto(x.campo) || texto(x.valor));
}

// Para exportar o mostrar en una celda.
export const fichaATexto = (ficha) => (Array.isArray(ficha) ? ficha : []).map((x) => `${x.campo}=${x.valor}`).join("; ");

// Lo que llega de la base: siempre una lista de pares con texto.
export function fichaDe(v) {
  return (Array.isArray(v) ? v : [])
    .map((x) => ({ campo: texto(x?.campo), valor: texto(x?.valor) }))
    .filter((x) => x.campo && x.valor);
}
