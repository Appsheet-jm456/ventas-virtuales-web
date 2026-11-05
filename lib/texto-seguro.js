// «Texto seguro» (HU-29, también para las políticas de HU-26): lo que escribe el dueño se
// convierte en bloques simples, nunca en HTML. Admite:
//   párrafos separados por una línea en blanco · «## Subtítulo» · «- elemento» de lista ·
//   **negrita** dentro de cualquier línea.
// Devuelve datos; el componente TextoSeguro los dibuja con React, que escapa todo el texto.

// Líneas -> [{ tipo: "p" | "h" | "ul", partes | items }]
export function bloquesDe(texto) {
  const lineas = String(texto ?? "").replace(/\r\n?/g, "\n").split("\n");
  const bloques = [];
  let parrafo = [], lista = null;
  const cerrarParrafo = () => { if (parrafo.length) bloques.push({ tipo: "p", partes: enLinea(parrafo.join(" ")) }); parrafo = []; };
  const cerrarLista = () => { if (lista) bloques.push({ tipo: "ul", items: lista }); lista = null; };
  for (const cruda of lineas) {
    const l = cruda.trim();
    if (!l) { cerrarParrafo(); cerrarLista(); continue; }
    const h = l.match(/^#{2,3}\s+(.+)$/);
    const li = l.match(/^[-•*]\s+(.+)$/);
    if (h) { cerrarParrafo(); cerrarLista(); bloques.push({ tipo: "h", partes: enLinea(h[1]) }); }
    else if (li) { cerrarParrafo(); (lista ||= []).push(enLinea(li[1])); }
    else { cerrarLista(); parrafo.push(l); }
  }
  cerrarParrafo(); cerrarLista();
  return bloques;
}

// «Texto con **negrita**» -> [{ t, b }]. Un ** sin pareja se deja como texto.
export function enLinea(t) {
  const partes = [];
  const re = /\*\*(.+?)\*\*/g;
  let i = 0, m;
  while ((m = re.exec(t))) {
    if (m.index > i) partes.push({ t: t.slice(i, m.index) });
    partes.push({ t: m[1], b: true });
    i = re.lastIndex;
  }
  if (i < t.length) partes.push({ t: t.slice(i) });
  return partes;
}

// Texto sin marcas, para metadatos o resúmenes.
export const textoPlano = (t) => String(t ?? "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/^\s*(#{2,3}|[-•*])\s+/gm, "").replace(/\s+/g, " ").trim();
