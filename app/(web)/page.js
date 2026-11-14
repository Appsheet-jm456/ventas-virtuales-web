import Link from "next/link";
import { getPublicInventory } from "../../lib/inventory";
import { waLink } from "../../lib/site";
import { getSite } from "../../lib/configuracion";
import { getBannersPublicos } from "../../lib/banners";
import { enCategoria, stockNum, precioNum } from "../../lib/productos";
import { getCategoriasPublicas, getMarcasBarra } from "../../lib/categorias";
import CategoriasLateral from "../components/CategoriasLateral";
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

// Beneficios de la franja bajo el banner (HU-38). El punto físico usa el texto de ubicación del panel.
const BENEFICIOS = (site) => [
  { titulo: "Compra segura", texto: "Asesoría especializada", icono: <><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></> },
  { titulo: "Garantía", texto: "Seguridad y respaldo", icono: <><circle cx="12" cy="9" r="6" /><path d="m9 14.5-1.5 6.5L12 19l4.5 2-1.5-6.5" /><path d="m9.8 9 1.6 1.6 2.8-3" /></> },
  { titulo: "Envíos nacionales", texto: "1 – 2 días hábiles", icono: <><path d="M2 6h11v9H2zM13 9h4l3 3v3h-7z" /><circle cx="6" cy="17" r="2" /><circle cx="16.5" cy="17" r="2" /></> },
  { titulo: "Factura electrónica", texto: "IVA 19 %", icono: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></> },
  { titulo: "Punto físico en Cali", texto: site.catalogo?.ubicacion_texto || site.ciudad || "Tienda física", icono: <><path d="M3 10 5 4h14l2 6" /><path d="M4 10v10h16V10" /><path d="M3 10c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3" /><path d="M10 20v-5h4v5" /></> },
];

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

  const [categorias, site, banners, marcas] = await Promise.all([getCategoriasPublicas(rows), getSite(), getBannersPublicos(), getMarcasBarra()]);
  const disponibles = rows.filter((r) => enCategoria(r, LINEA.filtro) && stockNum(r) > 0);
  const linea = disponibles.slice(0, LINEA.max);
  const precios = disponibles.map(precioNum).filter((n) => n && n > 0);
  const desde = precios.length ? Math.min(...precios) : null;

  return (
    <main>
      {/* Categorías a la izquierda del banner, como la imagen del cliente (ajuste de HU-38). */}
      <div className={`wrap hc-wrap${categorias.length ? " hc-con-lateral" : ""}`}>
        <CategoriasLateral categorias={categorias} marcas={marcas} />
        <div className="hc-col"><HeroCarousel banners={banners} whatsapp={site.whatsapp} /></div>
      </div>

      {/* Franja de beneficios bajo el banner, como la imagen del cliente (HU-38). */}
      <section className="trust" aria-label="Por qué comprar con nosotros">
        <div className="wrap trust-in trust-5">
          {BENEFICIOS(site).map((b) => (
            <div className="trust-item" key={b.titulo}>
              <span className="trust-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{b.icono}</svg></span>
              <div><b>{b.titulo}</b><small>{b.texto}</small></div>
            </div>
          ))}
        </div>
      </section>

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
