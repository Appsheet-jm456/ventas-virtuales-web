import Link from "next/link";
import { getPublicInventory } from "../../lib/inventory";
import { waLink } from "../../lib/site";
import { getSite } from "../../lib/configuracion";
import { getBannersPublicos } from "../../lib/banners";
import { enCategoria, stockNum, precioNum } from "../../lib/productos";
import { getCategoriasPublicas } from "../../lib/categorias";
import HeroCarousel from "../components/HeroCarousel";
import CategoryStrip from "../components/CategoryStrip";
import ProductCard from "../components/ProductCard";
import Rail from "../components/Rail";

// El Inicio se refresca cada 60 s (lee Baserow en el servidor).
export const revalidate = 60;

// Línea de productos del Inicio (HU-04): una sola fila que se desplaza, con un banner a la izquierda.
const LINEA = {
  titulo: "Portátiles corporativos",
  filtro: "portatil",          // categorías que contienen esta palabra (sin tildes)
  boton: "Más portátiles",
  max: 12,
  promo: { linea1: "Portátiles", linea2: "corporativos", linea3: "nuevos y usados", nota: "Con garantía" },
};

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

  const [categorias, site, banners] = await Promise.all([getCategoriasPublicas(rows), getSite(), getBannersPublicos()]);
  const disponibles = rows.filter((r) => enCategoria(r, LINEA.filtro) && stockNum(r) > 0);
  const linea = disponibles.slice(0, LINEA.max);
  const precios = disponibles.map(precioNum).filter((n) => n && n > 0);
  const desde = precios.length ? Math.min(...precios) : null;

  return (
    <main>
      <div className="wrap hc-wrap">
        <HeroCarousel banners={banners} whatsapp={site.whatsapp} />
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
            <Link className="btn-more" href={`/productos?categoria=${LINEA.filtro}`}>{LINEA.boton} <span aria-hidden="true">›</span></Link>
          </div>
          <div className="line">
            <Link className="line-promo" href={`/productos?categoria=${LINEA.filtro}`}>
              <span className="lp-1">{LINEA.promo.linea1}</span>
              <span className="lp-2">{LINEA.promo.linea2}</span>
              <span className="lp-3">{LINEA.promo.linea3}</span>
              {desde && <span className="lp-desde">Desde ${desde.toLocaleString("es-CO")}</span>}
              <span className="lp-nota">{LINEA.promo.nota}</span>
            </Link>
            <Rail className="line-rail" label="portátiles">
              {linea.map((r, i) => <ProductCard key={(r["Código"] ?? "") + "-" + i} r={r} />)}
            </Rail>
          </div>
        </section>
      )}

      <section className="trust" aria-label="Por qué comprar con nosotros">
        <div className="wrap trust-in">
          <div className="trust-item"><span className="trust-ico" aria-hidden="true">🛡️</span><div><b>Garantía</b><small>En todos nuestros equipos</small></div></div>
          <div className="trust-item"><span className="trust-ico" aria-hidden="true">🚚</span><div><b>Envíos nacionales</b><small>A todo el país</small></div></div>
          <div className="trust-item"><span className="trust-ico" aria-hidden="true">📍</span><div><b>Tienda física</b><small>{site.ciudad}</small></div></div>
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
            href={waLink("Hola 👋, estoy buscando un equipo y no lo encontré en el catálogo.", site.whatsapp)}
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
