import { getPublicInventory } from "../lib/inventory";
import { SITE, waLink } from "../lib/site";
import Catalog from "./components/Catalog";

// El catálogo se refresca cada 60 s (lee Baserow en el servidor).
export const revalidate = 60;

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

  return (
    <main>
      <section className="hero">
        <div className="wrap hero-in">
          <p className="kicker">Colombia · Equipos corporativos</p>
          <h1>Computadores corporativos nuevos y usados</h1>
          <p>
            Portátiles empresariales, torres tiny, partes y accesorios con garantía.
            Ventas online y tienda física en {SITE.ciudad}. Te asesoramos por WhatsApp.
          </p>
          <div className="hero-actions">
            <a className="btn-hero" href="#catalogo">Ver catálogo</a>
            <a
              className="btn-hero wa"
              href={waLink("Hola 👋, quiero información sobre sus computadores.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Hablar con un asesor
            </a>
          </div>
        </div>
      </section>

      <Catalog rows={rows} demo={demo} />
    </main>
  );
}
