import Link from "next/link";
import { getPublicInventory } from "../../../../lib/inventory";
import { parseImages, parseVideos } from "../../../../lib/images";
import { waLink } from "../../../../lib/site";
import { getSite, mensajeProducto } from "../../../../lib/configuracion";
import Gallery from "../../../components/Gallery";
import { fichaDe } from "../../../../lib/ficha";
import { textoPlano } from "../../../../lib/texto-seguro";
import TextoSeguro, { LineaSegura } from "../../../components/TextoSeguro";

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
  const [r, site] = await Promise.all([findProduct(params.codigo), getSite()]);
  if (!r) return { title: `Producto no encontrado — ${site.nombre}` };
  const nombre = [f(r, "Marca"), f(r, "Modelo")].filter(Boolean).join(" ") || f(r, "Código");
  return {
    title: `${nombre} — ${site.nombre}`,
    description: (textoPlano(f(r, "Resumen")) || f(r, "Descripción")).slice(0, 150) || `Compra ${nombre} en ${site.nombre}.`,
  };
}

// Íconos de la fila de datos clave (HU-29), trazo de 24×24.
const ICONOS = {
  cpu: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  ram: <><rect x="3" y="7" width="18" height="10" rx="1.5" /><path d="M7 7v10M11 7v10M15 7v10M3 20h18" /></>,
  disco: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="15.5" cy="12" r="3" /><path d="M7 9h2M7 15h2" /></>,
  pantalla: <><rect x="2" y="4" width="20" height="13" rx="1.5" /><path d="M8 21h8M12 17v4" /></>,
};
const Ico = ({ d }) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const sinTilde = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

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
  const [r, site] = await Promise.all([findProduct(params.codigo), getSite()]);
  const wa = (texto) => waLink(texto, site.whatsapp);

  if (!r) {
    return (
      <main className="pd wrap">
        <div className="crumbs"><Link href="/">Inicio</Link> / Producto</div>
        <h1 className="section-title">Producto no encontrado</h1>
        <p className="section-sub">
          Es posible que ya no esté disponible. <Link href="/productos">Ver el catálogo completo</Link> o{" "}
          <a href={wa("Hola 👋, busco un producto que vi en su página y ya no aparece.")} target="_blank" rel="noopener noreferrer">
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
  const msg = mensajeProducto(site.mensajeProducto, nombre, f(r, "Código"));
  const ficha = fichaDe(r.Ficha);
  const valorFicha = (palabra) => ficha.find((x) => sinTilde(x.campo).includes(palabra))?.valor || "";
  const generacion = f(r, "Generación");
  const datos = [
    ["cpu", "Procesador", [f(r, "Procesador"), generacion && !/gen/i.test(f(r, "Procesador")) ? `${generacion}ª Gen` : ""].filter(Boolean).join(" ")],
    ["ram", "Memoria RAM", f(r, "RAM")],
    ["disco", "Almacenamiento", f(r, "Almacenamiento")],
    ["pantalla", "Pantalla", valorFicha("pantalla")],
  ].filter((x) => x[2]);
  const resumen = f(r, "Resumen");
  const detalleTitulo = f(r, "Título descripción");
  const detalle = f(r, "Descripción larga");

  return (
    <main className="pd wrap">
      <div className="crumbs">
        <Link href="/">Inicio</Link> / <Link href="/productos">Productos</Link> / {f(r, "Categoría") ? <><Link href={`/productos?categoria=${encodeURIComponent(f(r, "Categoría"))}`}>{f(r, "Categoría")}</Link> / </> : null}{f(r, "Código")}
      </div>

      <div className="pd-grid">
        <Gallery images={parseImages(r)} videos={parseVideos(r)} alt={nombre} sold={sold} />

        <div className="pd-info">
          {f(r, "Estado") && <span className="pd-insignia">{f(r, "Estado")}</span>}
          <h1>{nombre}</h1>
          <div className="pd-code">Ref: {f(r, "Código")}</div>
          {resumen && <p className="pd-resumen"><LineaSegura texto={resumen} /></p>}
          {datos.length > 0 && (
            <ul className="pd-datos" aria-label="Datos clave">
              {datos.map(([ico, etiqueta, valor]) => (
                <li key={ico} title={etiqueta}><Ico d={ICONOS[ico]} /><span><span className="sr-only">{etiqueta}: </span>{valor}</span></li>
              ))}
            </ul>
          )}

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
                <a href={wa(`Hola 👋, el *${nombre}* (código ${f(r, "Código")}) aparece agotado. ¿Tienen uno similar?`)} target="_blank" rel="noopener noreferrer">
                  Pregúntanos por WhatsApp
                </a>
              </p>
            </>
          ) : (
            <>
              <a className="btn-wa" href={wa(msg)} data-producto={f(r, "Código")} target="_blank" rel="noopener noreferrer">
                💬 Estoy interesado — WhatsApp
              </a>
              <p className="pd-note">Te atendemos por WhatsApp: {site.whatsappDisplay} · {site.ciudad}</p>
            </>
          )}
        </div>
      </div>

      {/* Descripción ampliada (HU-29): texto seguro dibujado con React, sin HTML del dueño. */}
      {(detalleTitulo || detalle) && (
        <section className="pd-detalle" aria-labelledby={detalleTitulo ? "pd-detalle-t" : undefined} aria-label={detalleTitulo ? undefined : "Descripción"}>
          <span className="pd-chip">Descripción</span>
          {detalleTitulo && <h2 id="pd-detalle-t">{detalleTitulo}</h2>}
          <TextoSeguro texto={detalle} className="pd-detalle-txt" />
        </section>
      )}

      {/* Ficha técnica completa (HU-27): la carga el dueño en /admin/productos. Texto plano: React
          escapa todo, no se interpreta HTML. Sin filas, el bloque no existe. */}
      {ficha.length > 0 && (
        <section className="pd-ficha" aria-labelledby="pd-ficha-t">
          <h2 id="pd-ficha-t">Ficha técnica completa</h2>
          <table className="pd-ficha-tabla">
            <tbody>
              {ficha.map((x, i) => (
                <tr key={i}>
                  <th scope="row">{x.campo}</th>
                  <td>{x.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
