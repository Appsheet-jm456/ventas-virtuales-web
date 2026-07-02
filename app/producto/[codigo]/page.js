import Link from "next/link";
import { getPublicInventory } from "../../../lib/inventory";
import { parseImages, parseVideos } from "../../../lib/images";
import { SITE, waLink } from "../../../lib/site";
import Gallery from "../../components/Gallery";

export const revalidate = 60;

const f = (r, k) => (r?.[k] ?? "").toString().trim();
const stockNum = (r) => parseInt(f(r, "Stock") || "0", 10) || 0;

function fmtPrecio(r) {
  const n = Number(f(r, "Precio").replace(/[^\d.-]/g, ""));
  return !isNaN(n) && n > 0 ? `$${n.toLocaleString("es-CO")}` : "";
}

async function findProduct(codigo) {
  const target = decodeURIComponent(codigo).trim().toLowerCase();
  const { rows } = await getPublicInventory();
  return rows.find((r) => f(r, "Código").toLowerCase() === target) || null;
}

export async function generateMetadata({ params }) {
  const r = await findProduct(params.codigo);
  if (!r) return { title: `Producto no encontrado — ${SITE.nombre}` };
  const nombre = [f(r, "Marca"), f(r, "Modelo")].filter(Boolean).join(" ") || f(r, "Código");
  return {
    title: `${nombre} — ${SITE.nombre}`,
    description: f(r, "Descripción").slice(0, 150) || `Compra ${nombre} en ${SITE.nombre}.`,
  };
}

const SPECS = [
  ["Categoría", "Categoría"],
  ["Marca", "Marca"],
  ["Modelo", "Modelo"],
  ["Procesador", "Procesador"],
  ["Generación", "Generación"],
  ["RAM", "RAM"],
  ["Almacenamiento", "Almacenamiento"],
  ["Estado", "Estado"],
];

export default async function ProductPage({ params }) {
  const r = await findProduct(params.codigo);

  if (!r) {
    return (
      <main className="pd wrap">
        <div className="crumbs"><Link href="/">Inicio</Link> / Producto</div>
        <h1 className="section-title">Producto no encontrado</h1>
        <p className="section-sub">
          Es posible que ya no esté disponible. <Link href="/#catalogo">Ver el catálogo completo</Link> o{" "}
          <a href={waLink("Hola 👋, busco un producto que vi en su página y ya no aparece.")} target="_blank" rel="noopener noreferrer">
            pregúntanos por WhatsApp
          </a>.
        </p>
      </main>
    );
  }

  const nombre = [f(r, "Marca"), f(r, "Modelo")].filter(Boolean).join(" ")
    || f(r, "Descripción").slice(0, 60) || f(r, "Código");
  const sold = stockNum(r) <= 0;
  const precio = fmtPrecio(r);
  const msg = `Hola 👋, estoy interesado en el *${nombre}* (código ${f(r, "Código")}) que vi en su página web. ¿Está disponible?`;

  return (
    <main className="pd wrap">
      <div className="crumbs">
        <Link href="/">Inicio</Link> / <Link href="/#catalogo">Catálogo</Link> / {f(r, "Código")}
      </div>

      <div className="pd-grid">
        <Gallery images={parseImages(r)} videos={parseVideos(r)} alt={nombre} sold={sold} />

        <div className="pd-info">
          <h1>{nombre}</h1>
          <div className="pd-code">Ref: {f(r, "Código")}</div>

          {precio
            ? <div className="pd-price">{precio}</div>
            : <div className="pd-price tbd">Precio: consultar por WhatsApp</div>}
          <div className="pd-disp">
            {sold
              ? <span className="badge bad">AGOTADO</span>
              : <span className="badge ok">Disponible ({stockNum(r)})</span>}
          </div>

          <table className="specs">
            <tbody>
              {SPECS.map(([label, key]) =>
                f(r, key) ? (
                  <tr key={key}>
                    <th>{label}</th>
                    <td>{f(r, key)}</td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>

          {f(r, "Descripción") && <div className="pd-desc">{f(r, "Descripción")}</div>}

          {sold ? (
            <>
              <span className="btn-wa off">Producto agotado</span>
              <p className="pd-note">
                ¿Te interesa uno igual?{" "}
                <a href={waLink(`Hola 👋, el *${nombre}* (código ${f(r, "Código")}) aparece agotado. ¿Tienen uno similar?`)} target="_blank" rel="noopener noreferrer">
                  Pregúntanos por WhatsApp
                </a>
              </p>
            </>
          ) : (
            <>
              <a className="btn-wa" href={waLink(msg)} target="_blank" rel="noopener noreferrer">
                💬 Estoy interesado — WhatsApp
              </a>
              <p className="pd-note">Te atendemos por WhatsApp: {SITE.whatsappDisplay} · {SITE.ciudad}</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
