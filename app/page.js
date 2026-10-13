import Link from "next/link";
import { getPublicInventory } from "../lib/inventory";
import { SITE, waLink } from "../lib/site";
import { categoriasDe, enCategoria, stockNum } from "../lib/productos";
import HeroCarousel from "./components/HeroCarousel";
import CategoryStrip from "./components/CategoryStrip";
import ProductCard from "./components/ProductCard";

// El Inicio se refresca cada 60 s (lee Baserow en el servidor).
export const revalidate = 60;

const LINEA = { titulo: "Portátiles corporativos", filtro: "portatil", max: 8 }; // HU-04

export default async function Home() {
  let rows = [];
  let demo = false;
  try {
    const inv = await getPublicInventory();
    rows = inv.rows;
    demo = inv.demo;
  } catch {
    rows = [];
  }

  const categorias = categoriasDe(rows);
  const linea = rows.filter((r) => enCategoria(r, LINEA.filtro) && stockNum(r) > 0).slice(0, LINEA.max);

  return (
    <main>
      <div className="wrap hc-wrap">
        <HeroCarousel />
      </div>

      {demo && (
        <div className="wrap home-demo">
          <div className="demo-note">
            Modo demo: productos e imágenes de ejemplo. Configura Baserow para ver el inventario real.
          </div>
        </div>
      )}

      {categorias.length > 0 && (
        <section className="wrap home-sec">
          <div className="sec-head">
            <h2 className="section-title">Categorías</h2>
            <Link className="sec-more" href="/categorias">Ver todas →</Link>
          </div>
          <CategoryStrip categorias={categorias} />
        </section>
      )}

      {linea.length > 0 && (
        <section className="wrap home-sec">
          <div className="sec-head">
            <h2 className="section-title">{LINEA.titulo}</h2>
            <Link className="sec-more" href={`/productos?categoria=${LINEA.filtro}`}>Ver todos →</Link>
          </div>
          <div className="grid">
            {linea.map((r, i) => <ProductCard key={(r["Código"] ?? "") + "-" + i} r={r} />)}
          </div>
        </section>
      )}

      <section className="trust" aria-label="Por qué comprar con nosotros">
        <div className="wrap trust-in">
          <div className="trust-item"><span className="trust-ico" aria-hidden="true">🛡️</span><div><b>Garantía</b><small>En todos nuestros equipos</small></div></div>
          <div className="trust-item"><span className="trust-ico" aria-hidden="true">🚚</span><div><b>Envíos nacionales</b><small>A todo el país</small></div></div>
          <div className="trust-item"><span className="trust-ico" aria-hidden="true">📍</span><div><b>Tienda física</b><small>{SITE.ciudad}</small></div></div>
          <div className="trust-item"><span className="trust-ico" aria-hidden="true">💬</span><div><b>Asesoría directa</b><small>Por WhatsApp</small></div></div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-in">
          <div>
            <h2>¿No encuentras el equipo que buscas?</h2>
            <p>Cuéntanos qué necesitas y un asesor te ayuda a conseguirlo, con envío a todo el país.</p>
          </div>
          <a
            className="btn-hero wa"
            href={waLink("Hola 👋, estoy buscando un equipo y no lo encontré en el catálogo.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Escribir a un asesor
          </a>
        </div>
      </section>
    </main>
  );
}
