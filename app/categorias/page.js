import Link from "next/link";
import { getPublicInventory } from "../../lib/inventory";
import { SITE } from "../../lib/site";
import { categoriasDe } from "../../lib/productos";
import { CategoryTile } from "../components/CategoryStrip";

export const revalidate = 60;

export const metadata = {
  title: `Categorías — ${SITE.nombre}`,
  description: "Portátiles, torres tiny, partes y accesorios. Elige una categoría y mira lo disponible.",
};

export default async function CategoriasPage() {
  let rows = [];
  try {
    rows = (await getPublicInventory()).rows;
  } catch {
    rows = [];
  }
  const categorias = categoriasDe(rows);

  return (
    <main className="wrap home-sec">
      <div className="crumbs"><Link href="/">Inicio</Link> / Categorías</div>
      <h1 className="section-title">Categorías</h1>
      <p className="section-sub">Elige una categoría para ver los productos disponibles.</p>
      {categorias.length
        ? <div className="cat-grid">{categorias.map((c) => <CategoryTile key={c.nombre} c={c} />)}</div>
        : <div className="empty-msg">Pronto publicaremos nuestras categorías.</div>}
    </main>
  );
}
