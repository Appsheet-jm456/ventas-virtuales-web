import { Suspense } from "react";
import Link from "next/link";
import { getPublicInventory } from "../../../lib/inventory";
import { getSite } from "../../../lib/configuracion";
import { waLink } from "../../../lib/site";
import { getCategoriasMenu } from "../../../lib/categorias";
import Catalog from "../../components/Catalog";

export const revalidate = 60;

export async function generateMetadata() {
  const site = await getSite();
  return {
    title: `Productos — ${site.nombre}`,
    description: "Catálogo de portátiles corporativos, torres tiny, partes y accesorios, nuevos y usados, con garantía.",
  };
}

export default async function ProductosPage() {
  let rows = [];
  let demo = false;
  const [categorias, site] = await Promise.all([getCategoriasMenu(), getSite()]);
  const waHref = waLink("Hola 👋, busco un equipo y no lo encontré en el catálogo de la página. ¿Me ayudan?", site.whatsapp);
  try {
    const inv = await getPublicInventory();
    rows = inv.rows;
    demo = inv.demo;
  } catch {
    rows = [];
  }
  return (
    <main>
      <div className="wrap crumbs crumbs-top"><Link href="/">Inicio</Link> / Productos</div>
      {/* Catalog lee ?q= y ?categoria= de la URL: necesita Suspense para que la página siga siendo estática. */}
      <Suspense fallback={<div className="wrap empty-msg">Cargando productos…</div>}>
        <Catalog rows={rows} demo={demo} categoriasAdmin={categorias} mostrarPrecios={site.catalogo?.mostrar_precios !== false} waHref={waHref} />
      </Suspense>
    </main>
  );
}
