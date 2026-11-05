// «Te pueden interesar» (HU-30): equipos parecidos al que se está viendo, por reglas simples y
// sin datos del visitante. Misma categoría → misma marca → precio cercano (±30 %) → generación
// cercana; los disponibles primero. Corre en el servidor con el catálogo público que la ficha ya carga.
import { f, norm, precioNum, stockNum } from "./productos";

export const MAX_SUGERIDOS = 12;

const gen = (r) => parseInt(f(r, "Generación"), 10) || null;
const enStock = (r) => stockNum(r) > 0;

// Puntaje de parecido de `r` con el producto `base`. Mayor = más parecido.
function parecido(base, r) {
  let p = 0;
  const marca = norm(f(base, "Marca"));
  if (marca && marca === norm(f(r, "Marca"))) p += 3;
  const a = precioNum(base), b = precioNum(r);
  if (a && b) {
    const d = Math.abs(a - b) / a;
    if (d <= 0.3) p += 3 + (1 - d / 0.3); // dentro de ±30 %: más puntos cuanto más cerca
  }
  const ga = gen(base), gb = gen(r);
  if (ga && gb) { const d = Math.abs(ga - gb); if (d <= 1) p += 2 - d * 0.5; }
  return p;
}

// Devuelve hasta `max` filas del catálogo (nunca la actual): disponibles primero y, dentro de
// cada grupo, los más parecidos. Si el producto no tiene categoría, compara con todo el catálogo.
export function sugeridosDe(rows, actual, max = MAX_SUGERIDOS) {
  const codigo = f(actual, "Código");
  const cat = norm(f(actual, "Categoría"));
  const candidatos = rows.filter((r) => f(r, "Código") !== codigo && (!cat || norm(f(r, "Categoría")) === cat));
  return candidatos
    .map((r) => ({ r, p: parecido(actual, r), d: enStock(r) ? 0 : 1 }))
    .sort((x, y) => x.d - y.d || y.p - x.p || f(x.r, "Código").localeCompare(f(y.r, "Código")))
    .slice(0, max)
    .map((x) => x.r);
}
