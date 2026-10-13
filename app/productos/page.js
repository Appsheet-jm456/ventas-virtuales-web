import { Suspense } from "react";
import Link from "next/link";
import { getPublicInventory } from "../../lib/inventory";
import { SITE } from "../../lib/site";
import Catalog from "../components/Catalog";

export const revalidate = 60;

export const metadata = {
  title: `Productos — ${SITE.nombre}`,
  description: "Catálogo de portátiles corporativos, torres tiny, partes y accesorios, nuevos y usados, con garantía.",
};

export default async function ProductosPage() {
  let rows = [];
  let demo = false;
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
        <Catalog rows={rows} demo={demo} />
      </Suspense>
    </main>
  );
}
