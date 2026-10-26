// Página «Nosotros» (HU-33): partes puras (límites, plantilla y validación). Sin acceso a la base,
// para usarlas también en el editor del panel. Se guarda en `configuracion` con la clave `nosotros`.

export const MAX = { titulo: 120, bloques: 12, tituloBloque: 150, texto: 5000, alt: 150, cifras: 6, valor: 20, etiqueta: 60 };
export const POSICIONES = ["derecha", "izquierda"];

// Lo que ve el editor la primera vez: estructura sugerida, sin publicar.
export const PLANTILLA = {
  visible: false,
  titulo: "Nosotros",
  bloques: [
    { titulo: "Quiénes somos", texto: "En **[nombre de la empresa]** ayudamos a personas y empresas a acceder a tecnología confiable, con equipos corporativos nuevos y usados, garantía y atención real antes, durante y después de la compra.", imagen: "", alt: "", posicion: "derecha" },
    { titulo: "Nuestra historia y años en el mercado", texto: "Empezamos en **[año]** en [ciudad]. Desde entonces hemos entregado **[número]** equipos a clientes de todo el país.", imagen: "", alt: "", posicion: "izquierda" },
    { titulo: "Por qué elegirnos", texto: "- Equipos revisados y probados por nuestro equipo técnico\n- Garantía en todos los equipos\n- Envíos a todo el país\n- Asesoría por WhatsApp", imagen: "", alt: "", posicion: "derecha" },
    { titulo: "Nuestro equipo", texto: "Detrás de cada equipo hay personas que lo revisan, lo preparan y te acompañan en la compra.", imagen: "", alt: "", posicion: "izquierda" },
  ],
  cifras: [
    { valor: "+[N] años", etiqueta: "en el mercado" },
    { valor: "+[N]", etiqueta: "equipos entregados" },
    { valor: "100 %", etiqueta: "equipos con garantía" },
  ],
};

const texto = (v) => String(v ?? "").replace(/\r\n?/g, "\n").trim();
const linea = (v) => texto(v).replace(/\s+/g, " ");

// Valida lo que llega del panel. `esPropia(url)` dice si una foto es de la cuenta del panel.
// Devuelve { nosotros } limpio o { error } con un mensaje para el dueño.
export function validarNosotros(d = {}, esPropia = () => true) {
  const titulo = linea(d.titulo) || "Nosotros";
  if (titulo.length > MAX.titulo) return { error: `El título es muy largo (máximo ${MAX.titulo} caracteres).` };
  if (!Array.isArray(d.bloques) || !Array.isArray(d.cifras ?? [])) return { error: "Los datos de la página no tienen el formato esperado." };
  const bloques = [];
  for (const b of d.bloques) {
    const t = linea(b?.titulo), x = texto(b?.texto), imagen = texto(b?.imagen), alt = linea(b?.alt);
    if (!t && !x && !imagen) continue;
    const n = bloques.length + 1;
    if (!t) return { error: `El bloque ${n} no tiene título.` };
    if (t.length > MAX.tituloBloque) return { error: `El título del bloque ${n} es muy largo (máximo ${MAX.tituloBloque}).` };
    if (x.length > MAX.texto) return { error: `El texto de «${t}» es muy largo (máximo ${MAX.texto} caracteres).` };
    if (imagen && !esPropia(imagen)) return { error: `La foto de «${t}» debe subirse desde el panel.` };
    if (imagen && !alt) return { error: `Describe la foto de «${t}» (texto alternativo), para quien no puede verla.` };
    if (alt.length > MAX.alt) return { error: `El texto alternativo de «${t}» es muy largo (máximo ${MAX.alt}).` };
    bloques.push({ titulo: t, texto: x, imagen, alt: imagen ? alt : "", posicion: POSICIONES.includes(b?.posicion) ? b.posicion : "derecha" });
  }
  if (bloques.length > MAX.bloques) return { error: `La página tiene ${bloques.length} bloques; el máximo es ${MAX.bloques}.` };
  const cifras = [];
  for (const c of d.cifras || []) {
    const valor = linea(c?.valor), etiqueta = linea(c?.etiqueta);
    if (!valor && !etiqueta) continue;
    if (!valor || !etiqueta) return { error: "Cada cifra necesita el número y su texto (p. ej. «+10 años» · «en el mercado»)." };
    if (valor.length > MAX.valor || etiqueta.length > MAX.etiqueta) return { error: `Una cifra es muy larga (número hasta ${MAX.valor} y texto hasta ${MAX.etiqueta} caracteres).` };
    cifras.push({ valor, etiqueta });
  }
  if (cifras.length > MAX.cifras) return { error: `Hay ${cifras.length} cifras; el máximo es ${MAX.cifras}.` };
  if (d.visible === true && !bloques.length) return { error: "Agrega al menos un bloque antes de publicar la página." };
  return { nosotros: { visible: d.visible === true, titulo, bloques, cifras } };
}

// Fotos que usa la página (para saber cuáles se dejaron de usar).
export const fotosDe = (n) => (n?.bloques || []).map((b) => b.imagen).filter(Boolean);
